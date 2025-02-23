<script lang="ts">
	import type { itemModel } from '$lib/models/ItemModels';
	export let item: itemModel;
</script>

<div class="bg-white rounded-lg shadow-sm p-6">
	<h1 class="text-2xl font-bold mb-6">{item.name}</h1>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		{#if item.prerequisites}
			<div class="field-group">
				Prerequisites:
				{item.prerequisites}
			</div>
		{/if}

		{#if item.descriptions}
			<div class="field-group">
				Description:
				{item.descriptions}
			</div>
		{/if}

		{#if item.market_price}
			<div class="field-group">
				Market Price:
				{item.market_price}
			</div>
		{/if}

		{#if item.cost_to_craft_in_credit}
			<div class="field-group">
				Crafting Cost:
				{item.cost_to_craft_in_credit} credits
			</div>
		{/if}

		{#if item.craft_time_in_minutes}
			<div class="field-group">
				Craft Time:
				{item.craft_time_in_minutes} minutes
			</div>
		{/if}

		{#if item.craft_time_in_downtime}
			<div class="field-group">
				Downtime:
				{item.craft_time_in_downtime}
			</div>
		{/if}

		{#if item.craft_time_in_downtime}
			<div class="field-group">
				Max per downtime:
				{item.max_per_downtime}
			</div>
		{/if}

		{#if item.location}
			<div class="field-group">
				Location:
				{item.location}
			</div>
		{/if}

		{#if item.skill_needed}
			<div class="field-group">
				Required Skill:
				{item.skill_needed}
			</div>
		{/if}

		{#if item.category}
			<div class="field-group">
				Category:
				{item.category}
			</div>
		{/if}

		{#if item.category}
			<div class="field-group">
				Salary:
				{item.salary}
			</div>
		{/if}
	</div>
</div>

<style>
	.field-group {
		@apply mb-4;
	}

	.field-group label {
		@apply block text-gray-700 mb-1;
	}
</style>
