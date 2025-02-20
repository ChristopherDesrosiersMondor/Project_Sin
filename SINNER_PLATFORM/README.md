interface Component {
  name: string;
  quantity: number;
}

function parseComponents(resourceString: string): Component[] {
  // Split by '+' and trim
  return resourceString.split('+')
    .map(part => part.trim())
    // Parse each "Material (quantity)" pattern
    .map(part => {
      const match = part.match(/(.+?)\s*\((\d+)\)/);
      if (!match) return null;
      return {
        name: match[1].trim(),
        quantity: parseInt(match[2])
      };
    })
    .filter((component): component is Component => component !== null);
}



interface CraftingStep {
  item: string;
  quantity: number;
  components: CraftingStep[];
}

async function calculateCraftingSteps(
  itemName: string, 
  quantity: number, 
  db: Database
): Promise<CraftingStep> {
  const item = await db.getItem(itemName);
  const components = await db.getItemComponents(itemName);
  
  return {
    item: itemName,
    quantity,
    components: await Promise.all(components.map(async comp => 
      calculateCraftingSteps(comp.name, comp.quantity * quantity, db)
    ))
  };
}



Steps i followed for the db
mkdir db-seeder
cd db-seeder
npm init -y

npm install pg @types/pg typescript ts-node
npm install -D @types/node

{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}

CREATE DATABASE SIN_CRAFT;

CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    prerequisites TEXT,
    descriptions TEXT,
    market_price DECIMAL,
    cost_to_craft_in_credit DECIMAL,
    craft_time_in_minutes INTEGER,
    craft_time_in_downtime INTEGER,
    max_per_downtime INTEGER,
    location TEXT,
    malfunction TEXT,
    salary INTEGER,
    prop_description TEXT,
    skill_needed TEXT,
    category VARCHAR(100)
);

CREATE TABLE item_components (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id),
    component_item_id INTEGER REFERENCES items(id),
    quantity INTEGER,
    UNIQUE(item_id, component_item_id)
);

DB_USER=your_user
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_password
DB_PORT=5432

npm install dotenv

db-seeder/
├── .env
├── package.json
├── tsconfig.json
├── data/
│   └── items.json
└── src/
    └── seed.ts

RUN
npx ts-node src/seed.ts

The script will:

Connect to your database using the environment variables
Read the JSON file from the data directory
Insert all items and their relationships
Log progress and any issues it encounters

# Interesting query

```sql
SELECT 
    i.name AS component_name,
    ic.quantity
FROM 
    item_components ic
JOIN 
    items i ON ic.component_item_id = i.id
WHERE 
    ic.item_id = 1;
```

```sql
SELECT id from items where name = 'Secrétaire'
```

Deploy to local
https://www.ryanfiller.com/blog/tips/sveltekit-local-network