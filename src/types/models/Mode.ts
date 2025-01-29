import type { Item } from "./Item";

export interface Mode {
    id: number;
    name: string;
    unit: string;
    quantity: number;
    itemId: string;
    item: Item;
  }