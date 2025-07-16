import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAdmin } from "../context/AdminContext";
import Logo from "../assets/icons/runacossLogo.svg?url";
import { HiMenu, HiX, HiUser, HiLogout, HiCog } from "react-icons/hi";

const navLinks = [
  { name: "Home", path: "home" },
  { name: "About us", path: "about-runacoss" },
  { name: "Programs", path: "programs" },
  { name: "News", path: "news" },
  { name: "Repository", path: "repository" },
  { name: "Blogs", path: "blogs" },
  { name: "Dues", path: "dues" },
  { name: "Contact", path: "contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isClickingRef = useRef(false);
  const { user, logout, loading } = useAuth();
  const { admin, logout: adminLogout, isAuthenticated: isAdminAuthenticated } = useAdmin();

  useEffect(() => {
    const currentPath = location.pathname.replace("/", "");
    const matched = navLinks.find((link) => currentPath.includes(link.path));
    if (matched) {
      setActiveSection(matched.path);
    } else {
      setActiveSection("home");
    }
  }, [location]);

  useEffect(() => {
    const isHome = location.pathname === "/home";
    let observer: IntersectionObserver | null = null;

    if (isHome) {
      const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.6,
      };

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isClickingRef.current) {
            setActiveSection(entry.target.id);
          }
        });
      }, observerOptions);

      navLinks.forEach((link) => {
        const section = document.getElementById(link.path);
        if (section && observer) observer.observe(section);
      });
    }

    const handleScrollTop = () => {
      if (location.pathname === "/home" && window.scrollY <= 10) {
        if (!isClickingRef.current) {
          setActiveSection("home");
        }
      }
    };

    window.addEventListener("scroll", handleScrollTop);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("scroll", handleScrollTop);
    };
  }, [location.pathname]);

  const handleClick = (path: string) => {
    isClickingRef.current = true;

    // Special handling for About Us - always go to /about-runacoss
    if (path === "about-runacoss") {
      navigate('/about-runacoss');
      setIsOpen(false);
      return;
    }

    // Special handling for dues - navigate to payment page
    if (path === "dues") {
      navigate('/dues');
      setIsOpen(false);
      return;
    }

    // Special handling for repository - always go to public landing page
    if (path === "repository") {
      navigate('/repository');
      setIsOpen(false);
      return;
    }

    // Special handling for Programs - always go to /programs
    if (path === "programs") {
      navigate('/programs');
      setIsOpen(false);
      return;
    }

    // Special handling for News - always go to /news
    if (path === "news") {
      navigate('/news');
      setIsOpen(false);
      return;
    }

    // Special handling for Blogs - always go to /blogs
    if (path === "blogs") {
      navigate('/blogs');
      setIsOpen(false);
      return;
    }

    // Seamless navigation to home
    if (path === "home") {
      if (location.pathname !== "/home") {
        navigate('/home');
      } else {
        const section = document.getElementById(path);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
        setActiveSection(path);
      }
      setTimeout(() => {
        isClickingRef.current = false;
      }, 1000);
      setIsOpen(false);
      return;
    }

    if (location.pathname !== "/home") {
      window.location.href = `/home#${path}`;
    } else {
      const section = document.getElementById(path);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
      setActiveSection(path);
    }

    setTimeout(() => {
      isClickingRef.current = false;
    }, 1000);

    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      if (isAdminAuthenticated) {
        await adminLogout();
        navigate('/home');
      } else {
        await logout();
        navigate('/home');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setShowUserMenu(false);
  };

  const handleAuthClick = () => {
    if (isAdminAuthenticated) {
      setShowUserMenu(!showUserMenu);
    } else if (user) {
      setShowUserMenu(!showUserMenu);
    } else {
      navigate('/login');
    }
  };

  const handleAdminDashboard = () => {
    navigate('/admin/dashboard');
    setShowUserMenu(false);
  };

  const handleUserDashboard = () => {
    navigate('/dashboard');
    setShowUserMenu(false);
  };

  const getCurrentUser = () => {
    if (isAdminAuthenticated && admin) {
      return {
        name: `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        role: admin.role,
        isAdmin: true
      };
    } else if (user) {
      return {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role || 'user',
        isAdmin: false
      };
    }
    return null;
  };

  const currentUser = getCurrentUser();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-primary text-white px-6 md:px-20 py-3 flex justify-between items-center mb-16">
      <div className="flex items-center space-x-3">
        <img src={Logo} alt="RUNACOSS Logo" className="w-7 h-7" />
        <span className="text-lg font-semibold text-white">
          RUNA<span className="text-secondary">COSS</span>
        </span>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center space-x-8">
        <ul className="flex space-x-8 text-sm font-light">
          {navLinks.map(({ name, path }) => (
            <li key={path}>
              <button
                onClick={() => handleClick(path)}
                className={`transition-colors duration-200 ${
                  activeSection === path
                    ? "text-secondary font-semibold"
                    : "text-white hover:text-secondary"
                }`}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>

        {/* Auth Section */}
        <div className="relative">
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAuthClick}
                className="flex items-center space-x-2 text-white hover:text-secondary transition-colors"
              >
                <HiUser className="w-5 h-5" />
                <span className="text-sm">
                  {currentUser.name}
                  {currentUser.isAdmin && (
                    <span className="ml-1 text-xs bg-red-600 px-1 rounded">ADMIN</span>
                  )}
                </span>
              </button>
              
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="text-gray-500">{currentUser.email}</p>
                    <p className="text-xs text-gray-400 capitalize">{currentUser.role}</p>
                  </div>
                  
                  {currentUser.isAdmin ? (
                    <button
                      onClick={handleAdminDashboard}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <HiCog className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleUserDashboard}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <HiCog className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <HiLogout className="w-4 h-4" />
                    <span>{loading ? 'Signing out...' : 'Sign out'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleAuthClick}
              className="bg-secondary text-primary px-4 py-2 rounded-lg font-medium hover:bg-secondary/90 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile Icon */}
      <div className="md:hidden flex items-center space-x-4">
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="absolute top-16 left-0 w-full bg-primary text-white flex flex-col items-center space-y-4 py-4 md:hidden shadow-lg">
          {navLinks.map(({ name, path }) => (
            <li key={path}>
              <button
                onClick={() => handleClick(path)}
                className={`transition-colors duration-200 ${
                  activeSection === path
                    ? "text-secondary font-semibold"
                    : "hover:text-secondary"
                }`}
              >
                {name}
              </button>
            </li>
          ))}
          {/* Mobile User Menu */}
          {currentUser ? (
            <li className="w-full border-t border-white/20 pt-4">
              <div className="text-center mb-2">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-gray-300">{currentUser.email}</p>
                <p className="text-xs text-gray-300 capitalize">{currentUser.role}</p>
                {currentUser.isAdmin && (
                  <span className="text-xs bg-red-600 px-1 rounded">ADMIN</span>
                )}
              </div>
              {currentUser.isAdmin ? (
                <button
                  onClick={handleAdminDashboard}
                  className="w-full flex items-center justify-center space-x-2 text-sm hover:text-secondary transition-colors mb-2"
                >
                  <HiCog className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </button>
              ) : (
                <button
                  onClick={handleUserDashboard}
                  className="w-full flex items-center justify-center space-x-2 text-sm hover:text-secondary transition-colors mb-2"
                >
                  <HiCog className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 text-sm hover:text-secondary transition-colors"
              >
                <HiLogout className="w-4 h-4" />
                <span>{loading ? 'Signing out...' : 'Sign out'}</span>
              </button>
            </li>
          ) : (
            <li className="w-full border-t border-white/20 pt-4">
              <button
                onClick={handleAuthClick}
                className="w-full flex items-center justify-center bg-secondary text-primary px-4 py-2 rounded-lg font-medium hover:bg-secondary/90 transition-colors"
              >
                Login
              </button>
            </li>
          )}
        </ul>
      )}

      {/* Mobile User Menu Overlay */}
      {showUserMenu && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}>
          <div className="absolute top-16 right-6 w-48 bg-white rounded-md shadow-lg py-1">
            <div className="px-4 py-2 text-sm text-gray-700 border-b">
              <p className="font-medium">{currentUser?.name}</p>
              <p className="text-gray-500">{currentUser?.email}</p>
              <p className="text-xs text-gray-400 capitalize">{currentUser?.role}</p>
            </div>
            
            {currentUser?.isAdmin ? (
              <button
                onClick={handleAdminDashboard}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <HiCog className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </button>
            ) : (
              <button
                onClick={handleUserDashboard}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <HiCog className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            )}
            
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
              <HiLogout className="w-4 h-4" />
              <span>{loading ? 'Signing out...' : 'Sign out'}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
