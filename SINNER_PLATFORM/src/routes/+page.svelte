<script lang="ts">
	import type { itemModel } from '$lib/models/ItemModels';
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ items } = data);

	// Create array of letters A-Z with type
	const letters: string[] = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

	// Type for the grouped items
	type ItemsByLetter = {
		[key: string]: itemModel[];
	};

	$: itemsByLetter = letters.reduce<ItemsByLetter>((acc, letter) => {
		acc[letter] = items.filter((item: { name: string }) =>
			item.name.toUpperCase().startsWith(letter)
		);
		return acc;
	}, {});

	// Split letters into groups of 3 for desktop view
	$: letterGroups = letters.reduce<string[][]>((acc, letter, index) => {
		if (index % 3 === 0) {
			acc.push([letter]);
		} else {
			acc[acc.length - 1].push(letter);
		}
		return acc;
	}, []);
</script>

<div class="terminal-container">
	<!-- Letter navigation -->
	<!-- svelte-ignore a11y_consider_explicit_label -->
	<a id="top"></a>
	<div class="center-div">
		<div class="custom-grid mb-6">
			{#each letters as letter}
				<a href="#{letter}" class="terminal-link letter-link letter-nav px-3 py-2 text-center">
					{letter}
				</a>
			{/each}
		</div>
	</div>

	<!-- Sections for each letter -->
	<div class="space-y-8 mt-8">
		{#each letters as letter}
			{#if itemsByLetter[letter].length > 0}
				<section id={letter} class="terminal-section">
					<h2 class="terminal-header text-2xl font-bold mb-4 cursor">{letter}</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each itemsByLetter[letter] as item}
							<a
								href="/{item.id}"
								class="terminal-link p-4 border border-[#33ff33] hover:bg-[#33ff33] hover:text-[#0a0a0a]"
							>
								<h3 class="font-bold text-lg">{item.name}</h3>
							</a>
						{/each}
					</div>
				</section>
			{/if}
		{/each}
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		<button class="fixed-button">
			<a
				href="#top"
				class="terminal-link p-4 border border-[#33ff33] hover:bg-[#33ff33] hover:text-[#0a0a0a]"
				>TOP</a
			>
		</button>
	</div>
</div>

<style>
	:global(body) {
		background-color: #0a0a0a;
		color: #33ff33;
		font-family: 'Courier New', Courier, monospace;
	}

	.center-div {
		width: 500px;
		margin: 0 auto;
		padding: 20px; /* Optional padding */
		/* background-color: lightblue; */
	}

	.letter-link {
		width: 30px;
		text-align: center;
	}

	.custom-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 1rem; /* Adjust spacing as needed */
		width: 400px;
		margin: 0 auto;
		padding-bottom: 30px;
		/* background-color: rgb(5, 18, 22); */
	}

	.terminal-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		grid-template-columns: repeat(5, 1fr);
	}

	.fixed-button {
		position: fixed; /* Makes the button stay fixed in place */
		bottom: 20px; /* Adjust distance from the bottom of the page */
		right: 20px; /* Adjust distance from the right of the page */
		padding: 10px 20px; /* Adds padding inside the button */
		background-color: #0a0a0a;
	}

	.terminal-section {
		border: 1px solid #33ff33;
		padding: 1rem;
		margin-bottom: 1rem;
		background-color: #0a0a0a;
		box-shadow: 0 0 10px rgba(51, 255, 51, 0.2);
	}

	.terminal-link {
		color: #33ff33;
		text-decoration: none;
		transition: all 0.3s ease;
	}

	.terminal-link:hover {
		color: #577a3b;
		text-shadow: none;
	}

	.letter-nav {
		border: 1px solid #33ff33;
		background-color: #0a0a0a;
		text-shadow: 0 0 5px #33ff33;
		margin-left: 10px;
	}

	.terminal-header {
		text-shadow: 0 0 10px #33ff33;
		position: relative;
	}

	.terminal-header::before {
		content: '>';
		position: absolute;
		left: -1.5rem;
		color: #33ff33;
	}

	@keyframes cursor-blink {
		0%,
		100% {
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
	}

	.cursor::after {
		content: '_';
		animation: cursor-blink 1s infinite;
	}
</style>
