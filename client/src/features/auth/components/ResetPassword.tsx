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
import { OTPForm } from "./OTPForm"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { authService } from "@/features/auth/services/authService"
import { toast } from "sonner"
import { forgotPasswordSchema, verifyOTPSchema, resetPasswordSchema } from "@/features/auth/schemas/auth.schema"

type Step = "email" | "otp" | "reset"

export default function ResetPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>("email")
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = forgotPasswordSchema.safeParse({ email })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string
        if (!fieldErrors[field]) fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)

    try {
      const response = await authService.sendOTP({ email })
      
      if (response.success) {
        toast.success(response.message || "Mã xác thực đã được gửi đến email của bạn")
        setStep("otp")
        setErrors({})
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Gửi mã xác thực thất bại"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = verifyOTPSchema.safeParse({ email, otp })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string
        if (!fieldErrors[field]) fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      toast.error(fieldErrors.otp || "OTP không hợp lệ")
      return
    }

    setLoading(true)

    try {
      const response = await authService.verifyOTP({ email, otp })
      
      if (response.success) {
        toast.success(response.message || "Xác thực thành công")
        setStep("reset")
        setErrors({})
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Mã xác thực không hợp lệ"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)

    try {
      const response = await authService.sendOTP({ email })
      
      if (response.success) {
        toast.success("Mã xác thực mới đã được gửi đến email của bạn")
        setOtp("")
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Gửi lại mã thất bại"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = resetPasswordSchema.safeParse({
      email,
      otp,
      newPassword: passwords.newPassword,
      confirmPassword: passwords.confirmPassword,
    })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string
        if (!fieldErrors[field]) fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)

    try {
      const response = await authService.resetPassword({
        email,
        otp,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      })
      
      if (response.success) {
        toast.success(response.message || "Đặt lại mật khẩu thành công!")
        navigate("/auth/login")
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Đặt lại mật khẩu thất bại"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (step === "email") {
    return (
      <div className="flex flex-col gap-6">
        <Card className="border-4 border-yellow-500 bg-gradient-to-br from-red-50 to-amber-50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-red-800 flex items-center gap-2">
              Quên mật khẩu
            </CardTitle>
            <CardDescription className="text-gray-600">
              Nhập email để nhận mã xác thực
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) {
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.email
                        return next
                      })
                    }
                  }}
                  disabled={loading}
                  className="border-2 border-amber-300 focus:border-red-500"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
                <p className="text-xs text-gray-500">
                  Chúng tôi sẽ gửi mã xác thực 6 chữ số đến email này.
                </p>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 font-bold text-lg h-12"
              >
                {loading ? "Đang gửi..." : "Gửi mã xác thực"}
              </Button>
              <div className="text-center">
                <Link to="/auth/login" className="text-sm text-red-700 font-medium underline hover:text-red-800">
                  Quay lại Đăng nhập
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "otp") {
    return (
      <div className="flex flex-col gap-4">
        <OTPForm
          email={email}
          otp={otp}
          setOtp={setOtp}
          onSubmit={handleVerifyOTP}
          onResend={handleResendOTP}
          loading={loading}
        />
        <Button 
          variant="outline" 
          onClick={() => setStep("email")}
          className="w-full border-2 border-yellow-500 text-red-700 hover:bg-yellow-50 font-medium"
        >
          Quay lại
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-4 border-yellow-500 bg-gradient-to-br from-red-50 to-amber-50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-red-800 flex items-center gap-2">
            Đặt lại mật khẩu
          </CardTitle>
          <CardDescription className="text-gray-600">
            Nhập mật khẩu mới cho tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-700 font-medium">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={passwords.newPassword}
                onChange={(e) => {
                  setPasswords({ ...passwords, newPassword: e.target.value })
                  if (errors.newPassword) {
                    setErrors((prev) => {
                      const next = { ...prev }
                      delete next.newPassword
                      return next
                    })
                  }
                }}
                disabled={loading}
                className="border-2 border-amber-300 focus:border-red-500"
              />
              <p className="text-xs text-gray-500">
                Ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số.
              </p>
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={passwords.confirmPassword}
                onChange={(e) => {
                  setPasswords({ ...passwords, confirmPassword: e.target.value })
                  if (errors.confirmPassword) {
                    setErrors((prev) => {
                      const next = { ...prev }
                      delete next.confirmPassword
                      return next
                    })
                  }
                }}
                disabled={loading}
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
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
