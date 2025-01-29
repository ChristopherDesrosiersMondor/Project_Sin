import type { ItemComponent } from "./ItemComponent";
import type { Mode } from "./Mode";
import type { Prerequisite } from "./Prerequisite";

export interface Item {
    id: string;
    name: string;
    prerequisites: Prerequisite[];
    description: string;
    marketPrice: number;
    craftingCost: number;
    craftingMaterials: ItemComponent[];
    craftingModes: Mode[];
    maxPerDowntime: number;
    placement: string;
  }