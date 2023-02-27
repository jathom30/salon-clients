import type { Note } from '@prisma/client'

import { prisma } from "~/db.server";

export async function getNote(noteId: Note['id']) {
  return prisma.note.findUnique({
    where: { id: noteId }
  })
}

export async function getNotes(clientId: Note['clientId']) {
  return prisma.note.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' }
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

export async function updateNote(body: Note['body'], noteId: Note['id']) {
  return prisma.note.update({
    where: { id: noteId },
    data: { body }
  })
}

export async function deleteNote(noteId: Note['id']) {
  return prisma.note.delete({
    where: { id: noteId }
  })
}