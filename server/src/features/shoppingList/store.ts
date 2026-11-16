import { prisma } from "../../lib/prisma.js";

// Shopping list data access: Prisma effects only.
export const shoppingListStore = {
  findManyByUser: (userId: string) =>
    prisma.shoppingListItem.findMany({
      where: { userId },
      include: { meal: { include: { ingredients: true } } },
      orderBy: { createdAt: "desc" },
    }),

  findUserAndMeal: (userId: string, mealId: string) =>
    Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.meal.findUnique({ where: { id: mealId } }),
    ]),

  findUnique: (id: string) =>
    prisma.shoppingListItem.findUnique({ where: { id } }),

  findFirst: (userId: string, mealId: string) =>
    prisma.shoppingListItem.findFirst({
      where: { userId, mealId },
      include: { meal: { include: { ingredients: true } } },
    }),

  create: (userId: string, mealId: string) =>
    prisma.shoppingListItem.create({
      data: { userId, mealId },
      include: { meal: { include: { ingredients: true } } },
    }),

  update: (id: string, checked: boolean) =>
    prisma.shoppingListItem.update({ where: { id }, data: { checked } }),

  delete: (id: string) =>
    prisma.shoppingListItem.delete({ where: { id } }),

  clearByUser: (userId: string) =>
    prisma.shoppingListItem.deleteMany({ where: { userId } }),
};
