import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/stores/authStore";
import { authService } from "@/features/auth/services/authService";
import { ArrowLeft, Camera, KeyRound, Mail, Phone, Save, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const currentUser = useAuth((state) => state.user);
  const [form, setForm] = useState({
    name: currentUser?.name ?? "",
    phone: currentUser?.phone ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUpdatingPresetAvatar, setIsUpdatingPresetAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setForm({
      name: currentUser?.name ?? "",
      phone: currentUser?.phone ?? "",
    });
  }, [currentUser]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      const response = await authService.updateProfile({
        name: form.name,
        phone: form.phone || undefined,
      });
      toast.success(response.message || "Cập nhật thông tin thành công");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật thông tin");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh đại diện không được vượt quá 5MB");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const response = await authService.uploadAvatar(file);
      toast.success(response.message || "Cập nhật ảnh đại diện thành công");
    } catch {
      toast.error("Không thể cập nhật ảnh đại diện");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSelectPresetAvatar = async (avatarUrl: string) => {
    if (currentUser?.avatarUrl === avatarUrl || isUpdatingPresetAvatar) {
      return;
    }

    try {
      setIsUpdatingPresetAvatar(true);
      const response = await authService.updatePresetAvatar(avatarUrl);
      toast.success(response.message || "Cập nhật avatar thành công");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật avatar");
    } finally {
      setIsUpdatingPresetAvatar(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Thông tin cá nhân</h1>
          <p className="text-gray-600 mt-1">Cập nhật hồ sơ để đồng bộ trải nghiệm học tập của bạn.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <Card className="border-2 border-amber-300 bg-gradient-to-br from-yellow-50 to-amber-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-900">Hồ sơ hiện tại</CardTitle>
            <CardDescription className="text-amber-900/80">Thông tin hiển thị trên hệ thống Hồn Sử Việt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handlePickAvatar}
              disabled={isUploadingAvatar || isUpdatingPresetAvatar}
              className="relative w-24 h-24 rounded-full overflow-hidden shadow-lg ring-2 ring-amber-500 disabled:opacity-70"
              title="Nhấn để đổi ảnh đại diện"
            >
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-700 to-amber-500 text-white flex items-center justify-center text-3xl font-bold">
                  {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-[10px] py-1 flex items-center justify-center gap-1">
                <Camera className="w-3 h-3" />
                {isUploadingAvatar ? "Đang tải..." : "Đổi ảnh"}
              </div>
            </button>
            <p className="text-xs text-amber-900/80">Nhấn vào ảnh để upload avatar từ máy</p>
  
            <div>
              <p className="text-xl font-bold text-gray-900">{currentUser?.name || "Người dùng"}</p>
              <p className="text-sm text-gray-600">{currentUser?.email}</p>
            </div>
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
              <ShieldCheck className="w-3 h-3 mr-1" />
              {currentUser?.emailVerified ? "Email đã xác thực" : "Email chưa xác thực"}
            </Badge>
            <div className="rounded-xl border border-amber-300 bg-white/70 p-4 text-sm text-gray-700 space-y-2">
              <p className="flex items-center gap-2"><User className="w-4 h-4 text-red-700" /> Tên hiển thị: {currentUser?.name || "Chưa cập nhật"}</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-red-700" /> Email: {currentUser?.email || "Chưa cập nhật"}</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-red-700" /> Số điện thoại: {currentUser?.phone || "Chưa cập nhật"}</p>
            </div>
            <Link to="/profile/change-password" className="block">
              <Button className="w-full bg-red-700 hover:bg-red-800">
                <KeyRound className="w-4 h-4 mr-2" />
                Đi tới đổi mật khẩu
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-700 to-amber-700 text-white rounded-t-xl">
            <CardTitle>Cập nhật thông tin cá nhân</CardTitle>
            <CardDescription className="text-amber-100">Thay đổi tên và số điện thoại của bạn</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Họ và tên</label>
                  <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Nhập họ và tên" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Số điện thoại</label>
                  <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="Nhập số điện thoại" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
