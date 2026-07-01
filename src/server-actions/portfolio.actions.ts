"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PortfolioType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function addPortfolio(data: {
  title: string;
  type: PortfolioType;
  description?: string;
  linkUrl?: string;
  fileUrl?: string;
}) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") throw new Error("Unauthorized");

  try {
    const portfolio = await prisma.portfolio.create({
      data: {
        userId: session.user.id!,
        title: data.title,
        type: data.type,
        description: data.description,
        linkUrl: data.linkUrl,
        fileUrl: data.fileUrl,
        status: "PENDING",
      },
    });

    await prisma.submission.create({
      data: {
        userId: session.user.id!,
        type: "PORTFOLIO",
        refId: portfolio.id,
        title: data.title,
        status: "PENDING",
      },
    });

    revalidatePath("/student/portfolio");
    revalidatePath("/student/submissions");
    revalidatePath("/admin/verification");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getStudentPortfolios(userId?: string) {
  const session = await auth();
  const targetId = userId ?? session?.user.id;
  if (!targetId) throw new Error("Unauthorized");

  return await prisma.portfolio.findMany({
    where: { userId: targetId },
    orderBy: { createdAt: "desc" },
  });
}
