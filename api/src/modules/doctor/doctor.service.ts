import { prisma } from "../../utils/prisma.js";
import { USER_ROLE } from "../../utils/user.js";

export const getDoctors = async () => {
  return prisma.users.findMany({ where: { role: USER_ROLE.DOCTOR as any } });
};
