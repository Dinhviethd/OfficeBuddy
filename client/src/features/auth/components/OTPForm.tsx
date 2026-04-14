import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface OTPFormProps extends React.ComponentProps<typeof Card> {
  email: string
  otp: string
  setOtp: (otp: string) => void
  onSubmit: (e: React.FormEvent) => void
  onResend: () => void
  loading?: boolean
}

export function OTPForm({ 
  email, 
  otp, 
  setOtp, 
  onSubmit, 
  onResend,
  loading = false,
  ...props 
}: OTPFormProps) {
  return (
    <Card className="border-4 border-yellow-500 bg-gradient-to-br from-red-50 to-amber-50 shadow-xl" {...props}>
      <CardHeader>
        <CardTitle className="text-2xl font-black text-red-800 flex items-center gap-2">
          Nhập mã xác thực
        </CardTitle>
        <CardDescription className="text-gray-600">
          Chúng tôi đã gửi mã 6 chữ số đến email <strong className="text-red-700">{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-gray-700 font-medium">Mã xác thực</Label>
            <InputOTP 
              maxLength={6} 
              id="otp" 
              value={otp}
              onChange={setOtp}
              disabled={loading}
            >
              <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border-2 *:data-[slot=input-otp-slot]:border-amber-300">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-gray-500">
              Nhập mã 6 chữ số đã được gửi đến email của bạn.
            </p>
          </div>
          <Button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 font-bold text-lg h-12"
          >
            {loading ? "Đang xác thực..." : "Xác thực"}
          </Button>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Không nhận được mã?{" "}
              <button 
                type="button" 
                onClick={onResend}
                disabled={loading}
                className="text-red-700 font-medium underline hover:text-red-800 disabled:opacity-50"
              >
                Gửi lại
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
