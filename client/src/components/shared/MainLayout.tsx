import { Suspense } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Trophy, MessageSquare, BookMarked, Library, FileText, GraduationCap, Search, User, LogIn, ChevronDown, Settings, KeyRound, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PageLoadingFallback } from "@/components/shared/LoadingFallback";
import { useState } from "react";
import { useAuth } from "@/features/auth/stores/authStore";
import { authService } from "@/features/auth/services/authService";
import { toast } from "sonner";

const navigation = [
  { name: "Trang chủ", href: "/", icon: BookOpen },
  { name: "Bài học", href: "/lessons", icon: GraduationCap },
  { name: "Kiểm tra", href: "/tests", icon: FileText },
  { name: "Khám phá", href: "/resources", icon: Library },
  { name: "Diễn đàn", href: "/forum", icon: MessageSquare },
  { name: "Từ điển", href: "/dictionary", icon: BookMarked },
];

export default function HonSuVietLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const openLoginModal = () => {
    navigate("/auth/login", {
      state: { backgroundLocation: { ...location, authModal: "login" } },
    });
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
      toast.success("Đăng xuất thành công");
      navigate("/");
    } catch {
      toast.error("Không thể đăng xuất. Vui lòng thử lại.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const { user, isAuthenticated } = useAuth();

  const userProgress = isAuthenticated && user
    ? {
        name: user.name,
        level: 1,
        energy: 0,
        badges: 0,
      }
    : {
        name: "Khách",
        level: 1,
        energy: 0,
        badges: 0,
      };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-red-800 via-red-700 to-amber-800 text-white shadow-2xl border-b-4 border-yellow-500 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
        </div>

        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                <img src="/logo.png" alt="" />
              </div>
              <div>
                <h1 className="font-black text-2xl tracking-wide bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 bg-clip-text text-transparent drop-shadow-lg">
                  HỒN SỬ VIỆT
                </h1>
                <p className="text-xs text-yellow-200 font-medium"> Ngược dòng thời gian - Khám phá Sử Việt</p>
              </div>
            </Link>

            {/* Search Bar & Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm bài học, nhân vật..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  className="pl-10 pr-4 py-2 w-64 bg-white/90 border-2 border-yellow-400 focus:border-yellow-300 text-gray-800 placeholder:text-gray-500"
                />
                {isSearchOpen && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border-2 border-yellow-400 max-h-96 overflow-y-auto">
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-2">Kết quả tìm kiếm:</p>
                      <div className="space-y-2">
                        <div className="p-2 hover:bg-amber-50 rounded cursor-pointer">
                          <p className="text-sm font-medium text-gray-800">Khởi nghĩa Hai Bà Trưng</p>
                          <p className="text-xs text-gray-500">Bài học • Thời Bắc thuộc</p>
                        </div>
                        <div className="p-2 hover:bg-amber-50 rounded cursor-pointer">
                          <p className="text-sm font-medium text-gray-800">Trống Đồng Đông Sơn</p>
                          <p className="text-xs text-gray-500">Tư liệu • Văn hóa cổ đại</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                  <div>
                    <p className="text-xs text-yellow-200">Cấp độ</p>
                    <p className="font-bold text-sm">{userProgress.level}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20 min-w-[160px]">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-yellow-200">Năng lượng</p>
                  <p className="text-xs font-bold">{userProgress.energy}/100</p>
                </div>
                <Progress value={userProgress.energy} className="h-2 bg-red-900/50" />
              </div>

              <Badge className="bg-yellow-500 text-red-900 hover:bg-yellow-400 px-3 py-1 font-bold cursor-pointer">
                {userProgress.badges} 🏅
              </Badge>

              {isAuthenticated ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-3 rounded-full px-2 py-1 hover:bg-white/10 transition-colors"
                    >
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="Avatar"
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-yellow-300"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-red-900 font-black flex items-center justify-center ring-2 ring-yellow-300">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <span className="font-bold text-yellow-100 max-w-[140px] truncate">{user?.name}</span>
                      <ChevronDown className="w-4 h-4 text-yellow-200" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-64 p-2 border-2 border-yellow-500 bg-amber-50">
                    <div className="px-3 py-2 border-b border-amber-200 mb-2">
                      <p className="font-bold text-red-900">{user?.name}</p>
                      <p className="text-sm text-amber-900/80">{user?.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/profile')}
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-red-900 hover:bg-yellow-100 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Đổi thông tin cá nhân
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/profile/change-password')}
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-red-900 hover:bg-yellow-100 transition-colors"
                    >
                      <KeyRound className="w-4 h-4" />
                      Đổi mật khẩu
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-red-700 hover:bg-red-100 transition-colors disabled:opacity-60"
                    >
                      <LogOut className="w-4 h-4" />
                      {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                    </button>
                  </PopoverContent>
                </Popover>
              ) : (
                <Button
                  onClick={openLoginModal}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-red-900 hover:from-yellow-500 hover:to-yellow-600 font-bold shadow-lg border-2 border-yellow-600"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Đăng nhập
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button size="sm" variant="ghost" className="text-white" onClick={() => setIsSearchOpen(true)}>
                <Search className="w-5 h-5" />
              </Button>
              {isAuthenticated ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-yellow-300"
                    >
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-amber-500 text-red-900 font-black flex items-center justify-center">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-60 p-2 border-2 border-yellow-500 bg-amber-50">
                    <button
                      type="button"
                      onClick={() => navigate('/profile')}
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-red-900 hover:bg-yellow-100 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Đổi thông tin cá nhân
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/profile/change-password')}
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-red-900 hover:bg-yellow-100 transition-colors"
                    >
                      <KeyRound className="w-4 h-4" />
                      Đổi mật khẩu
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-red-700 hover:bg-red-100 transition-colors disabled:opacity-60"
                    >
                      <LogOut className="w-4 h-4" />
                      {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                    </button>
                  </PopoverContent>
                </Popover>
              ) : (
                <Button size="sm" className="bg-yellow-500 text-red-900" onClick={openLoginModal}>
                  <User className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="pb-3">
            <ul className="flex space-x-1 overflow-x-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || 
                  (item.href !== "/" && location.pathname.startsWith(item.href));
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-all ${
                        isActive
                          ? "bg-amber-50 text-red-700 shadow-lg border-t-2 border-x-2 border-yellow-500 font-bold"
                          : "text-yellow-100 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

    
      {/* Main Content */}
      <main className="min-h-[calc(100vh-140px)]" onClick={() => setIsSearchOpen(false)}>
        <Suspense fallback={<PageLoadingFallback />}>
          <Outlet />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-900 via-red-900 to-amber-900 text-amber-100 border-t-4 border-yellow-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
        </div>
        
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-yellow-300 mb-3 text-lg">Về Hồn Sử Việt</h3>
              <p className="text-sm text-amber-200">
                Nền tảng học tập lịch sử Việt Nam dành cho học sinh THCS, 
                mang đến trải nghiệm học tập sinh động, tôn vinh bản sắc dân tộc.
              </p>
              <p className="text-xs text-yellow-300 mt-3 font-medium italic">
                "Ngược dòng thời gian - Khám phá Sử Việt"
              </p>
            </div>
            <div>
              <h3 className="font-bold text-yellow-300 mb-3 text-lg">Liên hệ</h3>
              <p className="text-sm text-amber-200">Email: contact@honsuviet.edu.vn</p>
              <p className="text-sm text-amber-200">Hotline: 1900-xxxx</p>
            </div>
            <div>
              <h3 className="font-bold text-yellow-300 mb-3 text-lg">Nguồn tham khảo</h3>
              <ul className="text-sm text-amber-200 space-y-1">
                <li>• Bảo tàng Lịch sử Quốc gia</li>
                <li>• Người kể sử</li>
                <li>• Đại Việt Kỳ Nhân</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-amber-700 text-center">
            <p className="text-sm text-yellow-300 font-bold">
              © 2026 Hồn Sử Việt - Khơi nguồn tự hào dân tộc
            </p>
            <p className="text-xs text-amber-300 mt-1">
              "Học lịch sử để hiểu hiện tại và xây dựng tương lai"
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
