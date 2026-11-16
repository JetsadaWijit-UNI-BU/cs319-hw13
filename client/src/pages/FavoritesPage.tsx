import React from 'react';
import { Link } from 'react-router';
import { useMealStore } from '../stores/useMealStore';
import { useFavoriteMeals } from '../hooks/useMeals';

export const FavoritesPage: React.FC = () => {
  const { favorites, toggleFavorite } = useMealStore();
  const results = useFavoriteMeals(favorites);

  const isLoading = results.some((r) => r.isLoading);
  const favoriteMeals = results
    .map((r) => r.data)
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  if (favorites.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 text-center card bg-base-100 p-8 shadow-md border border-base-300 space-y-4">
        <h2 className="text-xl font-bold">ยังไม่มีรายการโปรด</h2>
        <p className="text-sm text-base-content/70">ไม่มีราบการชืนชอบ</p>
        <Link to="/" className="btn btn-primary btn-sm mx-auto">เลือกเมนูอาหาร</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((id) => (
            <div key={id} className="card bg-base-100 p-4 space-y-4 border border-base-300">
              <div className="skeleton h-48 w-full rounded" />
              <div className="skeleton h-5 w-3/4 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">รายการโปรดของคุณ ({favoriteMeals.length} รายการ)</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favoriteMeals.map((meal) => (
          <div key={meal.idMeal} className="card bg-base-100 shadow-md border border-base-300 flex flex-col justify-between">
            <figure className="px-4 pt-4">
              <img src={meal.strMealThumb} alt={meal.strMeal} className="rounded-lg h-48 w-full object-cover" />
            </figure>
            <div className="card-body p-4 flex flex-col justify-between flex-1">
              <div>
                <h3 className="card-title text-base line-clamp-1">{meal.strMeal}</h3>
                <p className="text-xs text-base-content/70 mt-1">{meal.strCategory || 'General'}</p>
              </div>
              <div className="card-actions justify-between items-center mt-4 pt-2 border-t border-base-200">
                <button onClick={() => toggleFavorite(meal.idMeal)} className="btn btn-sm btn-warning">
                  ★ เพิ่มรายการโปรดแล้ว
                </button>
                <Link to={`/meal/${meal.idMeal}`} className="link link-primary text-sm font-medium no-underline hover:underline">
                  ดูสูตร →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};