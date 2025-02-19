import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from '$lib/server/prisma';

export interface CraftingStep {
    stepNumber: number
    components: {
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
}

export async function calculateCraftingRequirements(itemId: number): Promise<CraftingResult> {
    const item = await prisma.items.findUnique({
        where: { id: itemId },
        include: {
            item_components_item_components_item_idToitems: {
                include: {
                    items_item_components_component_item_idToitems: {
                        include: {
                            item_components_item_components_item_idToitems: true
                        }
                    }
                }
            }
        }
    })

    if (!item) {
        throw new Error('Item not found')
    }

    let runningTotalCost = new Decimal(0)
    const result: CraftingResult = {
        totalCost: '0',
        totalTimeInMinutes: 0,
        totalTimeInDowntime: 0,
        steps: [],
        breakdown: []
    }

    // Function to collect components for a specific step
    async function collectComponentsForStep(
        components: typeof item.item_components_item_components_item_idToitems,
        stepNumber: number
    ) {
        const stepComponents = components.map((component: { items_item_components_component_item_idToitems: { name: any; }; quantity: any; }) => ({
            itemName: component.items_item_components_component_item_idToitems?.name || 'Unknown',
            quantity: component.quantity || 0
        }))

        if (stepComponents.length > 0) {
            result.steps.push({
                stepNumber,
                components: stepComponents
            })

            // Recursively check if these components have their own components
            for (const component of components) {
                const subComponents = component.items_item_components_component_item_idToitems
                    ?.item_components_item_components_item_idToitems
                if (subComponents && subComponents.length > 0) {
                    await collectComponentsForStep(subComponents, stepNumber + 1)
                }
            }
        }
    }

    // Start collecting components from step 1
    await collectComponentsForStep(item.item_components_item_components_item_idToitems, 1)

    // Calculate costs and times (keeping the original breakdown logic)
    if (item.cost_to_craft_in_credit) {
        runningTotalCost = runningTotalCost.plus(item.cost_to_craft_in_credit)
    }
    if (item.craft_time_in_minutes) {
        result.totalTimeInMinutes += item.craft_time_in_minutes
    }
    if (item.craft_time_in_downtime) {
        result.totalTimeInDowntime += item.craft_time_in_downtime
    }

    result.breakdown.push({
        itemName: item.name,
        quantity: 1,
        cost: (item.cost_to_craft_in_credit || new Decimal(0)).toString(),
        timeInMinutes: item.craft_time_in_minutes || 0,
        timeInDowntime: item.craft_time_in_downtime || 0
    })

    // Process component costs and times
    for (const component of item.item_components_item_components_item_idToitems) {
        const componentItem = component.items_item_components_component_item_idToitems
        if (componentItem && component.quantity) {
            const componentRequirements = await calculateCraftingRequirements(componentItem.id)

            const componentCost = new Decimal(componentRequirements.totalCost).mul(component.quantity)
            runningTotalCost = runningTotalCost.plus(componentCost)

            result.totalTimeInMinutes += componentRequirements.totalTimeInMinutes * component.quantity
            result.totalTimeInDowntime += componentRequirements.totalTimeInDowntime * component.quantity

            result.breakdown.push({
                itemName: componentItem.name,
                quantity: component.quantity,
                cost: componentCost.toString(),
                timeInMinutes: componentRequirements.totalTimeInMinutes * component.quantity,
                timeInDowntime: componentRequirements.totalTimeInDowntime * component.quantity
            })
        }
    }

    result.totalCost = runningTotalCost.toString()

    return result
}