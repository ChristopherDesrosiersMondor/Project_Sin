import { writable } from 'svelte/store';
import type { Mode } from '../types/models/Mode';

export const prerequisites = writable<Mode[]>([]);