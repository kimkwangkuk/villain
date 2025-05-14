import { useLocation } from 'react-router-dom';

function Layout({ children }) {
  const location = useLocation();
  // /posts/new 경로에서는 pt-16 클래스를 적용하지 않음
  const isAddPostPage = location.pathname === '/posts/new';
  
  return (
    <div className={isAddPostPage ? '' : 'pt-16'}>
      {children}
    </div>
  );
}

export default Layout; 