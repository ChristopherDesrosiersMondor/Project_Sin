import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from '$lib/server/prisma';

export interface CraftingStep {
    stepComponentName: string
    stepNumber: number
    cost: string
    timeInMinutes: number
    timeInDowntime: number
    components: {
        itemName: string
        quantity: number
    }[]
}

export interface CraftingStepIntermediary {
    cost: Decimal
    timeInMinutes: number
    timeInDowntime: number
    baseComponents: {
        itemName: string
        quantity: number
    }[]
}

export interface CraftingResult {
    totalCost: string
    totalTimeInMinutes: number
    totalTimeInDowntime: number
    steps: CraftingStep[]
    breakdown: {
        itemName: string
        quantity: number
        cost: string
        timeInMinutes: number
        timeInDowntime: number
    }[]
    debug: string
}

export async function calculateCraftingRequirements(itemId: number): Promise<CraftingResult> {
    const result: CraftingResult = {
        totalCost: '0',
        totalTimeInMinutes: 0,
        totalTimeInDowntime: 0,
        steps: [],
        breakdown: [],
        debug: ''
    }

    // Map to track processed items and prevent infinite loops
    const processedItems = new Map<number, boolean>()

    async function processItem(itemId: number, multiplier: number = 1): Promise<CraftingStepIntermediary> {
        const item = await prisma.items.findUnique({
            where: { id: itemId },
            include: {
                item_components_item_components_item_idToitems: {
                    include: {
                        items_item_components_component_item_idToitems: true
                    }
                }
            }
        })

        if (!item) {
            result.debug += `Unknown item: ${itemId}; `
            return {
                cost: new Decimal(0),
                timeInMinutes: 0,
                timeInDowntime: 0,
                baseComponents: []
            }
        }

        // Check if we've already processed this item
        if (processedItems.get(itemId)) {
            return {
                cost: new Decimal(item.cost_to_craft_in_credit || 0),
                timeInMinutes: item.craft_time_in_minutes || 0,
                timeInDowntime: item.craft_time_in_downtime || 0,
                baseComponents: []
            }
        }

        processedItems.set(itemId, true)

        let stepCost = new Decimal(item.cost_to_craft_in_credit || 0)
        let stepComponentName = item.name
        let stepTimeInMinutes = item.craft_time_in_minutes || 0
        let stepTimeInDowntime = item.craft_time_in_downtime || 0
        let currentStepComponents = []
        let baseComponents = []

        for (const component of item.item_components_item_components_item_idToitems) {
            const componentItem = component.items_item_components_component_item_idToitems
            if (!componentItem) {
                result.debug += `Unknown component for item ${itemId}; `
                continue
            }

            const quantity = component.quantity || 0
            const subResult = await processItem(componentItem.id, quantity * multiplier)

            stepCost = stepCost.plus(subResult.cost.mul(quantity))
            stepTimeInMinutes += subResult.timeInMinutes * quantity
            stepTimeInDowntime += subResult.timeInDowntime * quantity

            if (subResult.baseComponents.length > 0) {
                // If component has subcomponents, add them to base components
                baseComponents.push(...subResult.baseComponents)
            } else {
                // If no subcomponents, this is a base component
                currentStepComponents.push({
                    itemName: componentItem.name,
                    quantity: quantity * multiplier
                })
                baseComponents.push({
                    itemName: componentItem.name,
                    quantity: quantity * multiplier
                })
            }
        }

        // Only create a step if there are components at this level
        if (currentStepComponents.length > 0) {
            result.steps.push({
                stepComponentName: stepComponentName,
                stepNumber: result.steps.length + 1,
                cost: stepCost.toString(),
                timeInMinutes: stepTimeInMinutes,
                timeInDowntime: stepTimeInDowntime,
                components: currentStepComponents
            })
        }

        return {
            cost: stepCost,
            timeInMinutes: stepTimeInMinutes,
            timeInDowntime: stepTimeInDowntime,
            baseComponents
        }
    }

    const finalResult = await processItem(itemId)

    result.totalCost = finalResult.cost.toString()
    result.totalTimeInMinutes = finalResult.timeInMinutes
    result.totalTimeInDowntime = finalResult.timeInDowntime

    // Add the main item to the breakdown
    const mainItem = await prisma.items.findUnique({ where: { id: itemId } })
    if (mainItem) {
        result.breakdown.push({
            itemName: mainItem.name,
            quantity: 1,
            cost: finalResult.cost.toString(),
            timeInMinutes: finalResult.timeInMinutes,
            timeInDowntime: finalResult.timeInDowntime
        })
    }

    return result
}