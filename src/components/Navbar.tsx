import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X, User, BookmarkCheck, LogIn, LogOut, Home, Settings } from "lucide-react";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-navy text-white py-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold flex items-center" onClick={closeMenu}>
            <div className="w-10 h-10 bg-white text-navy rounded-full flex items-center justify-center mr-2">
              <span className="font-bold">CS</span>
            </div>
            <span className="hidden sm:inline">Cyber Savvy</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-gray-300 transition-colors flex items-center gap-1">
              <Home size={18} /> Home
            </Link>
            <Link to="/articles" className="hover:text-gray-300 transition-colors">
              Articles
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/bookmarks" className="hover:text-gray-300 transition-colors flex items-center gap-1">
                  <BookmarkCheck size={18} /> My Bookmarks
                </Link>
                <Link to="/settings" className="hover:text-gray-300 transition-colors flex items-center gap-1">
                  <Settings size={18} /> Settings
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">
                    Hi, {user?.username}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:bg-navy-light text-white transition-colors"
                    onClick={logout}
                  >
                    <LogOut size={18} className="mr-1" /> Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="hover:bg-navy-light text-white transition-colors">
                  <Link to="/login">
                    <LogIn size={18} className="mr-1" /> Login
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="sm" className="transition-colors">
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2 rounded-full hover:bg-navy-light transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="py-4 space-y-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 hover:bg-navy-light px-3 py-2 rounded transition-colors"
              onClick={closeMenu}
            >
              <Home size={18} /> Home
            </Link>
            <Link 
              to="/articles" 
              className="block hover:bg-navy-light px-3 py-2 rounded transition-colors"
              onClick={closeMenu}
            >
              Articles
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/bookmarks" 
                  className="flex items-center gap-2 hover:bg-navy-light px-3 py-2 rounded transition-colors"
                  onClick={closeMenu}
                >
                  <BookmarkCheck size={18} /> My Bookmarks
                </Link>
                <Link 
                  to="/settings" 
                  className="flex items-center gap-2 hover:bg-navy-light px-3 py-2 rounded transition-colors"
                  onClick={closeMenu}
                >
                  <Settings size={18} /> Settings
                </Link>
                <div className="border-t border-navy pt-2">
                  <div className="flex items-center gap-2 px-3 py-1">
                    <User size={18} />
                    <span className="text-sm">{user?.username}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:bg-navy-light w-full justify-start mt-2 text-white transition-colors"
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                  >
                    <LogOut size={18} className="mr-2" /> Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="border-t border-navy pt-2 flex flex-col gap-2">
                <Button 
                  asChild
                  variant="ghost" 
                  size="sm" 
                  className="hover:bg-navy-light justify-start text-white transition-colors"
                >
                  <Link to="/login" onClick={closeMenu}>
                    <LogIn size={18} className="mr-2" /> Login
                  </Link>
                </Button>
                <Button 
                  asChild
                  variant="secondary" 
                  size="sm"
                  className="transition-colors"
                >
                  <Link to="/register" onClick={closeMenu}>Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
