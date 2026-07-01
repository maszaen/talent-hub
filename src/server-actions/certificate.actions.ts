"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CertificateLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function addCertificate(data: {
  title: string;
  issuer?: string;
  level: CertificateLevel;
  fileUrl: string;
}) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") throw new Error("Unauthorized");

  try {
    const cert = await prisma.certificate.create({
      data: {
        userId: session.user.id!,
        title: data.title,
        issuer: data.issuer,
        level: data.level,
        fileUrl: data.fileUrl,
        status: "PENDING",
      },
    });

    await prisma.submission.create({
      data: {
        userId: session.user.id!,
        type: "CERTIFICATE",
        refId: cert.id,
        title: data.title,
        status: "PENDING",
      },
    });

    revalidatePath("/student/certificates");
    revalidatePath("/student/submissions");
    revalidatePath("/admin/verification");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getStudentCertificates(userId?: string) {
  const session = await auth();
  const targetId = userId ?? session?.user.id;
  if (!targetId) throw new Error("Unauthorized");

  return await prisma.certificate.findMany({
    where: { userId: targetId },
    orderBy: { createdAt: "desc" },
  });
}
