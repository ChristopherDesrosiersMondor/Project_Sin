import { writable } from 'svelte/store';
import type { Item } from '../types/models/Item';

export const items = writable<Item[]>([]);
export const selectedItem = writable<Item | null>(null);