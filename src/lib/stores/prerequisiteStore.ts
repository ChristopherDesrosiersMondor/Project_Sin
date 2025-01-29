import { writable } from 'svelte/store';
import type { Prerequisite } from '../types/models/Prerequisite';

export const prerequisites = writable<Prerequisite[]>([]);