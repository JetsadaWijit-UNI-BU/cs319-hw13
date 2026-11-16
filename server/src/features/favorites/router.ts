import { Router } from "express";
import { favoriteHandlers } from "./handler.js";

// Favorite route wiring: maps /api/users/:userId/favorites paths to handlers.
export function createFavoritesRouter(port: number) {
  const router = Router();

  router.get("/", (req, res) => favoriteHandlers.getFavorites(req, res, port));
  router.post("/", (req, res) => favoriteHandlers.addFavorite(req, res, port));
  router.delete("/:mealId", (req, res) => favoriteHandlers.removeFavorite(req, res));

  return router;
}
