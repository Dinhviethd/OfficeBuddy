import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/features/auth/services/authService";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { toast } from "sonner";
import { useNavigate, Link, useSearchParams } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        fieldErrors[field as keyof typeof fieldErrors] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        toast.success("Đăng nhập thành công!");
        navigate(redirectTo);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-4 border-yellow-500 bg-gradient-to-br from-red-50 to-amber-50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-black text-red-800 flex items-center gap-2">
          <span className="text-3xl"></span>
          Đăng nhập Hồn Sử Việt
        </CardTitle>
        <CardDescription className="text-gray-600">
          Đăng nhập để lưu tiến độ học tập và tham gia thử thách!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-gray-700 font-medium">
              Email
            </Label>
            <Input
              id="login-email"
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-amber-300 focus:border-red-500"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-gray-700 font-medium">
              Mật khẩu
            </Label>
            <Input
              id="login-password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 border-amber-300 focus:border-red-500"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 font-bold text-lg h-12"
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
          <div className="text-center space-y-2">
            <Link to="/auth/register">
              <Button
                type="button"
                variant="outline"
                className="w-full border-2 border-yellow-500 text-red-700 hover:bg-yellow-50 font-medium "
              >
                Đăng ký tài khoản mới
              </Button>
            </Link>
            <Link
              to="/auth/reset-password"
              className="block text-sm text-red-700 font-medium underline hover:text-red-800"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}