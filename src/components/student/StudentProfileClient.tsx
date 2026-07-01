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

  const [formData, setFormData] = useState({
    name: initialData.name,
    major: initialData.major || "",
    cohortYear: initialData.cohortYear?.toString() || "",
    bio: initialData.bio || "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const data = {
      name: formData.name,
      major: formData.major,
      cohortYear: parseInt(formData.cohortYear) || undefined,
      bio: formData.bio,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nama Lengkap</Label>
        <Input name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Program Studi</Label>
          <Input name="major" value={formData.major} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label>Angkatan</Label>
          <Input name="cohortYear" type="number" value={formData.cohortYear} onChange={handleChange} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Bio / Deskripsi Diri</Label>
        <Textarea name="bio" value={formData.bio} onChange={handleChange} className="h-32 transition-all duration-300 focus:shadow-md" />
      </div>
      <div className="pt-2">
        <Button type="submit" disabled={loading} className="transition-all duration-300 hover:scale-[1.02]">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Simpan Perubahan
        </Button>
      </div>
    </form>
  );
}
