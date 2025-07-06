import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
// At the top of client/src/components/Layout.jsx
import './Layout.css';

const Layout = () => {
  return (
    <div className="site-wrapper"> {/* Add a wrapper div */}
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;