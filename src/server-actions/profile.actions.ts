"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfile(data: {
  name?: string;
  major?: string;
  cohortYear?: number;
  bio?: string;
}) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        major: data.major,
        cohortYear: data.cohortYear,
        bio: data.bio,
      },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
