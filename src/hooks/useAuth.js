import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/auth.service';

export function useAuth() {
  const { user, setUser, isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  const handleLogin = async (email, password) => {
    try {
      const user = await authService.login(email, password);
      setUser(user);
      setIsLoggedIn(true);
      // 로그인 정보 저장
      localStorage.setItem('isLoggedIn', 'true');
      return user;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem('isLoggedIn');
    } catch (error) {
      throw error;
    }
  };

  const handleSignup = async (email, password) => {
    try {
      const user = await authService.signup(email, password);
      setUser(user);
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      return user;
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    isLoggedIn,
    login: handleLogin,
    logout: handleLogout,
    signup: handleSignup
  };
} 