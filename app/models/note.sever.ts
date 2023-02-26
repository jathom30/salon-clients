import type { Note } from '@prisma/client'

import { prisma } from "~/db.server";

export async function getNotes(clientId: Note['clientId']) {
  return prisma.note.findMany({
    where: { clientId },
    orderBy: { createdAt: 'asc' }
  })
}

export async function createNote(body: Note['body'], clientId: Note['clientId']) {
  return prisma.note.create({
    data: {
      body,
      clientId,
    }
  })
}