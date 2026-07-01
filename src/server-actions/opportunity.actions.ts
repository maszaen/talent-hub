"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOpportunity(data: {
  title: string;
  description: string;
  requiredSkills: string[];
}) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    await prisma.opportunity.create({
      data: {
        ...data,
        postedBy: session.user.name ?? "Admin",
        isActive: true,
      },
    });

    revalidatePath("/admin/opportunities");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleOpportunity(id: string, isActive: boolean) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    await prisma.opportunity.update({ where: { id }, data: { isActive } });
    revalidatePath("/admin/opportunities");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteOpportunity(id: string) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    await prisma.opportunity.delete({ where: { id } });
    revalidatePath("/admin/opportunities");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getOpportunities(activeOnly = false) {
  return await prisma.opportunity.findMany({
    where: activeOnly ? { isActive: true } : {},
    orderBy: { createdAt: "desc" },
  });
}
