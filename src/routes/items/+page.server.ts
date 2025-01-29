import { ItemRepository } from '$lib/server/db/repositories';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type {
	Item,
	CreateItemRequest,
	ItemResponse
} from '$lib/types/models';

const itemRepository = new ItemRepository();

export const load: PageServerLoad = async ({ url }) => {
	try {
		// Handle query parameters for filtering/sorting
		const search = url.searchParams.get('search') || '';
		const sortBy = url.searchParams.get('sortBy') || 'name';
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '10');

		const items = await itemRepository.findAll({
			search,
			sortBy,
			page,
			limit
		});

		// Transform Prisma items to our ItemResponse type
		const transformedItems: ItemResponse[] = items.map(item => ({
			id: item.id,
			name: item.name,
			description: item.description,
			marketPrice: item.marketPrice,
			craftingCost: item.craftingCost,
			maxPerDowntime: item.maxPerDowntime,
			placement: item.placement,
			prerequisites: item.prerequisites.map(prereq => ({
				id: prereq.id,
				description: prereq.description
			})),
			craftingMaterials: item.craftingMaterials.map(material => ({
				id: material.id,
				itemId: material.itemId,
				quantity: material.quantity
			})),
			craftingModes: item.craftingModes.map(mode => ({
				id: mode.id,
				name: mode.name,
				unit: mode.unit,
				quantity: mode.quantity
			}))
		}));

		return {
			items: transformedItems,
			pagination: {
				page,
				limit,
				total: items.length,
				hasMore: items.length === limit
			}
		};
	} catch (e) {
		console.error('Failed to load items:', e);
		throw error(500, 'Failed to load items');
	}
};

export const actions: Actions = {
	create: async ({ request }) => {
		try {
			const formData = await request.formData();

			// Transform and validate form data to match CreateItemRequest type
			const itemData: CreateItemRequest = {
				name: formData.get('name') as string,
				description: formData.get('description') as string,
				marketPrice: parseInt(formData.get('marketPrice') as string),
				craftingCost: parseInt(formData.get('craftingCost') as string),
				maxPerDowntime: parseInt(formData.get('maxPerDowntime') as string),
				placement: formData.get('placement') as string,
				prerequisiteIds: JSON.parse(formData.get('prerequisiteIds') as string),
				craftingMaterials: JSON.parse(formData.get('craftingMaterials') as string),
				craftingModes: JSON.parse(formData.get('craftingModes') as string)
			};

			// Validate required fields
			if (!itemData.name || !itemData.description) {
				return fail(400, {
					error: 'Name and description are required',
					data: itemData
				});
			}

			// Validate numeric fields
			if (itemData.marketPrice < 0 || itemData.craftingCost < 0) {
				return fail(400, {
					error: 'Prices cannot be negative',
					data: itemData
				});
			}

			const createdItem = await itemRepository.create(itemData);

			// Transform to ItemResponse type
			const response: ItemResponse = {
				id: createdItem.id,
				name: createdItem.name,
				description: createdItem.description,
				marketPrice: createdItem.marketPrice,
				craftingCost: createdItem.craftingCost,
				maxPerDowntime: createdItem.maxPerDowntime,
				placement: createdItem.placement,
				prerequisites: createdItem.prerequisites.map(prereq => ({
					id: prereq.id,
					description: prereq.description
				})),
				craftingMaterials: createdItem.craftingMaterials.map(material => ({
					id: material.id,
					itemId: material.itemId,
					quantity: material.quantity
				})),
				craftingModes: createdItem.craftingModes.map(mode => ({
					id: mode.id,
					name: mode.name,
					unit: mode.unit,
					quantity: mode.quantity
				}))
			};

			return { success: true, item: response };
		} catch (e) {
			console.error('Failed to create item:', e);
			return fail(500, {
				success: false,
				error: 'Failed to create item'
			});
		}
	},

	update: async ({ request, params }) => {
		try {
			const formData = await request.formData();
			const itemId = params.id;

			if (!itemId) {
				return fail(400, { error: 'Item ID is required' });
			}

			// Transform form data to match partial CreateItemRequest type
			const updateData: Partial<CreateItemRequest> = {
				name: formData.get('name') as string,
				description: formData.get('description') as string,
				marketPrice: formData.has('marketPrice')
					? parseInt(formData.get('marketPrice') as string)
					: undefined,
				craftingCost: formData.has('craftingCost')
					? parseInt(formData.get('craftingCost') as string)
					: undefined,
				maxPerDowntime: formData.has('maxPerDowntime')
					? parseInt(formData.get('maxPerDowntime') as string)
					: undefined,
				placement: formData.get('placement') as string || undefined,
				prerequisiteIds: formData.has('prerequisiteIds')
					? JSON.parse(formData.get('prerequisiteIds') as string)
					: undefined,
				craftingMaterials: formData.has('craftingMaterials')
					? JSON.parse(formData.get('craftingMaterials') as string)
					: undefined,
				craftingModes: formData.has('craftingModes')
					? JSON.parse(formData.get('craftingModes') as string)
					: undefined
			};

			// Remove undefined values
			Object.keys(updateData).forEach(key =>
				updateData[key] === undefined && delete updateData[key]
			);

			const updatedItem = await itemRepository.update(itemId, updateData);

			// Transform to ItemResponse type
			const response: ItemResponse = {
				id: updatedItem.id,
				name: updatedItem.name,
				description: updatedItem.description,
				marketPrice: updatedItem.marketPrice,
				craftingCost: updatedItem.craftingCost,
				maxPerDowntime: updatedItem.maxPerDowntime,
				placement: updatedItem.placement,
				prerequisites: updatedItem.prerequisites.map(prereq => ({
					id: prereq.id,
					description: prereq.description
				})),
				craftingMaterials: updatedItem.craftingMaterials.map(material => ({
					id: material.id,
					itemId: material.itemId,
					quantity: material.quantity
				})),
				craftingModes: updatedItem.craftingModes.map(mode => ({
					id: mode.id,
					name: mode.name,
					unit: mode.unit,
					quantity: mode.quantity
				}))
			};

			return { success: true, item: response };
		} catch (e) {
			console.error('Failed to update item:', e);
			return fail(500, {
				success: false,
				error: 'Failed to update item'
			});
		}
	},

	delete: async ({ params }) => {
		try {
			const itemId = params.id;

			if (!itemId) {
				return fail(400, { error: 'Item ID is required' });
			}

			await itemRepository.delete(itemId);
			return { success: true };
		} catch (e) {
			console.error('Failed to delete item:', e);
			return fail(500, {
				success: false,
				error: 'Failed to delete item'
			});
		}
	}
};