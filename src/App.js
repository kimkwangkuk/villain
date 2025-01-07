import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/home';
import PostDetail from './pages/post-detail';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';
import AddPostPage from './pages/add-post';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/posts/new" element={<AddPostPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App; 