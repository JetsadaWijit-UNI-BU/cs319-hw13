import { prisma } from "../../lib/prisma.js";

// Auth data access: Prisma effects only.
export const authStore = {
  findUserByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),
};
