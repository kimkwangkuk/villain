import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import HomePage from './pages/home';
import PostDetail from './pages/post-detail';
import SignupPage from './pages/signup';
import AddPostPage from './pages/add-post';
import MyPage from './pages/MyPage';
import NotificationsPage from './pages/notifications';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import UserPage from './pages/UserPage';
import PrivacyPolicy from './pages/privacy';
import Terms from './pages/terms';
import Footer from './components/Footer';

// 네비게이션바를 표시하지 않을 라우트 목록
const noNavbarRoutes = ['/login', '/signup'];

// 레이아웃을 관리할 컴포넌트
function AppLayout({ children }) {
  const location = useLocation();
  const shouldShowNavbar = !noNavbarRoutes.includes(location.pathname);

  return (
    <div className="bg-white dark:bg-black min-h-screen">
      {shouldShowNavbar && <Navbar />}
      {shouldShowNavbar ? <Layout>{children}</Layout> : children}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<SignupPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route 
                path="/posts/new" 
                element={
                  <PrivateRoute>
                    <AddPostPage />
                  </PrivateRoute>
                } 
              />
              <Route path="/posts/:id" element={<PostDetail />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/user/:userId" element={<UserPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </ThemeProvider>
      <Footer />
    </BrowserRouter>
  );
}

export default App; 