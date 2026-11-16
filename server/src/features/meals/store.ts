import { prisma } from "../../lib/prisma.js";

// Meal data access: Prisma effects only. No business logic, no HTTP.
export const mealStore = {
  findMany: (where: unknown, include: unknown, orderBy: unknown) =>
    prisma.meal.findMany({ where, include, orderBy }),

  findUnique: (id: string, include: unknown) =>
    prisma.meal.findUnique({ where: { id }, include }),

  create: (data: unknown, include: unknown) =>
    prisma.meal.create({ data, include }),

  update: (id: string, data: unknown, include: unknown) =>
    prisma.meal.update({ where: { id }, data, include }),

  delete: (id: string) =>
    prisma.meal.delete({ where: { id } }),

  deleteIngredients: (mealId: string) =>
    prisma.ingredient.deleteMany({ where: { mealId } }),
};
