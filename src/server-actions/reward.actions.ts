"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createReward(data: {
  title: string;
  description?: string;
  pointsRequired: number;
  stock: number;
  imageUrl?: string;
}) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    await prisma.reward.create({ data });
    revalidatePath("/admin/rewards");
    revalidatePath("/student/rewards");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateReward(
  id: string,
  data: {
    title?: string;
    description?: string;
    pointsRequired?: number;
    stock?: number;
  }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    await prisma.reward.update({ where: { id }, data });
    revalidatePath("/admin/rewards");
    revalidatePath("/student/rewards");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteReward(id: string) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    await prisma.reward.delete({ where: { id } });
    revalidatePath("/admin/rewards");
    revalidatePath("/student/rewards");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function claimReward(rewardId: string) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") return { success: false, error: "Unauthorized" };

    const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
    if (!reward) return { success: false, error: "Reward tidak ditemukan" };
    if (reward.stock <= 0) return { success: false, error: "Stok reward habis" };

    const user = await prisma.user.findUnique({ where: { id: session.user.id! } });
    if (!user) return { success: false, error: "User tidak ditemukan" };
    if (user.totalPoints < reward.pointsRequired)
      return { success: false, error: "Poin tidak cukup" };

    await prisma.$transaction(async (tx) => {
      await tx.rewardClaim.create({
        data: { userId: session.user.id!, rewardId },
      });
      await tx.reward.update({
        where: { id: rewardId },
        data: { stock: { decrement: 1 } },
      });
      await tx.user.update({
        where: { id: session.user.id! },
        data: { totalPoints: { decrement: reward.pointsRequired } },
      });
    });

    revalidatePath("/student/rewards");
    revalidatePath("/student/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllRewards() {
  return await prisma.reward.findMany({ orderBy: { pointsRequired: "asc" } });
}

export async function getRewardClaims(rewardId?: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  return await prisma.rewardClaim.findMany({
    where: rewardId ? { rewardId } : {},
    include: { user: true, reward: true },
    orderBy: { claimedAt: "desc" },
  });
}

export async function getMyRewardClaims() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  return await prisma.rewardClaim.findMany({
    where: { userId: session.user.id! },
    include: { reward: true },
    orderBy: { claimedAt: "desc" },
  });
}
