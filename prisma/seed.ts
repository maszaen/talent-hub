import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Admin ───────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("amikom", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@campus.ac.id" },
    update: {},
    create: {
      email: "admin@campus.ac.id",
      name: "Admin Kampus",
      password: adminPassword,
      role: "ADMIN",
      major: "Administrasi",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // ─── Skills Master Data ───────────────────────────────────
  const skillsData = [
    { name: "Programmer", category: "Technology" },
    { name: "UI/UX Designer", category: "Design" },
    { name: "Fotografer", category: "Media" },
    { name: "Videografer", category: "Media" },
    { name: "MC", category: "Communication" },
    { name: "Content Creator", category: "Media" },
    { name: "Translator", category: "Language" },
    { name: "Tutor", category: "Education" },
    { name: "Event Organizer", category: "Management" },
    { name: "Public Speaking", category: "Communication" },
    { name: "Data Analyst", category: "Technology" },
    { name: "Graphic Designer", category: "Design" },
  ];

  const skills: Record<string, string> = {};
  for (const s of skillsData) {
    const skill = await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
    skills[s.name] = skill.id;
  }
  console.log("✅ Skills seeded:", Object.keys(skills).length);

  // ─── Rewards ─────────────────────────────────────────────
  const rewardsData = [
    {
      title: "Sertifikat Penghargaan",
      description: "Sertifikat penghargaan mahasiswa berprestasi dari kampus",
      pointsRequired: 5,
      stock: 50,
    },
    {
      title: "Voucher Kantin",
      description: "Voucher makan gratis di kantin kampus senilai Rp 25.000",
      pointsRequired: 10,
      stock: 30,
    },
    {
      title: "Merchandise Kampus",
      description: "Kaos + tote bag eksklusif dari kampus",
      pointsRequired: 20,
      stock: 15,
    },
    {
      title: "Free SKS Seminar",
      description:
        "Konversi kegiatan kemahasiswaan menjadi 1 SKS seminar (disetujui oleh kaprodi)",
      pointsRequired: 30,
      stock: 10,
    },
  ];

  for (const r of rewardsData) {
    const existing = await prisma.reward.findFirst({ where: { title: r.title } });
    if (!existing) {
      await prisma.reward.create({ data: r });
    }
  }
  console.log("✅ Rewards seeded");

  // ─── Opportunities ────────────────────────────────────────
  const opps = [
    {
      title: "Asisten Laboratorium Komputer",
      description:
        "Membantu praktikum pemrograman untuk mahasiswa semester 1-2. Jadwal fleksibel, dapat konversi ke SKS.",
      requiredSkills: ["Programmer", "Tutor"],
      postedBy: "Admin Kampus",
    },
    {
      title: "Tim Dokumentasi Acara Kampus",
      description:
        "Mendokumentasikan berbagai acara kampus sepanjang semester. Portofolio dijamin.",
      requiredSkills: ["Fotografer", "Videografer", "Content Creator"],
      postedBy: "Admin Kampus",
    },
    {
      title: "Penerjemah Dokumen Internasional",
      description:
        "Menerjemahkan dokumen kerjasama internasional kampus. Berbayar per dokumen.",
      requiredSkills: ["Translator"],
      postedBy: "Admin Kampus",
    },
    {
      title: "Panitia Dies Natalis 2026",
      description:
        "Bergabung sebagai panitia inti acara Dies Natalis kampus. Pengalaman organizer berskala besar.",
      requiredSkills: ["Event Organizer", "MC", "Public Speaking"],
      postedBy: "Admin Kampus",
    },
  ];

  for (const o of opps) {
    await prisma.opportunity.create({ data: { ...o, isActive: true } }).catch(() => {});
  }
  console.log("✅ Opportunities seeded");

  // ─── Students ─────────────────────────────────────────────
  const studentsData = [
    {
      name: "Zaeni Ahmad",
      email: "zaeni@gmail.com",
      major: "Sistem Informasi",
      cohortYear: 2021,
      bio: "Tech enthusiast dan future CTO yang lagi ikut hackathon!",
      skills: ["Programmer", "Data Analyst"],
      certLevel: "INTERNASIONAL" as const,
      certTitle: "AWS Certified Developer - Associate",
      portfolioType: "INDUSTRI" as const,
      portfolioTitle: "Sistem Rekomendasi E-Commerce",
      basePoints: 0,
    },
    {
      name: "Andi Pratama",
      email: "andi@student.ac.id",
      major: "Teknik Informatika",
      cohortYear: 2022,
      bio: "Passionate programmer dan competitive programmer",
      skills: ["Programmer", "Tutor"],
      certLevel: "NASIONAL" as const,
      certTitle: "Juara 2 ICPC Regional 2023",
      portfolioType: "INDUSTRI" as const,
      portfolioTitle: "Sistem ERP UMKM",
      basePoints: 0,
    },
    {
      name: "Budi Santoso",
      email: "budi@student.ac.id",
      major: "Sistem Informasi",
      cohortYear: 2021,
      bio: "Full-stack developer & UI/UX enthusiast",
      skills: ["Programmer", "UI/UX Designer"],
      certLevel: "INTERNASIONAL" as const,
      certTitle: "AWS Certified Solutions Architect",
      portfolioType: "FREELANCE" as const,
      portfolioTitle: "Landing Page untuk 5 Klien",
      basePoints: 0,
    },
    {
      name: "Citra Dewi",
      email: "citra@student.ac.id",
      major: "Komunikasi",
      cohortYear: 2023,
      bio: "Content creator dan fotografer event kampus",
      skills: ["Fotografer", "Content Creator"],
      certLevel: "REGIONAL" as const,
      certTitle: "Sertifikat Jurnalistik Regional Jawa Timur",
      portfolioType: "PERSONAL" as const,
      portfolioTitle: "Instagram Portfolio @citrafoto",
      basePoints: 0,
    },
    {
      name: "Dian Rahmat",
      email: "dian@student.ac.id",
      major: "Sastra Inggris",
      cohortYear: 2022,
      bio: "Translator & interpreter professional",
      skills: ["Translator", "Public Speaking"],
      certLevel: "INTERNASIONAL" as const,
      certTitle: "TOEFL iBT Score 110",
      portfolioType: "FREELANCE" as const,
      portfolioTitle: "Terjemahan Dokumen Hukum",
      basePoints: 0,
    },
    {
      name: "Eka Fitriani",
      email: "eka@student.ac.id",
      major: "Manajemen Event",
      cohortYear: 2021,
      bio: "Event organizer berpengalaman, sudah mengelola 20+ acara",
      skills: ["Event Organizer", "MC"],
      certLevel: "NASIONAL" as const,
      certTitle: "Sertifikat EO Professional dari KEMENPORA",
      portfolioType: "INDUSTRI" as const,
      portfolioTitle: "Festival Musik Kampus 2023",
      basePoints: 0,
    },
    {
      name: "Fajar Nugroho",
      email: "fajar@student.ac.id",
      major: "Teknik Informatika",
      cohortYear: 2023,
      bio: "Mobile developer & UI designer",
      skills: ["Programmer"],
      certLevel: "LOKAL" as const,
      certTitle: "Sertifikat Workshop Flutter",
      portfolioType: "PERSONAL" as const,
      portfolioTitle: "Aplikasi To-Do Flutter",
      basePoints: 0,
    },
    {
      name: "Gina Puspita",
      email: "gina@student.ac.id",
      major: "Desain Komunikasi Visual",
      cohortYear: 2022,
      bio: "Graphic designer spesialisasi brand identity",
      skills: ["UI/UX Designer", "Graphic Designer"],
      certLevel: "REGIONAL" as const,
      certTitle: "Juara 1 Lomba Desain Poster Regional",
      portfolioType: "FREELANCE" as const,
      portfolioTitle: "Brand Identity 3 UMKM Lokal",
      basePoints: 0,
    },
    {
      name: "Hendra Wijaya",
      email: "hendra@student.ac.id",
      major: "Ilmu Komunikasi",
      cohortYear: 2021,
      bio: "YouTuber & videografer konten edukasi",
      skills: ["Videografer", "Content Creator"],
      certLevel: "NASIONAL" as const,
      certTitle: "Juara Harapan Festival Film Pendek Nasional",
      portfolioType: "INDUSTRI" as const,
      portfolioTitle: "Video Profil Perusahaan 2 Klien",
      basePoints: 0,
    },
  ];

  const pointMap: Record<string, number> = {
    LOKAL: 1,
    REGIONAL: 3,
    NASIONAL: 5,
    INTERNASIONAL: 10,
    PERSONAL: 2,
    FREELANCE: 5,
    INDUSTRI: 8,
    SKILL: 3,
  };

  for (const s of studentsData) {
    const pw = await bcrypt.hash("student123", 10);
    const certPts = pointMap[s.certLevel];
    const portPts = pointMap[s.portfolioType];
    const skillPts = s.skills.length * 3;
    const totalPts = certPts + portPts + skillPts;

    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        name: s.name,
        password: pw,
        role: "STUDENT",
        major: s.major,
        cohortYear: s.cohortYear,
        bio: s.bio,
        totalPoints: totalPts,
      },
    });

    // Skills (APPROVED)
    for (const skillName of s.skills) {
      const skillId = skills[skillName];
      if (!skillId) continue;

      const ss = await prisma.studentSkill
        .upsert({
          where: { userId_skillId: { userId: user.id, skillId } },
          update: {},
          create: {
            userId: user.id,
            skillId,
            status: "APPROVED",
            points: 3,
          },
        });

      await prisma.submission.create({
        data: {
          userId: user.id,
          type: "SKILL",
          refId: ss.id,
          title: skillName,
          status: "APPROVED",
          pointsAwarded: 3,
          reviewedBy: "Admin Kampus",
          reviewedAt: new Date(),
        },
      }).catch(() => {});
    }

    // Certificate (APPROVED)
    const cert = await prisma.certificate.create({
      data: {
        userId: user.id,
        title: s.certTitle,
        level: s.certLevel,
        fileUrl: `/uploads/seed-cert-${user.id}.pdf`,
        status: "APPROVED",
        points: certPts,
      },
    });
    await prisma.submission.create({
      data: {
        userId: user.id,
        type: "CERTIFICATE",
        refId: cert.id,
        title: s.certTitle,
        status: "APPROVED",
        pointsAwarded: certPts,
        reviewedBy: "Admin Kampus",
        reviewedAt: new Date(),
      },
    }).catch(() => {});

    // Portfolio (APPROVED)
    const portfolio = await prisma.portfolio.create({
      data: {
        userId: user.id,
        title: s.portfolioTitle,
        type: s.portfolioType,
        description: `Portfolio ${s.portfolioType.toLowerCase()} dari ${s.name}`,
        status: "APPROVED",
        points: portPts,
      },
    });
    await prisma.submission.create({
      data: {
        userId: user.id,
        type: "PORTFOLIO",
        refId: portfolio.id,
        title: s.portfolioTitle,
        status: "APPROVED",
        pointsAwarded: portPts,
        reviewedBy: "Admin Kampus",
        reviewedAt: new Date(),
      },
    }).catch(() => {});
  }

  // Add some PENDING submissions for demo
  const firstStudent = await prisma.user.findUnique({
    where: { email: "andi@student.ac.id" },
  });
  if (firstStudent) {
    const pendingCert = await prisma.certificate.create({
      data: {
        userId: firstStudent.id,
        title: "Google Cloud Professional Certificate",
        level: "INTERNASIONAL",
        fileUrl: "/uploads/seed-pending.pdf",
        status: "PENDING",
      },
    });
    await prisma.submission.create({
      data: {
        userId: firstStudent.id,
        type: "CERTIFICATE",
        refId: pendingCert.id,
        title: "Google Cloud Professional Certificate",
        status: "PENDING",
      },
    }).catch(() => {});

    const pendingPortfolio = await prisma.portfolio.create({
      data: {
        userId: firstStudent.id,
        title: "Aplikasi Monitoring IoT",
        type: "INDUSTRI",
        description: "Sistem monitoring sensor IoT untuk pabrik",
        status: "PENDING",
      },
    });
    await prisma.submission.create({
      data: {
        userId: firstStudent.id,
        type: "PORTFOLIO",
        refId: pendingPortfolio.id,
        title: "Aplikasi Monitoring IoT",
        status: "PENDING",
      },
    }).catch(() => {});
  }

  // ─── Time-Series Mock Data ──────────────────────────────
  console.log("Generating time-series mock data for chart...");
  const thisYear = new Date().getFullYear();
  const allUsers = await prisma.user.findMany({ where: { role: "STUDENT" } });
  if (allUsers.length > 0) {
    const currentMonth = new Date().getMonth();
    
    // Generate data from January up to Current Month
    for (let month = 0; month <= currentMonth; month++) {
      // Random number of submissions between 10 and 45 per month
      const count = Math.floor(Math.random() * 36) + 10;
      
      const ops = [];
      for (let i = 0; i < count; i++) {
        const day = Math.floor(Math.random() * 28) + 1;
        const randomDate = new Date(thisYear, month, day);
        
        const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
        const types = ["SKILL", "CERTIFICATE", "PORTFOLIO"];
        const randomType = types[Math.floor(Math.random() * types.length)] as any;
        
        ops.push(
          prisma.submission.create({
            data: {
              userId: randomUser.id,
              type: randomType,
              refId: `mock-${month}-${i}-${Date.now()}`,
              title: `Mock Data ${month}-${i}`,
              status: "APPROVED",
              pointsAwarded: Math.floor(Math.random() * 10) + 1,
              reviewedBy: "Admin Kampus",
              reviewedAt: randomDate,
              createdAt: randomDate, 
            },
          }).catch(() => {})
        );
      }
      await Promise.all(ops);
    }
    console.log("✅ Time-series mock data generated");
  }

  console.log("✅ Students + data seeded");
  console.log("\n🎉 Seed completed!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔑 Login credentials:");
  console.log("   Admin  : admin@campus.ac.id / admin123");
  console.log("   Student: andi@student.ac.id / student123");
  console.log("   (semua student password: student123)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
