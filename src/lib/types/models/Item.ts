export interface Item {
    id: string;
    name: string;
    prerequisites: string;
    description: string;
    marketPrice: number;
    craftingCost: number;
    craftingMaterials: string;
    craftingModes: string;
    maxPerDowntime: number;
    placement: string;
  }