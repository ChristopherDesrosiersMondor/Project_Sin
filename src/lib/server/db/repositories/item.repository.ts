import { BaseRepository } from './base.repository';
import type { Item } from "$lib/types/models/Item";
import type { ItemComponent } from "$lib/types/models/ItemComponent";
import type { Mode } from "$lib/types/models/Mode";
import type { Prerequisite } from "$lib/types/models/Prerequisite";

type ItemWithRelations = Item & {
  prerequisites: Prerequisite[];
  craftingMaterials: ItemComponent[];
  craftingModes: Mode[];
};

type CreateItemInput = {
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
};

export class ItemRepository extends BaseRepository {
  async findAll(): Promise<Item[]> {
    return this.prisma.item.findMany();
  }

  async findById(id: string): Promise<Item> {
    return this.prisma.item.findUnique({
      where: { id }
    });
  }

  async create(data: CreateItemInput): Promise<Item> {
    const { prerequisiteIds, craftingMaterials, craftingModes, ...itemData } = data;

    return this.prisma.item.create({
      data: {
        ...itemData,
        prerequisites: {
          connect: prerequisiteIds.map(id => ({ id })),
        },
        craftingMaterials: {
          create: craftingMaterials,
        },
        craftingModes: {
          create: craftingModes,
        },
      },
      include: {
        prerequisites: true,
        craftingMaterials: true,
        craftingModes: true,
      },
    });
  }

  async update(id: string, data: Partial<CreateItemInput>): Promise<Item> {
    const { prerequisiteIds, craftingMaterials, craftingModes, ...itemData } = data;

    // First, handle the main item update
    const updatedItem = await this.prisma.item.update({
      where: { id },
      data: {
        ...itemData,
        ...(prerequisiteIds && {
          prerequisites: {
            set: prerequisiteIds.map(id => ({ id })),
          },
        }),
      },
      include: {
        prerequisites: true,
        craftingMaterials: true,
        craftingModes: true,
      },
    });

    // Handle craftingMaterials if provided
    if (craftingMaterials) {
      // Delete existing materials
      await this.prisma.itemComponent.deleteMany({
        where: { itemId: id },
      });

      // Create new materials
      await this.prisma.itemComponent.createMany({
        data: craftingMaterials.map(material => ({
          ...material,
          itemId: id,
        })),
      });
    }

    // Handle craftingModes if provided
    if (craftingModes) {
      // Delete existing modes
      await this.prisma.modes.deleteMany({
        where: { itemId: id },
      });

      // Create new modes
      await this.prisma.modes.createMany({
        data: craftingModes.map(mode => ({
          ...mode,
          itemId: id,
        })),
      });
    }

    return this.findById(id) as Promise<ItemWithRelations>;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction([
      // Delete related records first
      this.prisma.itemComponent.deleteMany({
        where: { itemId: id },
      }),
      this.prisma.modes.deleteMany({
        where: { itemId: id },
      }),
      // Then delete the item
      this.prisma.item.delete({
        where: { id },
      }),
    ]);
  }
}