import { PrismaClient } from '@prisma/client';
process.env.DATABASE_URL = "postgresql://postgres.vgppkahjcsswvfjinjil:%40Bzmx36gF5wz%234t@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admin_settings' AND column_name='enable_meal_generation') THEN
            ALTER TABLE admin_settings ADD COLUMN enable_meal_generation BOOLEAN DEFAULT TRUE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admin_settings' AND column_name='enable_recipe_generation') THEN
            ALTER TABLE admin_settings ADD COLUMN enable_recipe_generation BOOLEAN DEFAULT TRUE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admin_settings' AND column_name='enable_rebalance') THEN
            ALTER TABLE admin_settings ADD COLUMN enable_rebalance BOOLEAN DEFAULT TRUE;
        END IF;
    END $$;
  `);
  console.log("Columns added successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
