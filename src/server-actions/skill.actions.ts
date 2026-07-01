"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addSkill(skillId: string, proofUrl?: string) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") throw new Error("Unauthorized");

  try {
    // Check duplicate
    const existing = await prisma.studentSkill.findUnique({
      where: { userId_skillId: { userId: session.user.id!, skillId } },
    });
    if (existing) return { success: false, error: "Skill sudah ditambahkan sebelumnya" };

    const skill = await prisma.skill.findUnique({ where: { id: skillId } });
    if (!skill) return { success: false, error: "Skill tidak ditemukan" };

    const studentSkill = await prisma.studentSkill.create({
      data: {
        userId: session.user.id!,
        skillId,
        proofUrl,
        status: "PENDING",
      },
    });

    // Create unified submission
    await prisma.submission.create({
      data: {
        userId: session.user.id!,
        type: "SKILL",
        refId: studentSkill.id,
        title: skill.name,
        status: "PENDING",
      },
    });

    revalidatePath("/student/skills");
    revalidatePath("/student/submissions");
    revalidatePath("/admin/verification");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createSkill(name: string, category?: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const existing = await prisma.skill.findUnique({ where: { name } });
  if (existing) return existing;

  return await prisma.skill.create({
    data: { name, category },
  });
}

export async function getAllSkills() {
  return await prisma.skill.findMany({ orderBy: { name: "asc" } });
}

export async function getStudentSkills(userId?: string) {
  const session = await auth();
  const targetId = userId ?? session?.user.id;
  if (!targetId) throw new Error("Unauthorized");

  return await prisma.studentSkill.findMany({
    where: { userId: targetId },
    include: { skill: true },
    orderBy: { createdAt: "desc" },
  });
}
