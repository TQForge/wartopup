import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Wallet, User as UserIcon, X, Home, ShoppingBag, Hash, ArrowRightLeft, PlusCircle, MessageCircle, Headphones } from 'lucide-react';
import { cn } from '../lib/utils';
import { AvatarImage } from './AvatarImage';

export default function Header() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { icon: Home, label: 'My Account', path: '/profile' },
    { icon: ShoppingBag, label: 'My Orders', path: '/orders' },
    { icon: Hash, label: 'My Codes', path: '/codes' },
    { icon: ArrowRightLeft, label: 'My Transaction', path: '/transactions' },
    { icon: PlusCircle, label: 'Add Money', path: '/add-money' },
    { icon: MessageCircle, label: 'Contact Us', path: '/contact' },
  ];

  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 transition-all duration-300 px-0 py-3 lg:py-4 pt-[calc(12px+env(safe-area-inset-top,0px))]",
        scrolled 
          ? "bg-white/80 backdrop-blur-md border-b border-gray-200/50" 
          : "bg-white"
      )}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between w-full">
          <Link to="/" className="flex items-center -ml-3 lg:ml-0">
            <img 
              src="/upload/logo.png" 
              alt="WAR TOPUP" 
              className="h-[42px] lg:h-[52px] w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 ml-auto mr-8">
            <Link to="/" className="text-[15px] lg:text-[17px] font-medium text-black transition-colors">Topup</Link>
            <Link to="/contact" className="text-[15px] lg:text-[17px] font-medium text-black transition-colors">Contact Us</Link>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="bg-linear-to-r from-primary-start to-primary-end text-white px-4 py-1.5 lg:py-2.5 rounded-full flex items-center gap-0.8 text-[17px] fb font-primary">
                  <Wallet className="w-[18px] h-[18px] stroke-[2.5px]" />
                  <span className="tracking-tight">{profile?.balance || 0}৳</span>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(true)}
                  className="relative group focus:outline-none"
                >
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    <AvatarImage 
                      src={profile?.photoURL || user?.photoURL} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                      name={profile?.displayName || profile?.email || user?.displayName || user?.email}
                    />
                  </div>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-linear-to-r from-primary-start to-primary-end text-white px-4 py-1.5 lg:px-5 lg:py-2 text-sm rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Side Drawer Overlay */}
      {isDrawerOpen && (
        <>
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-[2px]"
          />
          <div
            className="fixed top-0 right-0 h-full w-64 bg-white z-[70] border-l border-gray-100 flex flex-col overflow-y-auto pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
          >
            {/* Drawer Header / Profile */}
              <button 
                id="userButton" 
                className="flex items-center focus:outline-none p-3 w-full text-left"
                onClick={() => {
                  navigate('/profile');
                  setIsDrawerOpen(false);
                }}
              >
                <div className="w-12 h-12 rounded-full shrink-0 overflow-hidden border border-gray-200 mr-2">
                  <AvatarImage 
                    src={profile?.photoURL || user?.photoURL} 
                    alt="User" 
                    className="w-full h-full object-cover" 
                    name={profile?.displayName || profile?.email || user?.displayName || user?.email}
                  />
                </div>
                <div className="min-w-0 overflow-hidden">
                  <div className="text-left w-full">
                    <span className="px-3 font-normal font-primary truncate block text-sm">
                      Hi, {profile?.displayName || 'User'}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="px-3 text-xs text-gray-500 truncate block">
                      {user?.email || ''}
                    </span>
                  </div>
                </div>
              </button>
              <hr className="border-gray-100" />

              {/* Menu Items */}
              <div className="flex-1 py-1">
                <Link 
                  to="/profile" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center p-4 font-primary text-black transition-colors"
                >
                  <span className="mr-2">
                    <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" className="w-6 h-6 text-black">
                      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                  </span> 
                  <span className="text-[15px]">My Account</span>
                </Link>

                <Link 
                  to="/orders" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-black no-underline flex items-center p-4 font-primary transition-colors"
                >
                  <span className="mr-2">
                    <svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-black">
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                    </svg>
                  </span> 
                  <span className="text-[15px]">My Orders</span>
                </Link>

                <Link 
                  to="/codes" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-black no-underline flex items-center p-4 font-primary transition-colors"
                >
                  <span className="mr-2">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-black">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </span>
                  <span className="text-[15px]">My Codes</span>
                </Link>

                <Link 
                  to="/orders" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-black no-underline flex items-center p-4 font-primary transition-colors"
                >
                  <span className="mr-2">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-black">
                      <line x1="8" y1="6" x2="21" y2="6"></line>
                      <line x1="8" y1="12" x2="21" y2="12"></line>
                      <line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3.01" y2="6"></line>
                      <line x1="3" y1="12" x2="3.01" y2="12"></line>
                      <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                  </span> 
                  <span className="text-[15px]">My Transaction</span>
                </Link>

                <Link 
                  to="/add-money" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-black no-underline flex items-center p-4 font-primary transition-colors"
                >
                  <span className="mr-2">
                    <svg className="w-6 h-6 text-black" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M3 0V3H0V5H3V8H5V5H8V3H5V0H3M10 3V5H19V7H13C11.9 7 11 7.9 11 9V15C11 16.1 11.9 17 13 17H19V19H5V10H3V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V16.72C21.59 16.37 22 15.74 22 15V9C22 8.26 21.59 7.63 21 7.28V5C21 3.9 20.1 3 19 3H10M13 9H20V15H13V9M16 10.5A1.5 1.5 0 0 0 14.5 12A1.5 1.5 0 0 0 16 13.5A1.5 1.5 0 0 0 17.5 12A1.5 1.5 0 0 0 16 10.5Z"></path>
                    </svg>
                  </span> 
                  <span className="text-[15px]">Add Money</span>
                </Link>

                <Link 
                  to="/contact" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-black no-underline flex items-center p-4 font-primary transition-colors"
                >
                  <span className="mr-2">
                    <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" className="w-6 h-6 text-black">
                      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </span>
                  <span className="text-[15px]">Contact Us</span>
                </Link>
                
                <hr className="my-2 border-gray-100" />

                {/* Support Button */}
                <div className="w-full mx-auto text-center mt-3 px-4 pb-6">
                  <a 
                    href="https://m.me/evotopupbd" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="align-middle bg-primary rounded-full mx-auto text-center hover:opacity-90 px-6 py-2.5 text-white text-sm font-semibold inline-block shadow-lg w-32 d-block"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20">
                        <path d="M12 2C6.486 2 2 6.486 2 12v4.143C2 17.167 2.897 18 4 18h1a1 1 0 0 0 1-1v-5.143a1 1 0 0 0-1-1h-.908C4.648 6.987 7.978 4 12 4s7.352 2.987 7.908 6.857H19a1 1 0 0 0-1 1V18c0 1.103-.897 2-2 2h-2v-1h-4v3h6c2.206 0 4-1.794 4-4 1.103 0 2-.833 2-1.857V12c0-5.514-4.486-10-10-10z"></path>
                      </svg>
                      <span className="no-underline">Support</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
        </>
      )}
    </>
  );
}
