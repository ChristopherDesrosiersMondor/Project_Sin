import type { Item } from "./Item";

export interface ItemComponent {
    id: string;
    itemId: string;
    item: Item;
    quantity: number;
  }