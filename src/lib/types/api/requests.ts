export interface CreateItemRequest {
    name: string;
    description: string;
    marketPrice: number;
    craftingCost: number;
    maxPerDowntime: number;
    placement: string;
    prerequisiteIds: string[];
    craftingMaterials: {
        itemId: string;
        quantity: number;
    }[];
    craftingModes: {
        name: string;
        unit: string;
        quantity: number;
    }[];
}