import { prisma } from "~/db.server";

export async function getUsers() {
  return prisma.user.findMany({
    where: {
      verified: true,
    },
    select: { id: true, email: true, name: true, client: true },
    orderBy: { email: "asc" },
  });
}
