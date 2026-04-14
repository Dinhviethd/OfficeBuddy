import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { authService } from "@/features/auth/services/authService"
import { toast } from "sonner"
import { registerSchema } from "@/features/auth/schemas/auth.schema"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData({
      ...formData,
      [id]: value,
    })
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate bằng Zod schema
    const result = registerSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)

    try {
      const response = await authService.register(result.data)
      
      if (response.success) {
        toast.success(response.message || "Đăng ký thành công!")
        navigate("/")
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Đăng ký thất bại"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-4 border-yellow-500 bg-gradient-to-br from-red-50 to-amber-50 shadow-xl" {...props}>
      <CardHeader>
        <CardTitle className="text-2xl font-black text-red-800 flex items-center gap-2">
          <span className="text-3xl"></span>
          Tạo tài khoản
        </CardTitle>
        <CardDescription className="text-gray-600">
          Nhập thông tin của bạn để tạo tài khoản mới
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 font-medium">Họ và tên</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              placeholder="Nhập họ và tên"
              className="border-2 border-amber-300 focus:border-red-500"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              placeholder="Nhập email"
              className="border-2 border-amber-300 focus:border-red-500"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700 font-medium">Số điện thoại (tùy chọn)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              placeholder="Nhập số điện thoại"
              className="border-2 border-amber-300 focus:border-red-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              placeholder="Nhập mật khẩu"
              className="border-2 border-amber-300 focus:border-red-500"
            />
            <p className="text-xs text-gray-500">
              Ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số.
            </p>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
              Xác nhận mật khẩu
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              placeholder="Nhập lại mật khẩu"
              className="border-2 border-amber-300 focus:border-red-500"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 font-bold text-lg h-12"
          >
            {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </Button>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <Link to="/auth/login" className="text-red-700 font-medium underline hover:text-red-800">
                Đăng nhập
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
