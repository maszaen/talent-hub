"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerStudent(data: {
  name: string;
  email: string;
  password: string;
  major?: string;
  cohortYear?: number;
}) {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return { success: false, error: "Email sudah digunakan" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "STUDENT",
        major: data.major,
        cohortYear: data.cohortYear,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, error: "Terjadi kesalahan server" };
  }
}
