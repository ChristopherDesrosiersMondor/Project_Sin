import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { calculateCraftingRequirements } from '$lib/server/crafting';
import SuperJSON from 'superjson';
import type { itemModel } from '$lib/models/ItemModels';

// model items {
//     id                                                       Int               @id @default(autoincrement())
//     name                                                     String            @unique @db.VarChar(255)
//     prerequisites                                            String?
//     descriptions                                             String?
//     market_price                                             Decimal?          @db.Decimal
//     cost_to_craft_in_credit                                  Decimal?          @db.Decimal
//     craft_time_in_minutes                                    Int?
//     craft_time_in_downtime                                   Int?
//     max_per_downtime                                         Int?
//     location                                                 String?
//     malfunction                                              String?
//     salary                                                   Int?
//     prop_description                                         String?
//     skill_needed                                             String?
//     category                                                 String?           @db.VarChar(100)
//     item_components_item_components_component_item_idToitems item_components[] @relation("item_components_component_item_idToitems")
//     item_components_item_components_item_idToitems           item_components[] @relation("item_components_item_idToitems")
//   }

export const load: PageServerLoad = async ({ params }) => {
    const id = parseInt(params.id);

    const objResult = await prisma.items.findUnique({
        where: { id }
    })

    const stringRepresentation = SuperJSON.stringify(objResult)

    const item: itemModel = SuperJSON.parse(stringRepresentation);

    if (!item) {
        throw error(404, 'Item not found');
    }

    const componentNeeded = await calculateCraftingRequirements(id);

    return {
        item,
        componentNeeded
    };
};