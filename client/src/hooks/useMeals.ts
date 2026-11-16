import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

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

export const useMeals = (searchQuery: string = '') => {
  return useQuery<{ meals: Meal[] }>({
    queryKey: ['meals', searchQuery],
    queryFn: async () => {
      const data = await api.getMeals(searchQuery);
      return { meals: data.data.meals };
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useMealDetail = (id: string | undefined) => {
  return useQuery<Meal>({
    queryKey: ['meal', id],
    queryFn: async () => {
      const data = await api.getMeal(id!);
      return data.data.meals[0];
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};
