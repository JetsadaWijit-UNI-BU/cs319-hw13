import { Router } from "express";
import { shoppingListHandlers } from "./handler.js";

// Shopping list route wiring: maps /api/users/:userId/shopping-list paths to handlers.
export function createShoppingListRouter(port: number) {
  const router = Router({ mergeParams: true });

  router.get("/", (req, res) => shoppingListHandlers.getItems(req, res, port));
  router.post("/", (req, res) => shoppingListHandlers.addItem(req, res, port));
  router.delete("/", (req, res) => shoppingListHandlers.clearItems(req, res));
  router.patch("/:itemId", (req, res) => shoppingListHandlers.toggleItem(req, res));
  router.delete("/:itemId", (req, res) => shoppingListHandlers.removeItem(req, res));

  return router;
}
