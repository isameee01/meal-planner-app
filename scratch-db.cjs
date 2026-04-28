import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    create table if not exists admin_settings (
      id uuid primary key default gen_random_uuid(),
      ai_model text,
      meal_prompt text,
      recipe_prompt text,
      rebalance_prompt text,
      updated_at timestamp default now()
    );
  `);
  console.log("Table created.");

  await prisma.$executeRawUnsafe(`
    insert into admin_settings (ai_model, meal_prompt)
    values ('llama3', 'default prompt');
  `);
  console.log("Data inserted.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
