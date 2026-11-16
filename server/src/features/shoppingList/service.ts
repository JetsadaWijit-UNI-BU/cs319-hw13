import { shoppingListStore } from "./store.js";

// Shopping list business logic: decide, no effects. Calls store for persistence.
export const shoppingListService = {
  getItems: async (userId: string) => {
    return shoppingListStore.findManyByUser(userId);
  },

  addItem: async (userId: string, mealId: string) => {
    const [user, meal] = await shoppingListStore.findUserAndMeal(userId, mealId);
    if (!user || !meal) return null;
    const existing = await shoppingListStore.findFirst(userId, mealId);
    if (existing) return existing;
    return shoppingListStore.create(userId, mealId);
  },

  toggleItem: async (itemId: string, checked: boolean) => {
    const item = await shoppingListStore.findUnique(itemId);
    if (!item) return null;
    return shoppingListStore.update(itemId, checked);
  },

  removeItem: async (itemId: string) => {
    const item = await shoppingListStore.findUnique(itemId);
    if (!item) return null;
    await shoppingListStore.delete(itemId);
    return true;
  },

  clearItems: async (userId: string) => {
    const result = await shoppingListStore.clearByUser(userId);
    return result.count > 0;
  },
};
