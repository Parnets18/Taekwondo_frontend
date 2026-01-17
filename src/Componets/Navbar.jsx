import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { scrollToTop } from '../utils/useScrollToTop';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Programs', href: '/courses' },
    { name: 'Admission', href: '/admission' },
    { name: 'Contact', href: '/contact' },
    { name: 'Verify Certificate', href: '/verify-certificate' },
  ];

  return (
    <nav className="bg-white shadow-xl border-b-4 border-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
              onClick={scrollToTop}
            >
              <div className="relative">
                <img 
                  src="/combat-warrior-logo.png" 
                  alt="Combat Warrior Taekwon-Do Association" 
                  className="h-16 w-16 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 filter group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-red-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              {/* <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 via-yellow-600 to-red-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                  Combat Warrior
                </h1>
                <p className="text-xs text-gray-600 font-semibold tracking-wide">ITF Taekwon-Do</p>
              </div> */}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={scrollToTop}
                className={`relative px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 group ${
                  location.pathname === item.href
                    ? 'text-white bg-gradient-to-r from-red-600 to-yellow-500 shadow-lg'
                    : 'text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-yellow-500 hover:to-red-600 hover:shadow-md'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="relative z-10">{item.name}</span>
                {location.pathname !== item.href && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-800 hover:text-red-700 focus:outline-none focus:text-red-700 p-2 rounded-lg hover:bg-yellow-50 transition-all duration-200"
            >
              <svg className="h-6 w-6 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden animate-fade-in-down">
            <div className="px-2 pt-2 pb-3 space-y-2 bg-gradient-to-br from-yellow-50 via-white to-red-50 rounded-xl mt-2 border-2 border-gradient-to-r from-yellow-200 to-red-200 shadow-lg backdrop-blur-sm">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 rounded-lg text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                    location.pathname === item.href
                      ? 'text-white bg-gradient-to-r from-red-600 to-yellow-500 shadow-md'
                      : 'text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-yellow-500 hover:to-red-600'
                  }`}
                  onClick={() => {
                    setIsOpen(false);
                    scrollToTop();
                  }}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;