import { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  FaChartLine, 
  FaUsers, 
  FaClipboardCheck, 
  FaMedal, 
  FaCalendarAlt, 
  FaCertificate, 
  FaUserPlus, 
  FaDollarSign, 
  FaBook, 
  FaEnvelope,
  FaSignOutAlt,
  FaUserShield,
  FaImage,
  FaHome,
  FaChevronDown,
  FaChevronRight,
  FaInfoCircle,
  FaMobileAlt
} from 'react-icons/fa';

function AdminLayout() {
  const [user, setUser] = useState(null);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/admin/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin' && parsedUser.role !== 'instructor') {
        navigate('/admin/login');
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const toggleDropdown = (groupIndex) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [groupIndex]: !prev[groupIndex]
    }));
  };

  const menuGroups = [
    {
      items: [
        { path: '/admin/dashboard', name: 'Dashboard & Analytics Reports', icon: FaChartLine }
      ]
    },
    {
      title: 'Home',
      icon: FaHome,
      isDropdown: true,
      items: [
        { path: '/admin/banners', name: 'Banner Management', icon: FaImage },
        { path: '/admin/about-section', name: 'About Section (Home)', icon: FaInfoCircle}
      ]
    },
    {
      title: 'About',
      icon: FaInfoCircle,
      isDropdown: true,
      items: [
        { path: '/admin/about-dojang-story', name: 'Our Dojang Story', icon: FaInfoCircle},
        { path: '/admin/founders', name: 'Founder of Taekwon-Do', icon: FaUsers},
        { path: '/admin/mentors', name: 'Our Esteemed Mentors', icon: FaUsers},
        { path: '/admin/leadership', name: 'CWTAK Leadership', icon: FaUsers},
        { path: '/admin/achievements', name: 'Achievements', icon: FaMedal},
        { path: '/admin/locations', name: 'Locations & School Partnerships', icon: FaBook}
      ]
    },
    {
      items: [
        { path: '/admin/students', name: 'Student Account Management', icon: FaUsers},
        { path: '/admin/attendance', name: 'Attendance Management & Reports', icon: FaClipboardCheck},
        { path: '/admin/belts', name: 'Level / Belt Management', icon: FaMedal}
      ]
    },
    {
      items: [
        { path: '/admin/events', name: 'Event Creation & Tracking', icon: FaCalendarAlt},
        { path: '/admin/certificates', name: 'Certificate Upload', icon: FaCertificate},
        { path: '/admin/gallery', name: 'Gallery Management', icon: FaImage},
        { path: '/admin/community', name: 'Community Management', icon: FaUsers},
        { path: '/admin/black-belt', name: 'Black Belt Management', icon: FaMedal},
        
      ]
    },
    {
      items: [
        { path: '/admin/fees', name: 'Fee Setup & Tracking', icon: FaDollarSign}
      ]
    },
    {
      items: [
        { path: '/admin/courses', name: 'Course Management', icon: FaBook},
        { path: '/admin/admissions', name: 'Admissions', icon: FaUserPlus},
        { path: '/admin/belt-exams', name: 'Belt Exams', icon: FaMedal},
        { path: '/admin/contacts', name: 'Contact Form', icon: FaEnvelope}
      ]
    },
    {
      title: 'Mobile App',
      icon: FaMobileAlt,
      isDropdown: true,
      items: [
        { path: '/admin/onboarding', name: 'Onboarding Slides', icon: FaMobileAlt },
        { path: '/admin/techniques', name: 'Techniques & Kicks', icon: FaMobileAlt },
      ]
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'white' }}>
      {/* Fixed Sidebar */}
      <div className="w-80 bg-white text-black flex flex-col h-screen flex-shrink-0 fixed left-0 top-0 z-10 shadow-lg" style={{ borderRight: '1px solid #e5e7eb' }}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <img 
              src="/WhatsApp Image 2025-12-30 at 5.45.49 PM.jpeg" 
              alt="Combat Warrior Logo" 
              className="w-12 h-12 rounded-xl object-cover shadow-lg"
            />
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Admin Panel</h2>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              {group.isDropdown ? (
                // Dropdown menu
                <div>
                  <button
                    onClick={() => toggleDropdown(groupIndex)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gray-100 mb-2"
                    style={{ color: '#000000' }}
                  >
                    <div className="flex items-center">
                      <group.icon className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#006CB5' }} />
                      <span className="font-semibold text-sm">{group.title}</span>
                    </div>
                    {openDropdowns[groupIndex] ? (
                      <FaChevronDown className="w-4 h-4" style={{ color: '#006CB5' }} />
                    ) : (
                      <FaChevronRight className="w-4 h-4" style={{ color: '#006CB5' }} />
                    )}
                  </button>
                  
                  {openDropdowns[groupIndex] && (
                    <div className="ml-4 space-y-1">
                      {group.items.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                              location.pathname === item.path
                                ? 'text-white shadow-lg'
                                : 'hover:bg-gray-100'
                            }`}
                            style={location.pathname === item.path ? { backgroundColor: '#006CB5', color: 'white' } : { color: '#000000' }}
                          >
                            <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" style={location.pathname === item.path ? { color: 'white' } : { color: '#006CB5' }} />
                            <div className="flex-1 text-left">
                              <div className="font-semibold text-sm leading-tight">{item.name}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                // Regular menu items
                group.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 group mb-2 ${
                        location.pathname === item.path
                          ? 'text-white shadow-lg'
                          : 'hover:bg-gray-100'
                      }`}
                      style={location.pathname === item.path ? { backgroundColor: '#006CB5', color: 'white' } : { color: '#000000' }}
                    >
                      <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" style={location.pathname === item.path ? { color: 'white' } : { color: '#006CB5' }} />
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-sm leading-tight">{item.name}</div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="w-full text-white py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center font-semibold shadow-lg hover:opacity-90"
            style={{ backgroundColor: '#dc2626' }}
          >
            <FaSignOutAlt className="w-5 h-5 mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-80 min-h-screen" style={{ backgroundColor: 'white' }}>
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;