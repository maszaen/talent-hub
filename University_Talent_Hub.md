# University Talent Hub — Requirements & Build Reference

> **Cara pakai:** Dokumen ini adalah requirements lengkap + panduan build. Gunakan sebagai referensi tiap kali ingin mengecek ulang scope, schema, atau business logic.

---

## 0. KONTEKS & TUJUAN

Membangun **MVP (Minimum Viable Product)** untuk hackathon bertema **"University Talent Hub"** — platform gamifikasi yang menghubungkan talenta mahasiswa (skill, sertifikat, portfolio) dengan kebutuhan verifikasi dari admin kampus, disertai sistem poin, leaderboard, reward, dan rekomendasi berbasis AI.

Proyek ini dinilai berdasarkan rubrik skoring ketat (total 150 poin). **Setiap fitur di bawah wajib berfungsi end-to-end (bukan hanya UI kosong)** karena skala penilaian juri adalah:
- 0 = belum diimplementasi / error / tidak bisa didemokan
- 5 = baru tampilan saja / sebagian fungsi / berantakan
- 10 = berfungsi penuh sesuai requirement

Prioritaskan: **working end-to-end flow dulu, baru polish UI**. Jangan generate placeholder/dummy button yang tidak terhubung ke backend.

---

## 1. TECH STACK (WAJIB, JANGAN DIGANTI)

- **Framework:** Next.js 14+ (App Router) — full-stack dalam satu project
- **Bahasa:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** NextAuth.js (Credentials Provider, session JWT) — dua role: ADMIN dan STUDENT
- **Styling:** TailwindCSS + shadcn/ui
- **File upload:**
  - Simpan lokal di /public/uploads via Next.js API route handler
  - Field tetap simpan fileUrl di DB
  - Max file size: 10 MB untuk dokumen/gambar; 2 MB untuk avatar
  - Format: JPG, PNG, PDF (dokumen); JPG, PNG, WEBP (avatar)
  - Satu endpoint /api/upload generik, kirim query param ?type=avatar|document
- **State/data fetching:** React Server Components + Server Actions
- **AI Recommendation:** Anthropic API via server action, dengan fallback rule-based engine
- **Containerization:** Docker + docker-compose

---

## 2. STRUKTUR PROJECT

```
university-talent-hub/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── students/page.tsx
│   │   │   ├── students/[id]/page.tsx
│   │   │   ├── verification/page.tsx
│   │   │   ├── rewards/page.tsx
│   │   │   ├── leaderboard/page.tsx
│   │   │   └── opportunities/page.tsx
│   │   ├── student/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── skills/page.tsx
│   │   │   ├── certificates/page.tsx
│   │   │   ├── portfolio/page.tsx
│   │   │   ├── submissions/page.tsx
│   │   │   ├── leaderboard/page.tsx
│   │   │   ├── rewards/page.tsx
│   │   │   └── recommendations/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── upload/route.ts
│   │   │   └── ai-recommendation/route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── admin/
│   │   ├── student/
│   │   └── shared/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── points-engine.ts
│   │   └── ai-recommendation.ts
│   └── server-actions/
│       ├── skill.actions.ts
│       ├── certificate.actions.ts
│       ├── portfolio.actions.ts
│       ├── verification.actions.ts
│       ├── reward.actions.ts
│       └── opportunity.actions.ts
├── docker-compose.yml
├── Dockerfile
├── entrypoint.sh
├── .env.example
└── README.md
```

---

## 3. DATABASE SCHEMA (Prisma)

### Klarifikasi desain:
- Certificate punya halaman sendiri /student/certificates (bukan terintegrasi di skills)
- reviewedBy di Submission menyimpan nama admin (String) — cukup untuk MVP
- Opportunity.isActive digunakan untuk filter opportunity aktif vs diarsipkan
- StudentSkill tidak punya level — poin skill selalu default 3, admin boleh override manual saat approve

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  STUDENT
}

enum SubmissionType {
  SKILL
  CERTIFICATE
  PORTFOLIO
}

enum SubmissionStatus {
  PENDING
  APPROVED
  REJECTED
}

enum CertificateLevel {
  LOKAL
  REGIONAL
  NASIONAL
  INTERNASIONAL
}

enum PortfolioType {
  PERSONAL
  FREELANCE
  INDUSTRI
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  role          Role
  avatarUrl     String?
  totalPoints   Int       @default(0)
  major         String?
  cohortYear    Int?
  bio           String?
  createdAt     DateTime  @default(now())

  skills        StudentSkill[]
  certificates  Certificate[]
  portfolios    Portfolio[]
  submissions   Submission[]
  rewardClaims  RewardClaim[]
}

model Skill {
  id       String  @id @default(cuid())
  name     String  @unique
  category String?

  studentSkills StudentSkill[]
}

model StudentSkill {
  id        String           @id @default(cuid())
  userId    String
  skillId   String
  proofUrl  String?
  status    SubmissionStatus @default(PENDING)
  points    Int              @default(0)
  createdAt DateTime         @default(now())

  user  User  @relation(fields: [userId], references: [id])
  skill Skill @relation(fields: [skillId], references: [id])

  @@unique([userId, skillId])
}

model Certificate {
  id            String           @id @default(cuid())
  userId        String
  title         String
  issuer        String?
  level         CertificateLevel
  fileUrl       String
  status        SubmissionStatus @default(PENDING)
  points        Int              @default(0)
  rejectionNote String?
  createdAt     DateTime         @default(now())

  user User @relation(fields: [userId], references: [id])
}

model Portfolio {
  id            String           @id @default(cuid())
  userId        String
  title         String
  type          PortfolioType
  description   String?
  linkUrl       String?
  fileUrl       String?
  status        SubmissionStatus @default(PENDING)
  points        Int              @default(0)
  rejectionNote String?
  createdAt     DateTime         @default(now())

  user User @relation(fields: [userId], references: [id])
}

model Submission {
  id            String           @id @default(cuid())
  userId        String
  type          SubmissionType
  refId         String
  title         String
  status        SubmissionStatus @default(PENDING)
  pointsAwarded Int              @default(0)
  reviewedBy    String?
  reviewedAt    DateTime?
  rejectionNote String?
  createdAt     DateTime         @default(now())

  user User @relation(fields: [userId], references: [id])
}

model Reward {
  id             String   @id @default(cuid())
  title          String
  description    String?
  pointsRequired Int
  stock          Int      @default(0)
  imageUrl       String?
  createdAt      DateTime @default(now())

  claims RewardClaim[]
}

model RewardClaim {
  id        String   @id @default(cuid())
  userId    String
  rewardId  String
  claimedAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id])
  reward Reward @relation(fields: [rewardId], references: [id])
}

model Opportunity {
  id             String   @id @default(cuid())
  title          String
  description    String
  requiredSkills String[]
  postedBy       String
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
}
```

---

## 4. LOGIKA BISNIS UTAMA

```
Mahasiswa isi profil
   -> tambah Skill / Sertifikat / Portfolio (status: PENDING)
   -> submit untuk verifikasi (masuk ke tabel Submission)
   -> Admin review di halaman /admin/verification
       -> Reject  -> status REJECTED, simpan rejectionNote (opsional), mahasiswa lihat status + alasan
       -> Approve -> status APPROVED, points sesuai tabel poin (auto-suggest, admin boleh override)
   -> totalPoints User bertambah otomatis (increment via Prisma transaction)
   -> Leaderboard re-sort otomatis (ORDER BY totalPoints DESC)
   -> Mahasiswa bisa klaim reward jika totalPoints >= reward.pointsRequired
       -> saat klaim: kurangi totalPoints, kurangi stock, buat RewardClaim (1 transaction)
```

### Tabel Poin Default

| Aktivitas         | Level/Tipe    | Poin |
|-------------------|---------------|------|
| Sertifikat        | Lokal         | 1    |
| Sertifikat        | Regional      | 3    |
| Sertifikat        | Nasional      | 5    |
| Sertifikat        | Internasional | 10   |
| Portfolio         | Personal      | 2    |
| Portfolio         | Freelance     | 5    |
| Portfolio         | Industri      | 8    |
| Skill (disetujui) | -             | 3    |

---

## 5. FITUR WAJIB PER ROLE

### A. Role Administrator (50 poin) — /admin/*

| # | Fitur                     | Halaman              | Detail wajib |
|---|---------------------------|----------------------|------|
| 1 | Auth Admin (Login/Logout) | /login               | NextAuth credentials, redirect by role, session guard |
| 2 | Dashboard statistik       | /admin/dashboard     | Cards + bar chart recharts |
| 3 | Data mahasiswa + search   | /admin/students      | Tabel + search by nama/skill/poin, klik -> detail |
| 4 | Verifikasi approve/reject | /admin/verification  | Tab Skill/Cert/Portfolio, approve+poin override, reject+alasan |
| 5 | Reward management         | /admin/rewards       | CRUD reward, lihat riwayat klaim |
| + | Leaderboard               | /admin/leaderboard   | Read-only view |
| + | Opportunities             | /admin/opportunities | Create + toggle isActive |

### B. Role Mahasiswa (60 poin) — /student/*

| # | Fitur               | Halaman                    | Detail wajib |
|---|---------------------|----------------------------|------|
| 1 | Auth                | /login, /register          | Register STUDENT, login session |
| 2 | Talent Profile      | /student/profile           | Edit nama/bio/jurusan/angkatan + avatar upload |
| 3 | Skill Management    | /student/skills            | Tambah skill, upload bukti, lihat status, no duplicate |
| 4 | Sertifikat Upload   | /student/certificates      | Upload file, pilih level, lihat status + alasan reject |
| 5 | Portfolio           | /student/portfolio         | Tambah portfolio, link/file, lihat status + alasan reject |
| 6 | Leaderboard         | /student/leaderboard       | Ranking real-time, highlight diri sendiri |
| 7 | Reward Catalog      | /student/rewards           | List + Claim (validasi poin & stok), riwayat klaim |
| + | Submissions history | /student/submissions       | Riwayat semua pengajuan + status + alasan reject |
| + | Rekomendasi AI      | /student/recommendations   | Lihat bagian 7 |

---

## 6. NON-FUNGSIONAL / TEKNIKAL (40 poin)

| # | Requirement       | Cara memenuhi |
|---|-------------------|------|
| 1 | Responsive Layout | Tailwind mobile-first, sidebar hamburger di mobile |
| 2 | Dockerized        | Dockerfile multi-stage + docker-compose, migration + seed otomatis via entrypoint.sh |
| 3 | Deploy Online     | README step-by-step Vercel + Neon, .env.example lengkap |
| 4 | AI Recommendation | Claude API + rule-based fallback |

---

## 7. FITUR AI RECOMMENDATION

Buat fitur di /student/recommendations yang memberi rekomendasi:
1. Skill yang perlu ditambah (gap analysis vs opportunity requiredSkills)
2. Opportunity yang cocok (ranking by skill overlap)
3. Langkah untuk naik level/leaderboard

**Implementasi:**
- Buat getAIRecommendation(userId) di lib/ai-recommendation.ts
- Jika ANTHROPIC_API_KEY tersedia: kirim prompt ke Claude API (model claude-sonnet-4-6), response JSON array of {type, title, reason}
- Jika tidak tersedia / gagal: fallback rule-based engine
- JANGAN biarkan crash atau kosong kalau API key tidak di-set

---

## 8. DOCKER SETUP

```sh
# entrypoint.sh
#!/bin/sh
set -e
mkdir -p /app/public/uploads
echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Seeding database..."
npx prisma db seed
echo "Starting Next.js app..."
exec npm start
```

docker-compose.yml minimal:
- Service db: postgres:16, volume persist, healthcheck
- Service app: depends_on db (condition: service_healthy), expose 3000, run entrypoint.sh

---

## 9. SEED DATA

prisma/seed.ts harus membuat:
- 1 akun Admin (admin@campus.ac.id / admin123)
- 8 akun mahasiswa dummy dengan variasi poin, skill, status PENDING/APPROVED/REJECTED
- 10 skill master: Programmer, UI/UX Designer, Fotografer, Videografer, MC, Content Creator, Translator, Tutor, Event Organizer, Public Speaking
- 4 reward: Voucher Kantin (5 pts), Sertifikat Penghargaan (10 pts), Merchandise Kampus (20 pts), Free SKS Seminar (30 pts)
- 3 opportunity aktif
- Sertifikat & portfolio APPROVED untuk beberapa mahasiswa (supaya poin terisi)

---

## 10. BUILD PHASES

### Phase 1 — Foundation & Auth
Output: App bisa dijalankan, login/register berfungsi, database tersambung, layout dasar sudah ada.

- [ ] Scaffold Next.js 14 + TypeScript + Tailwind + shadcn/ui
- [ ] Setup Prisma schema + migrate + seed.ts
- [ ] Setup NextAuth (Credentials Provider, session JWT, role field)
- [ ] Middleware route guard (/admin/* hanya ADMIN, /student/* hanya STUDENT)
- [ ] Layout: Admin sidebar + Student sidebar (responsive, hamburger mobile)
- [ ] Halaman login + register (Student)
- [ ] /api/upload handler (validasi type & size)
- [ ] Docker setup (Dockerfile + docker-compose.yml + entrypoint.sh)
- [ ] .env.example

### Phase 2 — Core Business Flow
Output: Flow inti end-to-end jalan: mahasiswa submit -> admin approve/reject -> poin bertambah -> leaderboard update.

- [ ] Student: Dashboard (summary card poin, status submissions)
- [ ] Student: Profile page (edit data + avatar upload)
- [ ] Student: Skills page (tambah skill, upload bukti, lihat status)
- [ ] Student: Certificates page (upload sertifikat, pilih level, lihat status + alasan reject)
- [ ] Student: Portfolio page (tambah portfolio, upload/link, lihat status + alasan reject)
- [ ] Student: Submissions history
- [ ] Admin: Verification page (tab Skill/Cert/Portfolio, approve+poin override, reject+alasan)
- [ ] Points engine (lib/points-engine.ts) — auto-suggest + apply via Prisma transaction
- [ ] Leaderboard: Admin view + Student view (highlight self)

### Phase 3 — Extended Features
Output: Semua fitur admin & student selesai kecuali AI.

- [ ] Admin: Dashboard statistik (cards + recharts bar chart)
- [ ] Admin: Students table (search by nama/skill/poin, klik -> detail profil)
- [ ] Admin: Rewards CRUD + riwayat klaim
- [ ] Student: Rewards catalog + Claim + riwayat
- [ ] Admin: Opportunities management (create + toggle isActive)

### Phase 4 — AI, Polish & Deploy
Output: Semua checklist bagian 12 terpenuhi, siap demo.

- [ ] AI Recommendation (lib/ai-recommendation.ts) dengan Claude API + rule-based fallback
- [ ] Student: /student/recommendations page
- [ ] Responsive pass semua halaman di 375px mobile
- [ ] README.md lengkap (run lokal, run docker, deploy Vercel+Neon, akun demo)
- [ ] Final audit: cek seluruh checklist bagian 12

---

## 11. URUTAN PENGERJAAN TEKNIKAL

1. Scaffold Next.js + TypeScript + Tailwind + shadcn/ui
2. Setup Prisma schema + migrate + seed.ts
3. Setup NextAuth + middleware guard
4. Student submit skill/sertifikat/portfolio -> masuk Submission table
5. Admin verification: approve/reject + point suggestion + increment totalPoints (prisma.$transaction)
6. Leaderboard (admin & student)
7. Reward management (admin CRUD) + Reward claim (student)
8. Dashboard admin (statistik + recharts)
9. Student profile page + edit
10. Opportunity posting (admin) + listing
11. AI Recommendation + fallback
12. Responsive pass
13. Docker final test (fresh volume)
14. README.md lengkap
15. Audit checklist bagian 12

---

## 12. CHECKLIST FINAL

- [ ] Login/logout admin & mahasiswa berfungsi, redirect sesuai role
- [ ] Dashboard admin menampilkan angka real dari database, termasuk chart
- [ ] Search mahasiswa by nama, skill & rentang poin benar-benar memfilter data
- [ ] Approve/reject submission mengubah status & totalPoints secara real-time
- [ ] Alasan reject tampil di sisi mahasiswa (submissions history)
- [ ] Admin bisa CRUD reward, mahasiswa bisa lihat & klaim reward sesuai poin
- [ ] Klaim reward mengurangi poin & stok dalam 1 transaction
- [ ] Mahasiswa bisa lengkapi profil (edit + avatar upload), tambah skill, upload sertifikat, upload portfolio
- [ ] Tidak bisa daftar skill yang sama 2x
- [ ] Status pengajuan terlihat jelas (Pending/Approved/Rejected) di sisi mahasiswa
- [ ] Leaderboard ter-update otomatis setelah approval
- [ ] Admin bisa posting & archive opportunity
- [ ] Fitur rekomendasi AI menampilkan hasil nyata, termasuk saat API key tidak tersedia (fallback)
- [ ] Semua halaman responsive di mobile (375px)
- [ ] docker-compose up dari fresh clone berhasil tanpa command manual tambahan
- [ ] README berisi instruksi deploy online yang valid
- [ ] Tidak ada tombol/fitur yang UI-nya ada tapi tidak terhubung ke backend

---

## 13. CATATAN TAMBAHAN

- Prioritaskan fungsi > estetika
- Gunakan komponen shadcn/ui: Table, Card, Dialog, Tabs, Badge, Toast, Form
- Start dari create-next-app kosong (bukan boilerplate)
- /public/uploads di-gitignore tapi dibuat via mkdir di entrypoint.sh
- Untuk demo lokal: NEXTAUTH_URL=http://localhost:3000
