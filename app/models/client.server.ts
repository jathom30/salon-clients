import type { User, Client } from '@prisma/client'

import { prisma } from "~/db.server";

export function getClient({ id, userId }: Pick<Client, 'id'> & { userId: User['id'] }) {
  return prisma.client.findFirst({
    where: { id, userId }
  })
}

export function getClients({ userId, q }: { userId: User['id']; q?: string }) {
  return prisma.client.findMany({
    where: {
      userId,
      ...(q && {
        name: {
          contains: q
        }
      })
    },
    select: { id: true, name: true, updateAt: true },
    orderBy: { name: 'asc' }
  })
}

export function createClient({
  name, email, phoneNumber, userId
}: { name: Client['name'], email?: Client['email'], phoneNumber: Client['phoneNumber'] } & { userId: User['id'] }) {
  return prisma.client.create({
    data: {
      name,
      email,
      phoneNumber,
      user: {
        connect: {
          id: userId
        }
      }
    }
  })
}

export function deleteClient({ id, userId }: Pick<Client, 'id'> & { userId: User['id'] }) {
  return prisma.client.deleteMany({
    where: { id, userId }
  })
}

export function updateClient(id: Client['id'], client: Partial<Client>) {
  return prisma.client.update({
    where: { id },
    data: client
  })
}