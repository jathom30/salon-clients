import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from 'crypto';
import { encrypt } from "~/utils/encryption.server";
import { prisma } from "~/db.server";
import { incrementLoginAttempt } from "./loginAttempts.server";
import { createToken, deleteToken, getToken } from "./token.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: User["email"], password: string, name: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    // increment login attempt
    await incrementLoginAttempt(userWithPassword.id)
    return null;
  }

  if (userWithPassword.locked) {
    throw new Response('Account is locked', { status: 401 })
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

export async function updateUser(userId: User['id'], user: Partial<User>) {
  return prisma.user.update({
    where: { id: userId },
    data: user
  })
}

export async function updateUserPassword(userId: User['id'], password: string) {
  const hash = await bcrypt.hash(password, 10);
  // await deleteLoginAttempt(userId)
  return prisma.password.update({
    where: { userId },
    data: {
      hash
    }
  })
}

export async function generateTokenLink(email: User['email'], pathname: string, domainUrl: string) {
  console.log("GENERATING LINK TOKEN")
  const user = await getUserByEmail(email)
  if (!user) { throw new Error("User does not exist") }
  // if token exists for user, delete it
  const preExistingToken = await getToken(user.id)
  if (preExistingToken) {
    await deleteToken(user.id)
  }

  // create new token for email
  const token = crypto.randomBytes(32).toString('hex')
  // save hashed token to db
  await createToken(user.id, token)
  const url = new URL(domainUrl)
  url.pathname = pathname
  url.searchParams.set('token', encrypt(token))
  url.searchParams.set('id', user.id)

  return url.toString()
}

export async function compareToken(resetToken: string, userId: User['id']) {
  const token = await getToken(userId)
  if (!token) throw new Error('not found')
  // handle expired token
  const now = (new Date()).getTime()
  const tenMinutes = 1000 * 60 * 10
  const expiryTime = token.createdAt.getTime() + tenMinutes

  const isExpired = now > expiryTime
  if (isExpired) {
    await deleteToken(userId)
    throw new Error('expired')
  }

  return bcrypt.compare(resetToken, token.hash)
}

export async function verifyUser(userId: User['id']) {
  const user = await getUserById(userId)
  if (!user) throw new Error('not found')

  return await prisma.user.update({
    where: { id: userId },
    data: {
      verified: true,
    }
  })
}