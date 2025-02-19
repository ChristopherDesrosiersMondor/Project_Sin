import type { PageServerLoad } from "./$types"
import { prisma } from "$lib/server/prisma"
import { Decimal } from '@prisma/client/runtime/library'

// Example usage in Sveltekit load function:
export const load: PageServerLoad = async () => {
    const items = await prisma.items.findMany({
        select: {
            id: true,
            name: true,
            category: true
        }
    });

    return { items };
};