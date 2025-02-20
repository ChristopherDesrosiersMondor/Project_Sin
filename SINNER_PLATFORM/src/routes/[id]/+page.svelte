<script lang="ts">
	import type { PageData } from './$types';
	import ItemDetails from '$lib/components/ItemDetails.svelte';

	export let data: PageData;
	$: ({ item, componentNeeded } = data);
</script>

<div class="container mx-auto p-4">
	<a href="/" class="text-blue-600 hover:underline mb-4 inline-block">← Back to Items</a>

	<div class="space-y-8">
		<ItemDetails {item} />

		<div class="bg-white rounded-lg shadow-sm p-6">
			<h2 class="text-xl font-bold mb-4">Crafting Requirements</h2>

			<div class="space-y-6">
				{#if componentNeeded.steps.length > 0}
					{#each componentNeeded.steps as step}
						<div class="step">
							<h3 class="font-semibold mb-2">Step {step.stepNumber} ({step.stepComponentName})</h3>
							<ul class="list-disc list-inside space-y-1">
								{#each step.components as component}
									<li>{component.itemName} (x{component.quantity})</li>
								{/each}
							</ul>
						</div>
					{/each}
				{/if}

				<div class="pt-4 border-t">
					<h3 class="font-semibold mb-2">Totals</h3>
					<p>Cost: {componentNeeded.totalCost} credits</p>
					<p>Time: {componentNeeded.totalTimeInMinutes} minutes</p>
					<p>Downtime: {componentNeeded.totalTimeInDowntime}</p>
					<p>Max per downtime: {item.max_per_downtime}</p>
				</div>
			</div>
		</div>
	</div>
</div>
