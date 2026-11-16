import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MealState {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  shoppingListMealId: string | null;
  setShoppingListMealId: (id: string | null) => void;
}

export const useMealStore = create<MealState>()(
  persist(
    (set) => ({
      favorites: [],
      shoppingListMealId: null,

      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((fId) => fId !== id)
            : [...state.favorites, id],
        })),

      setShoppingListMealId: (id) => set({ shoppingListMealId: id }),
    }),
    {
      name: 'meal-storage',
    }
  )
);