import { refresh_tokens, users } from "@prisma/client";
import { LoginInput, RefreshTokenInput, RegisterInput } from "./auth.dto.js";
import * as argon2 from "argon2";
import { prisma } from "../../utils/prisma.js";

export const registerService = async (data: RegisterInput): Promise<users> => {
  const hashed = await argon2.hash(data.password);
  return await prisma.users.create({
    data: {
      email: data.email,
      password_hash: hashed,
      firstname: data.firstname,
      lastname: data.lastname,
      phone: data.phone,
      date_of_birth: new Date(data.date_of_birth),
      role: data.role,
    },
  });
};

export const loginService = async (data: LoginInput): Promise<users | null> => {
  return await prisma.users.findUnique({ where: { email: data.email } });
};

export const insertRefreshToken = async (data: { userId: string; token: string; expiresAt: Date }): Promise<refresh_tokens> => {
  return await prisma.refresh_tokens.create({
    data: {
      user_id: data.userId,
      token: data.token,
      expires_at: data.expiresAt,
    },
  });
};

export const findRefreshToken = async (token: string): Promise<refresh_tokens | null> => {
  return await prisma.refresh_tokens.findUnique({ where: { token } });
};

export const revokeRefreshToken = async (token: string): Promise<refresh_tokens> => {
  return await prisma.refresh_tokens.update({
    where: { token },
    data: { revoked: true },
  });
};

export const rotateRefreshToken = async (
  oldToken: string,
  newData: { userId: string; token: string; expiresAt: Date }
) => {
  return await prisma.$transaction(async (tx) => {
    await tx.refresh_tokens.update({
        where: { token: oldToken },
        data: { revoked: true }
    });

    return await tx.refresh_tokens.create({
      data: {
        user_id: newData.userId,
        token: newData.token,
        expires_at: newData.expiresAt,
      },
    });
  });
};
