import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "wa_session";
const SESSION_DAYS = 7;

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-workabsence-nao-use-em-producao",
);

export type SessionUser = Prisma.UserGetPayload<{ include: { company: true } }>;

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub;
    if (!userId) return null;

    return await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireEmployee(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin");
  if (user.status !== "APPROVED") redirect("/login?erro=Seu%20cadastro%20n%C3%A3o%20est%C3%A1%20aprovado.");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/app");
  return user;
}
