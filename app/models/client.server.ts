import type { User, Client } from "@prisma/client";

import { prisma } from "~/db.server";
import type { ExpectedFileType } from "~/routes/clients/user/upload";

export function getClient({
  id,
  userId,
}: Pick<Client, "id"> & { userId: User["id"] }) {
  return prisma.client.findFirst({
    where: { id, userId },
  });
}

export function getClients({ userId, q }: { userId: User["id"]; q?: string }) {
  return prisma.client.findMany({
    where: {
      userId,
      ...(q && {
        name: {
          contains: q,
        },
      }),
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getClientsAndNotes(userId: User["id"]) {
  return prisma.client.findMany({
    where: { userId },
    select: {
      name: true,
      email: true,
      phoneNumber: true,
      note: { select: { createdAt: true, body: true } },
    },
  });
}

export function createClient({
  name,
  email,
  phoneNumber,
  userId,
}: {
  name: Client["name"];
  email?: Client["email"];
  phoneNumber: Client["phoneNumber"];
} & { userId: User["id"] }) {
  return prisma.client.create({
    data: {
      name,
      email,
      phoneNumber,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteClient({
  id,
  userId,
}: Pick<Client, "id"> & { userId: User["id"] }) {
  return prisma.client.deleteMany({
    where: { id, userId },
  });
}

export function updateClient(id: Client["id"], client: Partial<Client>) {
  return prisma.client.update({
    where: { id },
    data: client,
  });
}

export async function bulkUpload(
  clients: ExpectedFileType,
  userId: Client["userId"]
) {
  return await Promise.all(
    clients.map(async (client) => {
      return await prisma.client.create({
        data: {
          name: client.name,
          email: client.email,
          phoneNumber: client.phoneNumber,
          userId,
          note: {
            create: client.notes.map((note) => ({
              body: note.body,
              createdAt: new Date(note.createdAt),
            })),
          },
        },
      });
    })
  );
}
