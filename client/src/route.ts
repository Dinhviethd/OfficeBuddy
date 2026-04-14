
import { lazy } from 'react'
import {App} from "./App";
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'

const AuthLayout = lazy(() => import('@/features/auth/layouts/AuthLayout'))
const MainLayout = lazy(() => import('@/components/shared/MainLayout'))

const Login = lazy(() => import('@/features/auth/components/LoginPage'))
const SignupForm = lazy(() => import('@/features/auth/components/Register').then(m => ({ default: m.SignupForm })))
const ResetPassword = lazy(() => import('@/features/auth/components/ResetPassword'))
const ProfilePage = lazy(() => import('@/features/auth/pages/ProfilePage'))
const ChangePasswordPage = lazy(() => import('@/features/auth/pages/ChangePasswordPage'))

const Home = lazy(() => import('@/features/homepage/pages/HomePage').then(m => ({ default: m.Home })))
const HonSuVietLessons = lazy(() => import('@/features/lesson/pages/LessonsPage'))
const HonSuVietLessonDetail = lazy(() => import('@/features/lesson/pages/LessonDetailPage'))
const HonSuVietTests = lazy(() => import('@/features/test-page/pages/TestsPage'))
const HonSuVietTestAttempt = lazy(() => import('@/features/test-page/pages/TestAttemptPage'))
const HonSuVietTestHistory = lazy(() => import('@/features/test-page/pages/TestHistoryPage'))
const HonSuVietResources = lazy(() => import('@/features/hon-su-viet/pages/ResourcesPage'))
// const HonSuVietForum = lazy(() => import('@/features/hon-su-viet/pages/ForumPage'))
const HonSuVietDiscovery = lazy(() => import('@/features/hon-su-viet/pages/DiscoveryPage'))
// const HonSuVietDictionary = lazy(() => import('@/features/hon-su-viet/pages/DictionaryPage'))
// const HonSuVietGames = lazy(() => import('@/features/hon-su-viet/pages/GamesPage'))
const CommingSoon = lazy(() => import('@/components/shared/CommingSoon'))
const routes = [
  {
    path: "/",
    Component: App,
    children: [
      {
        children: [
          {
            Component: MainLayout,
            children: [
              { index: true, Component: Home },
              { path: "lessons", Component: HonSuVietLessons },
              { path: "tests", Component: HonSuVietTests },
              { path: "resources", Component: HonSuVietResources },
              { path: "forum", Component: HonSuVietDiscovery },
              { path: "dictionary", Component: CommingSoon },
              { path: "games", Component: CommingSoon },
              {
                Component: ProtectedRoute,
                children: [
                  { path: "lessons/:id", Component: HonSuVietLessonDetail },
                  { path: "tests/:id", Component: HonSuVietTestAttempt },
                  { path: "tests/:id/history", Component: HonSuVietTestHistory },
                  { path: "profile", Component: ProfilePage },
                  { path: "profile/change-password", Component: ChangePasswordPage },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "auth",
        Component: AuthLayout,
        children: [
          { path: "login", Component: Login },
          { path: "register", Component: SignupForm },
          { path: "reset-password", Component: ResetPassword },
        ],
      },
    ],
  },
];

export default routes;