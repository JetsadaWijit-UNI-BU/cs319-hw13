import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { prisma } from "./lib/prisma.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve meal images stored at the repo root (images/<file>) under /images.
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use("/images", express.static(join(__dirname, "..", "images")));

app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// Validation schemas
// -------------------------------------------------------------
const mealSchema = z.object({
  title: z.string().min(1, "กรุณาระบุชื่ออาหาร"),
  category: z.string().optional(),
  area: z.string().optional(),
  instructions: z.string().min(1, "กรุณาระบุวิธีทำ"),
  thumbnail: z.string().url().optional().or(z.literal("")),
  youtube: z.string().url().optional().or(z.literal("")),
  ingredients: z
    .array(z.object({ name: z.string().min(1), measure: z.string().optional() }))
    .optional()
    .default([]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const idSchema = z.object({ mealId: z.string().min(1) });

// -------------------------------------------------------------
// Transform a DB meal into the frontend-compatible shape
// -------------------------------------------------------------
type DbMeal = {
  id: string;
  title: string;
  category: string | null;
  area: string | null;
  instructions: string;
  thumbnail: string;
  youtube: string | null;
  ingredients: Array<{ name: string; measure: string | null }>;
};

// Convert a relative thumbnail path (images/<file>) into an absolute
// URL the browser can fetch from this server.
// One responsibility: build the full image URL.
function toImageUrl(thumbnail: string): string {
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
    return thumbnail;
  }
  // thumbnails are stored as images/<file> and served at /images/<file>,
  // so prepend the host directly (the path already includes "images/").
  return `http://localhost:${PORT}/${thumbnail}`;
}

function toMealResponse(m: DbMeal) {
  const ing = m.ingredients.map((i, idx) => ({
    [`strIngredient${idx + 1}`]: i.name,
    [`strMeasure${idx + 1}`]: i.measure ?? "",
  }));
  return {
    idMeal: m.id,
    strMeal: m.title,
    strCategory: m.category ?? "",
    strArea: m.area ?? "",
    strInstructions: m.instructions,
    strMealThumb: toImageUrl(m.thumbnail),
    strYoutube: m.youtube ?? "",
    ...Object.assign({}, ...ing),
  };
}

// -------------------------------------------------------------
// Meals
// -------------------------------------------------------------
app.get("/api/meals", async (_req: Request, res: Response) => {
  const { q } = _req.query as { q?: string };
  const meals = await prisma.meal.findMany({
    where: q ? { title: { contains: q, mode: "insensitive" as const } } : {},
    include: { ingredients: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, count: meals.length, data: { meals: meals.map((m) => toMealResponse(m as unknown as DbMeal)) } });
});

app.get("/api/meals/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const meal = await prisma.meal.findUnique({ where: { id }, include: { ingredients: true } });
  if (!meal) return res.status(404).json({ success: false, message: "ไม่พบเมนูอาหารนี้" });
  res.json({ success: true, data: { meals: [toMealResponse(meal as unknown as DbMeal)] } });
});

app.post("/api/meals", async (req: Request, res: Response) => {
  const parsed = mealSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" });
  const { title, category, area, instructions, thumbnail, youtube, ingredients } = parsed.data;
  const meal = await prisma.meal.create({
    data: {
      title,
      category: category || null,
      area: area || null,
      instructions,
      thumbnail: thumbnail || "",
      youtube: youtube || null,
      ingredients: { create: ingredients.map((i) => ({ name: i.name, measure: i.measure || null })) },
    },
    include: { ingredients: true },
  });
  res.status(201).json({ success: true, message: "สร้างเมนูอาหารสำเร็จ", data: toMealResponse(meal as unknown as DbMeal) });
});

app.put("/api/meals/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const parsed = mealSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" });
  const existing = await prisma.meal.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ success: false, message: "ไม่พบเมนูอาหารนี้" });
  const { title, category, area, instructions, thumbnail, youtube, ingredients } = parsed.data;
  await prisma.ingredient.deleteMany({ where: { mealId: id } });
  const meal = await prisma.meal.update({
    where: { id },
    data: {
      title,
      category: category || null,
      area: area || null,
      instructions,
      thumbnail: thumbnail || "",
      youtube: youtube || null,
      ingredients: { create: ingredients.map((i) => ({ name: i.name, measure: i.measure || null })) },
    },
    include: { ingredients: true },
  });
  res.json({ success: true, message: "อัปเดตเมนูอาหารเรียบร้อย", data: toMealResponse(meal as unknown as DbMeal) });
});

app.delete("/api/meals/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const existing = await prisma.meal.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ success: false, message: "ไม่พบเมนูอาหารนี้" });
  await prisma.meal.delete({ where: { id } });
  res.json({ success: true, message: `ลบเมนูอาหาร '${existing.title}' สำเร็จ` });
});

// -------------------------------------------------------------
// Auth
// -------------------------------------------------------------
app.post("/api/auth/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" });
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) return res.status(401).json({ success: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
  res.json({ success: true, message: "เข้าสู่ระบบสำเร็จ", data: { id: user.id, email: user.email, name: user.name } });
});

// -------------------------------------------------------------
// Favorites
// -------------------------------------------------------------
app.get("/api/users/:userId/favorites", async (req: Request, res: Response) => {
  const userId = String(req.params.userId);
  const favs = await prisma.favorite.findMany({
    where: { userId },
    include: { meal: { include: { ingredients: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, count: favs.length, data: { meals: favs.map((f) => toMealResponse(f.meal as unknown as DbMeal)) } });
});

app.post("/api/users/:userId/favorites", async (req: Request, res: Response) => {
  const userId = String(req.params.userId);
  const parsed = idSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" });
  const { mealId } = parsed.data;
  const [user, meal] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.meal.findUnique({ where: { id: mealId } }),
  ]);
  if (!user || !meal) return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้หรือเมนูอาหาร" });
  const fav = await prisma.favorite.create({
    data: { userId, mealId },
    include: { meal: { include: { ingredients: true } } },
  });
  res.status(201).json({ success: true, message: "เพิ่มรายการโปรดเรียบร้อย", data: toMealResponse(fav.meal as unknown as DbMeal) });
});

app.delete("/api/users/:userId/favorites/:mealId", async (req: Request, res: Response) => {
  const userId = String(req.params.userId);
  const mealId = String(req.params.mealId);
  const fav = await prisma.favorite.findFirst({ where: { userId, mealId } });
  if (!fav) return res.status(404).json({ success: false, message: "ไม่พบรายการโปรดนี้" });
  await prisma.favorite.delete({ where: { id: fav.id } });
  res.json({ success: true, message: "ลบรายการโปรดเรียบร้อย" });
});

// -------------------------------------------------------------
// Shopping list
// -------------------------------------------------------------
app.get("/api/users/:userId/shopping-list", async (req: Request, res: Response) => {
  const userId = String(req.params.userId);
  const items = await prisma.shoppingListItem.findMany({
    where: { userId },
    include: { meal: { include: { ingredients: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({
    success: true,
    count: items.length,
    data: { meals: items.map((i) => ({ ...toMealResponse(i.meal as unknown as DbMeal), itemId: i.id, checked: i.checked })) },
  });
});

app.post("/api/users/:userId/shopping-list", async (req: Request, res: Response) => {
  const userId = String(req.params.userId);
  const parsed = idSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" });
  const { mealId } = parsed.data;
  const [user, meal] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.meal.findUnique({ where: { id: mealId } }),
  ]);
  if (!user || !meal) return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้หรือเมนูอาหาร" });
  const item = await prisma.shoppingListItem.create({
    data: { userId, mealId },
    include: { meal: { include: { ingredients: true } } },
  });
  res.status(201).json({
    success: true,
    message: "เพิ่มในรายการซื้อของเรียบร้อย",
    data: { ...toMealResponse(item.meal as unknown as DbMeal), itemId: item.id, checked: item.checked },
  });
});

app.patch("/api/users/:userId/shopping-list/:itemId", async (req: Request, res: Response) => {
  const itemId = String(req.params.itemId);
  const { checked } = z.object({ checked: z.boolean() }).parse(req.body);
  const item = await prisma.shoppingListItem.findUnique({ where: { id: itemId } });
  if (!item) return res.status(404).json({ success: false, message: "ไม่พบรายการนี้" });
  const updated = await prisma.shoppingListItem.update({ where: { id: itemId }, data: { checked } });
  res.json({ success: true, message: "อัปเดตรายการซื้อของเรียบร้อย", data: { itemId: updated.id, checked: updated.checked } });
});

app.delete("/api/users/:userId/shopping-list/:itemId", async (req: Request, res: Response) => {
  const itemId = String(req.params.itemId);
  const item = await prisma.shoppingListItem.findUnique({ where: { id: itemId } });
  if (!item) return res.status(404).json({ success: false, message: "ไม่พบรายการนี้" });
  await prisma.shoppingListItem.delete({ where: { id: itemId } });
  res.json({ success: true, message: "ลบรายการซื้อของเรียบร้อย" });
});

// เริ่มทำงาน Server
app.listen(PORT, () => {
  console.log(`🚀 Gusto Backend running on http://localhost:${PORT}`);
});
