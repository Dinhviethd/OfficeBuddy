import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authService } from "@/features/auth/services/authService";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      const response = await authService.changePassword(form);
      toast.success(response.message || "Đổi mật khẩu thành công");
      navigate("/profile");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể đổi mật khẩu");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/profile">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Đổi mật khẩu</h1>
          <p className="text-gray-600 mt-1">Thiết lập lại mật khẩu để bảo vệ tài khoản học tập của bạn.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Lưu ý bảo mật
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 space-y-3">
            <p>Mật khẩu nên có ít nhất 6 ký tự.</p>
            <p>Nên chứa chữ hoa, chữ thường và số để đảm bảo an toàn.</p>
            <p>Không chia sẻ mật khẩu của bạn với người khác.</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-700 to-amber-700 text-white rounded-t-xl">
            <CardTitle>Thông tin mật khẩu</CardTitle>
            <CardDescription className="text-amber-100">Nhập mật khẩu hiện tại và mật khẩu mới của bạn</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Mật khẩu hiện tại</label>
                <Input type="password" value={form.currentPassword} onChange={(e) => handleChange("currentPassword", e.target.value)} placeholder="Nhập mật khẩu hiện tại" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Mật khẩu mới</label>
                <Input type="password" value={form.newPassword} onChange={(e) => handleChange("newPassword", e.target.value)} placeholder="Nhập mật khẩu mới" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Xác nhận mật khẩu mới</label>
                <Input type="password" value={form.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} placeholder="Nhập lại mật khẩu mới" />
              </div>

              <div className="flex justify-end gap-3">
                <Link to="/profile">
                  <Button type="button" variant="outline">Quay lại hồ sơ</Button>
                </Link>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Đang cập nhật..." : "Lưu mật khẩu mới"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
