import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-effect shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-primary text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-glow group-hover:scale-110 transition-transform">
              🏥
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                HealthEase
              </span>
              <p className="text-xs text-gray-500 font-medium">AI-Powered Healthcare</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/upload" 
                  className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-all font-medium group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">📤</span>
                  <span>Upload</span>
                </Link>
                <Link 
                  to="/prescriptions" 
                  className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-all font-medium group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">📋</span>
                  <span>Prescriptions</span>
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-all font-medium group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">👤</span>
                  <span>Profile</span>
                </Link>
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-300">
                  <div className="bg-primary-50 px-3 py-2 rounded-lg">
                    <span className="text-sm text-primary-800 font-semibold">
                      {user?.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-accent-500 text-white px-5 py-2 rounded-xl hover:bg-accent-600 transition-all font-medium shadow-md hover:shadow-glow-accent transform hover:scale-105"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-primary-600 transition-all font-medium px-4"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="gradient-primary text-white px-6 py-2.5 rounded-xl hover:shadow-glow transition-all font-medium shadow-md transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
