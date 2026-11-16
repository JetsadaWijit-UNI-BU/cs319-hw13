import { useQuery, useQueries } from '@tanstack/react-query';

export interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strMealThumb: string;
  strYoutube?: string;
  [key: `strIngredient${number}`]: string | undefined;
  [key: `strMeasure${number}`]: string | undefined;
}

interface MealsResponse {
  meals: Meal[] | null;
}

export const useMeals = (searchQuery: string = '') => {
  return useQuery<MealsResponse>({
    queryKey: ['meals', searchQuery],
    queryFn: async () => {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลรายการอาหารได้');
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useMealDetail = (id: string | undefined) => {
  return useQuery<Meal>({
    queryKey: ['meal', id],
    queryFn: async () => {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลรายละเอียดได้');
      const data: MealsResponse = await res.json();
      if (!data.meals || data.meals.length === 0) throw new Error('ไม่พบข้อมูลเมนูนี้');
      return data.meals[0];
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useFavoriteMeals = (ids: string[]) => {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['meal', id],
      queryFn: async () => {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        if (!res.ok) throw new Error('เกิดข้อผิดพลาด');
        const data: MealsResponse = await res.json();
        return data.meals?.[0] || null;
      },
      staleTime: 1000 * 60 * 5,
    })),
  });
};