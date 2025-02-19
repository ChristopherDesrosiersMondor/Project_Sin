import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Item {
    name: string;
    prerequisites: string;
    descriptions: string;
    marketPrice: string;
    costToCraftInCredit: string;
    ressourcesNeeded: string;
    craftTimeInMinutes: string;
    craftTimeInDowntime: string;
    maxPerDowntime: string;
    location: string;
    malfunction: string;
    salary: string;
    propDescription: string;
    skillNeeded: string;
    category: string;
}

interface Component {
    name: string;
    quantity: number;
}

// Database connection using environment variables
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

// Enhanced component parsing function
function parseComponents(resourceString: string): Component[] {
    if (!resourceString || resourceString.trim() === '') {
        return [];
    }

    return resourceString.split('+')
        .map(part => part.trim())
        .filter(part => part !== '')
        .map(part => {
            const match = part.match(/(.+?)\s*\((\d+)\)/);

            if (match) {
                return {
                    name: match[1].trim(),
                    quantity: parseInt(match[2])
                };
            } else {
                return {
                    name: part.trim(),
                    quantity: 1
                };
            }
        });
}

async function seedDatabase() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Read and parse JSON file from the data directory
        const jsonData = await fs.readFile(path.join(__dirname, '../data/items.json'), 'utf-8');
        const items: Item[] = JSON.parse(jsonData);

        console.log(`Found ${items.length} items to process`);

        // First phase: Insert all items
        for (const item of items) {
            const result = await client.query(
                `INSERT INTO items (
          name, prerequisites, descriptions, market_price,
          cost_to_craft_in_credit, craft_time_in_minutes,
          craft_time_in_downtime, max_per_downtime,
          location, malfunction, salary, prop_description,
          skill_needed, category
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (name) DO NOTHING
        RETURNING id`,
                [
                    item.name,
                    item.prerequisites,
                    item.descriptions,
                    parseFloat(item.marketPrice) || null,
                    parseFloat(item.costToCraftInCredit) || null,
                    parseInt(item.craftTimeInMinutes) || null,
                    parseInt(item.craftTimeInDowntime) || null,
                    parseInt(item.maxPerDowntime) || null,
                    item.location,
                    item.malfunction,
                    parseInt(item.salary) || null,
                    item.propDescription,
                    item.skillNeeded,
                    item.category
                ]
            );

            if (result.rows.length > 0) {
                console.log(`Inserted item: ${item.name}`);
            }
        }

        // Second phase: Insert component relationships
        for (const item of items) {
            const components = parseComponents(item.ressourcesNeeded);

            const itemResult = await client.query(
                'SELECT id FROM items WHERE name = $1',
                [item.name]
            );
            const itemId = itemResult.rows[0]?.id;

            for (const component of components) {
                const componentResult = await client.query(
                    'SELECT id FROM items WHERE name = $1',
                    [component.name]
                );
                const componentId = componentResult.rows[0]?.id;

                if (itemId && componentId) {
                    await client.query(
                        `INSERT INTO item_components (item_id, component_item_id, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (item_id, component_item_id) DO UPDATE 
            SET quantity = $3`,
                        [itemId, componentId, component.quantity]
                    );
                    console.log(`Added component relationship: ${item.name} -> ${component.name} (${component.quantity})`);
                } else {
                    console.warn(`Could not find IDs for relationship: ${item.name} -> ${component.name}`);
                }
            }
        }

        await client.query('COMMIT');
        console.log('Database seeded successfully');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error seeding database:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the seeder
seedDatabase().catch(console.error);