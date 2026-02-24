import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { scrollToTop } from '../utils/useScrollToTop';
import { FaMapMarkerAlt, FaPhone, FaFacebookF, FaInstagram, FaChevronDown } from 'react-icons/fa';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [membersDropdownOpen, setMembersDropdownOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Programs', href: '/courses' },
    { 
      name: 'Members', 
      href: '#',
      dropdown: [
        { name: 'Our Students', href: '/membership' },
        { name: 'Our Community', href: '/community' },
        { name: 'Black Belt', href: '/black-belt' }
      ]
    },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Admission', href: '/admission' },
    { name: 'Belt Exam', href: '/belt-exam' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#006CB5] text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt style={{ color: 'white', fontSize: '1rem' }} />
              <span>Bangalore, Karnataka</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <FaPhone style={{ color: 'white', fontSize: '0.875rem' }} />
              <span>+91 7259113288</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <FaPhone style={{ color: 'white', fontSize: '0.875rem' }} />
              <span>+91 9663333247</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <FaFacebookF style={{ color: '#006CB5', fontSize: '0.875rem' }} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <FaInstagram style={{ color: '#006CB5', fontSize: '0.875rem' }} />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Left Logo */}
            <Link to="/" onClick={scrollToTop} className="flex-shrink-0">
              <img 
                src="/combat-warrior-logo.png" 
                alt="Combat Warrior Logo" 
                className="h-20 w-20 object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-10">
              {navigation.map((item) => (
                item.dropdown ? (
                  <div 
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setMembersDropdownOpen(true)}
                    onMouseLeave={() => setMembersDropdownOpen(false)}
                  >
                    <button
                      className="text-lg font-semibold transition-colors duration-200 flex items-center gap-1"
                      style={{ color: '#006CB5' }}
                    >
                      {item.name}
                      <FaChevronDown className="text-sm" />
                    </button>
                    
                    {membersDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            onClick={scrollToTop}
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={scrollToTop}
                    className="text-lg font-semibold transition-colors duration-200"
                    style={{ color: '#006CB5' }}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>

            {/* Right Logos */}
            <div className="hidden md:flex items-center space-x-4">
              <img 
                src="/logo img 2.png" 
                alt="ITF Logo" 
                className="h-18 w-18 object-contain"
              />
              <img 
                src="/logo img 3.png" 
                alt="Organization Logo" 
                className="h-18 w-18 object-contain"
              />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-800 hover:text-[#006CB5] focus:outline-none p-2"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="md:hidden pb-4">
              <div className="space-y-2">
                {navigation.map((item) => (
                  item.dropdown ? (
                    <div key={item.name}>
                      <button
                        onClick={() => setMembersDropdownOpen(!membersDropdownOpen)}
                        className="w-full text-left px-4 py-2 rounded-lg text-base font-semibold text-gray-800 hover:bg-gray-100 flex items-center justify-between"
                      >
                        {item.name}
                        <FaChevronDown className={`text-sm transition-transform ${membersDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {membersDropdownOpen && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              className="block px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                setIsOpen(false);
                                setMembersDropdownOpen(false);
                                scrollToTop();
                              }}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`block px-4 py-2 rounded-lg text-base font-semibold ${
                        location.pathname === item.href
                          ? 'text-white bg-[#006CB5]'
                          : 'text-gray-800 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setIsOpen(false);
                        scrollToTop();
                      }}
                    >
                      {item.name}
                    </Link>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;