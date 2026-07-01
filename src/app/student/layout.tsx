import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentSidebar } from "@/components/student/StudentSidebar";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  // Fetch the latest points to keep sidebar updated
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totalPoints: true },
  });

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar
        userName={session.user.name ?? "Student"}
        totalPoints={user?.totalPoints ?? 0}
      />
      <main className="flex-1 pt-16 lg:pt-0 pb-10 max-h-screen overflow-y-auto">
        <div className="p-6 md:p-10 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
