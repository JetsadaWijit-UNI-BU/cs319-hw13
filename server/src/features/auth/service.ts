import { authStore } from "./store.js";

// Auth business logic: decide, no effects. Calls store for persistence.
export const authService = {
  login: async (email: string, password: string) => {
    const user = await authStore.findUserByEmail(email);
    if (!user || user.password !== password) return null;
    return { id: user.id, email: user.email, name: user.name };
  },
};
