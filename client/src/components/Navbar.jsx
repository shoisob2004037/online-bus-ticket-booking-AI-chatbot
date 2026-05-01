import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, User, LogOut, Menu, X, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import Chatbot from './Chatbot';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleChat = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      setTimeout(() => {
        setShowLoginPrompt(false);
        navigate('/login');
      }, 2000);
    } else {
      setChatOpen(!chatOpen);
    }
    
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Bus className="w-8 h-8 text-secondary" />
              <span>BusGo</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              {isAuthenticated ? (
                isAdmin ? (
                  // ==================== ADMIN MENU (No Chat) ====================
                  <>
                    <Link to="/admin" className="border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors font-medium">
                      ড্যাশবোর্ড
                    </Link>
                    <Link to="/admin/topup-requests" className="border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors font-medium">
                      ক্রেডিট রিকুয়েস্ট দেখুন
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      লগআউট
                    </button>
                  </>
                ) : (
                  // ==================== NORMAL USER MENU ====================
                  <>
                    <Link to="/" className="border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors">হোম</Link>
                    <Link to="/search" className="border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors">বাস খুঁজুন</Link>
                    <Link to="/taka-dhukan" className="border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors">
                      ক্রেডিট রিকুয়েস্ট করুন
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors">
                      <User className="w-5 h-5" />
                      {user?.name}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      লগআউট
                    </button>

                    {/* Chat Button - Only for Normal Users */}
                    <button
                      onClick={toggleChat}
                      className="flex items-center gap-2 border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors relative"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="hidden lg:inline">চ্যাট</span>
                    </button>
                  </>
                )
              ) : (
                // Guest Menu
                <>
                  <Link to="/login" className="border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors">
                    লগইন
                  </Link>
                  <Link to="/register" className="border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors">
                    রেজিস্টার
                  </Link>
                  <Link to="/admin/register" className="border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors">
                    এডমিন রেজিস্টার
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              {/* Chat Button - Only for Normal Users on Mobile */}
              {!isAdmin && isAuthenticated && (
                <button onClick={toggleChat} className="p-2">
                  <MessageCircle className="w-6 h-6" />
                </button>
              )}
              
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-6 space-y-4">
              {isAuthenticated ? (
                isAdmin ? (
                  // Admin Mobile Menu
                  <>
                    <Link to="/admin" className="block border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      ড্যাশবোর্ড
                    </Link>
                    <Link to="/admin/topup-requests" className="block border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      ক্রেডিট রিকুয়েস্ট দেখুন
                    </Link>
                    <button onClick={handleLogout} className="block w-full text-left border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors">
                      লগআউট
                    </button>
                  </>
                ) : (
                  // Normal User Mobile Menu
                  <>
                    <Link to="/" className="block border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>হোম</Link>
                    <Link to="/search" className="block border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>বাস খুঁজুন</Link>
                    <Link to="/taka-dhukan" className="block border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      ক্রেডিট রিকুয়েস্ট করুন
                    </Link>
                    <Link to="/profile" className="block border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      প্রোফাইল
                    </Link>
                    <button onClick={handleLogout} className="block w-full text-left border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors">
                      লগআউট
                    </button>
                  </>
                )
              ) : (
                <>
                  <Link to="/login" className="block border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>লগইন</Link>
                  <Link to="/register" className="block border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>রেজিস্টার</Link>
                  <Link to="/admin/register" className="block border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>এডমিন রেজিস্টার</Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Login Prompt */}
      {showLoginPrompt && (
        <div className="fixed top-20 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ⚠️ চ্যাট ব্যবহার করতে লগইন করুন
        </div>
      )}

      <Chatbot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};

export default Navbar;

