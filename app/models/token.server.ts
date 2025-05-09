import type { Token } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export async function getToken(userId: Token['userId']) {
  return prisma.token.findUnique({
    where: { userId }
  })
}

export async function deleteToken(userId: Token['userId']) {
  return prisma.token.delete({
    where: { userId }
  })
}

export async function createToken(userId: Token['userId'], token: string) {
  const hash = await bcrypt.hash(token, 10)
  return prisma.token.create({
    data: {
      userId,
      hash
    }
  })
}