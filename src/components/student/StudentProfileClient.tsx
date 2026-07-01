"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateProfile } from "@/server-actions/profile.actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type ProfileData = {
  name: string;
  major: string | null;
  cohortYear: number | null;
  bio: string | null;
};

export function StudentProfileClient({ initialData }: { initialData: ProfileData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    
    const data = {
      name: fd.get("name") as string,
      major: fd.get("major") as string,
      cohortYear: parseInt(fd.get("cohortYear") as string) || undefined,
      bio: fd.get("bio") as string,
    };

    const res = await updateProfile(data);
    setLoading(false);
    
    if (res.success) {
      toast.success("Profil berhasil diperbarui");
      router.refresh();
    } else {
      toast.error(res.error || "Gagal memperbarui profil");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nama Lengkap</Label>
        <Input name="name" defaultValue={initialData.name} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Program Studi</Label>
          <Input name="major" defaultValue={initialData.major || ""} />
        </div>
        <div className="space-y-2">
          <Label>Angkatan</Label>
          <Input name="cohortYear" type="number" defaultValue={initialData.cohortYear || ""} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Bio / Deskripsi Diri</Label>
        <Textarea name="bio" defaultValue={initialData.bio || ""} className="h-32" />
      </div>
      <div className="pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Simpan Perubahan
        </Button>
      </div>
    </form>
  );
}
