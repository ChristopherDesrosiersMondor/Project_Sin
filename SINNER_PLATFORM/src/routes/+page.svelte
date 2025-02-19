<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ items } = data);
</script>

<div class="container mx-auto p-4">
	<h1 class="text-2xl font-bold mb-4">Items</h1>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each items as item}
			<a href="/{item.id}" class="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
				<h2 class="font-semibold text-lg">{item.name}</h2>
			</a>
		{/each}
	</div>
</div>
