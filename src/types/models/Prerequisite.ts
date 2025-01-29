import type { Item } from "./Item";

export interface Prerequisite {
    id: string;
    description: string;
    items: Item[];
}