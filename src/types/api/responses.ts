import type { Item } from "../models/Item";

export interface ItemResponse extends Omit<Item, 'prerequisites' | 'craftingMaterials' | 'craftingModes'> {
    prerequisites: { id: string; description: string; }[];
    craftingMaterials: { id: string; itemId: string; quantity: number; }[];
    craftingModes: { id: number; name: string; unit: string; quantity: number; }[];
}