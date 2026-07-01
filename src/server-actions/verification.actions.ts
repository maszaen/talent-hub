"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approveSubmission(submissionId: string, points: number) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });
    if (!submission) return { success: false, error: "Submission tidak ditemukan" };

    await prisma.$transaction(async (tx) => {
      // Update submission status
      await tx.submission.update({
        where: { id: submissionId },
        data: {
          status: "APPROVED",
          pointsAwarded: points,
          reviewedBy: session.user.name ?? "Admin",
          reviewedAt: new Date(),
        },
      });

      // Update the underlying entity
      if (submission.type === "SKILL") {
        await tx.studentSkill.update({
          where: { id: submission.refId },
          data: { status: "APPROVED", points },
        });
      } else if (submission.type === "CERTIFICATE") {
        await tx.certificate.update({
          where: { id: submission.refId },
          data: { status: "APPROVED", points },
        });
      } else if (submission.type === "PORTFOLIO") {
        await tx.portfolio.update({
          where: { id: submission.refId },
          data: { status: "APPROVED", points },
        });
      }

      // Increment user total points
      await tx.user.update({
        where: { id: submission.userId },
        data: { totalPoints: { increment: points } },
      });
    });

    revalidatePath("/admin/verification");
    revalidatePath("/admin/leaderboard");
    revalidatePath("/admin/students");
    revalidatePath("/student/submissions");
    revalidatePath("/student/leaderboard");
    revalidatePath("/student/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectSubmission(
  submissionId: string,
  rejectionNote?: string
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });
    if (!submission) return { success: false, error: "Submission tidak ditemukan" };

    await prisma.$transaction(async (tx) => {
      await tx.submission.update({
        where: { id: submissionId },
        data: {
          status: "REJECTED",
          reviewedBy: session.user.name ?? "Admin",
          reviewedAt: new Date(),
          rejectionNote,
        },
      });

      if (submission.type === "SKILL") {
        await tx.studentSkill.update({
          where: { id: submission.refId },
          data: { status: "REJECTED", points: 0 },
        });
      } else if (submission.type === "CERTIFICATE") {
        await tx.certificate.update({
          where: { id: submission.refId },
          data: { status: "REJECTED", points: 0, rejectionNote },
        });
      } else if (submission.type === "PORTFOLIO") {
        await tx.portfolio.update({
          where: { id: submission.refId },
          data: { status: "REJECTED", points: 0, rejectionNote },
        });
      }
    });

    revalidatePath("/admin/verification");
    revalidatePath("/student/submissions");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPendingSubmissions(
  type?: "SKILL" | "CERTIFICATE" | "PORTFOLIO"
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  return await prisma.submission.findMany({
    where: { status: "PENDING", ...(type ? { type } : {}) },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getSubmissionWithDetails(submissionId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { user: true },
  });

  if (!submission) return null;

  let detail = null;
  if (submission.type === "CERTIFICATE") {
    detail = await prisma.certificate.findUnique({
      where: { id: submission.refId },
    });
  } else if (submission.type === "PORTFOLIO") {
    detail = await prisma.portfolio.findUnique({
      where: { id: submission.refId },
    });
  } else if (submission.type === "SKILL") {
    detail = await prisma.studentSkill.findUnique({
      where: { id: submission.refId },
      include: { skill: true },
    });
  }

  return { submission, detail };
}
