import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/home';
import PostDetail from './pages/post-detail';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';
import AddPostPage from './pages/add-post';
import MyPage from './pages/MyPage';
import NotificationsPage from './pages/notifications';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/posts/new" element={<AddPostPage />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; 