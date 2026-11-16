import "dotenv/config";
import { createRequire } from "module";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// @prisma/client is a CJS module; use createRequire so the named import
// works in ESM on all Node versions / platforms.
const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");

// Reuse the same single-instance client wiring as the app (adapter-pg over pg Pool)
const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://127.0.0.1:5432/postgres",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data (respect FK order)
  await prisma.ingredient.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.shoppingListItem.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.user.deleteMany();

  // ---- Users (simple auth: email + unencrypted password, allowed for this homework) ----
  const user1 = await prisma.user.create({
    data: {
      email: "owen@example.com",
      password: "password123",
      name: "เจษฎา วิจิตร",
    },
  });
  const user2 = await prisma.user.create({
    data: {
      email: "oak@example.com",
      password: "password123",
      name: "ศรดิษฐ์ เขียวป้อ",
    },
  });

  // ---- Meals with ingredients (custom data, not from an external API) ----
  const tomYum = await prisma.meal.create({
    data: {
      title: "Tom Yum Goong",
      category: "Soup",
      area: "Thai",
      instructions:
        "Bring water to a boil with lemongrass, galangal, and kaffir lime leaves. Add shrimp and mushrooms, then season with fish sauce, lime juice, and chili paste. Serve hot.",
      thumbnail:
        "https://images.unsplash.com/photo-1563638366-e4d338b7f16f?auto=format&fit=crop&w=600&q=80",
      youtube: "https://www.youtube.com/watch?v=Uk7h5qP8k8k",
      ingredients: {
        create: [
          { name: "Shrimp", measure: "300 g" },
          { name: "Straw mushroom", measure: "100 g" },
          { name: "Lemongrass", measure: "2 stalks" },
          { name: "Galangal", measure: "4 slices" },
          { name: "Kaffir lime leaves", measure: "4 leaves" },
          { name: "Fish sauce", measure: "2 tbsp" },
          { name: "Lime juice", measure: "2 tbsp" },
          { name: "Chili paste", measure: "1 tbsp" },
        ],
      },
    },
    include: { ingredients: true },
  });

  const padThai = await prisma.meal.create({
    data: {
      title: "Pad Thai",
      category: "Stir-fry",
      area: "Thai",
      instructions:
        "Soak rice noodles until soft. Stir-fry with tofu, shrimp, and egg. Add tamarind sauce, fish sauce, sugar, and chili. Garnish with peanuts, bean sprouts, and lime.",
      thumbnail:
        "https://images.unsplash.com/photo-1559336353-1ee66a7e258a?auto=format&fit=crop&w=600&q=80",
      youtube: "https://www.youtube.com/watch?v=lMwX0-7q2vI",
      ingredients: {
        create: [
          { name: "Rice noodles", measure: "200 g" },
          { name: "Tofu", measure: "1 block" },
          { name: "Shrimp", measure: "150 g" },
          { name: "Egg", measure: "2 pcs" },
          { name: "Tamarind sauce", measure: "3 tbsp" },
          { name: "Fish sauce", measure: "1 tbsp" },
          { name: "Sugar", measure: "1 tsp" },
          { name: "Chili flakes", measure: "1 tsp" },
          { name: "Crushed peanuts", measure: "2 tbsp" },
          { name: "Bean sprouts", measure: "1 cup" },
          { name: "Lime", measure: "1 pc" },
        ],
      },
    },
    include: { ingredients: true },
  });

  const greenCurry = await prisma.meal.create({
    data: {
      title: "Green Curry",
      category: "Curry",
      area: "Thai",
      instructions:
        "Simmer green curry paste in coconut milk until fragrant. Add chicken and eggplant, season with fish sauce and palm sugar. Finish with basil leaves.",
      thumbnail:
        "https://images.unsplash.com/photo-1544015517-24d9ba671e7a?auto=format&fit=crop&w=600&q=80",
      youtube: "https://www.youtube.com/watch?v=VcA_mp1k0cY",
      ingredients: {
        create: [
          { name: "Green curry paste", measure: "2 tbsp" },
          { name: "Coconut milk", measure: "400 ml" },
          { name: "Chicken", measure: "250 g" },
          { name: "Thai eggplant", measure: "6 pcs" },
          { name: "Bamboo shoots", measure: "50 g" },
          { name: "Fish sauce", measure: "1 tbsp" },
          { name: "Palm sugar", measure: "1 tsp" },
          { name: "Thai basil", measure: "a handful" },
        ],
      },
    },
    include: { ingredients: true },
  });

  const somTum = await prisma.meal.create({
    data: {
      title: "Som Tum (Green Papaya Salad)",
      category: "Salad",
      area: "Thai",
      instructions:
        "Pound garlic, chilies, and palm sugar in a mortar. Add green papaya, tomatoes, and green beans. Season with fish sauce, lime juice, and dried shrimp. Mix well.",
      thumbnail:
        "https://images.unsplash.com/photo-1523014641155-f54d6484236c?auto=format&fit=crop&w=600&q=80",
      youtube: "https://www.youtube.com/watch?v=jlFCg_P_q-E",
      ingredients: {
        create: [
          { name: "Green papaya", measure: "300 g" },
          { name: "Garlic", measure: "3 cloves" },
          { name: "Bird's eye chili", measure: "4 pcs" },
          { name: "Palm sugar", measure: "1 tbsp" },
          { name: "Cherry tomato", measure: "4 pcs" },
          { name: "Green beans", measure: "4 pcs" },
          { name: "Fish sauce", measure: "1 tbsp" },
          { name: "Lime juice", measure: "2 tbsp" },
          { name: "Dried shrimp", measure: "1 tbsp" },
        ],
      },
    },
    include: { ingredients: true },
  });

  const mangoStickyRice = await prisma.meal.create({
    data: {
      title: "Mango Sticky Rice",
      category: "Dessert",
      area: "Thai",
      instructions:
        "Steam glutinous rice until cooked. Mix with coconut milk, sugar, and salt. Serve with fresh ripe mango slices and drizzle with coconut cream.",
      thumbnail:
        "https://images.unsplash.com/photo-1588504328869-7e7990cc794c?auto=format&fit=crop&w=600&q=80",
      youtube: "https://www.youtube.com/watch?v=GbI_K8L2bqY",
      ingredients: {
        create: [
          { name: "Glutinous rice", measure: "200 g" },
          { name: "Ripe mango", measure: "1 pc" },
          { name: "Coconut milk", measure: "200 ml" },
          { name: "Sugar", measure: "2 tbsp" },
          { name: "Salt", measure: "1/4 tsp" },
          { name: "Coconut cream", measure: "2 tbsp" },
        ],
      },
    },
    include: { ingredients: true },
  });

  console.log("✅ Created users:", user1.email, user2.email);
  console.log("✅ Created meals:", tomYum.title, padThai.title, greenCurry.title, somTum.title, mangoStickyRice.title);

  // ---- Seed one favorite for user1 ----
  await prisma.favorite.create({
    data: { userId: user1.id, mealId: tomYum.id },
  });
  console.log("✅ Created sample favorite");

  console.log("🎉 Seed complete");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
