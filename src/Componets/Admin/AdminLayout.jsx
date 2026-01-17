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
  FaUserShield
} from 'react-icons/fa';

function AdminLayout() {
  const [user, setUser] = useState(null);
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

  const menuGroups = [
    {
     
      items: [
        { path: '/admin/dashboard', name: 'Dashboard & Analytics Reports', icon: FaChartLine }
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
      title: 'Academy Operations',
      items: [
        { path: '/admin/events', name: 'Event Creation & Tracking', icon: FaCalendarAlt},
        { path: '/admin/certificates', name: 'Certificate Upload', icon: FaCertificate},
        { path: '/admin/admissions', name: 'Admissions', icon: FaUserPlus}
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
        { path: '/admin/contacts', name: 'Contact Form', icon: FaEnvelope},
       
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
    <div className="min-h-screen bg-slate-50">
      {/* Fixed Sidebar */}
      <div className="w-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col h-screen flex-shrink-0 fixed left-0 top-0 z-10">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center space-x-4">
            <img 
              src="/WhatsApp Image 2025-12-30 at 5.45.49 PM.jpeg" 
              alt="Combat Warrior Logo" 
              className="w-12 h-12 rounded-xl object-cover shadow-lg"
            />
            <div>
              <h2 className="text-xl font-bold text-white">Admin Panel</h2>
              
            </div>
          </div>
        </div>

       

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              {group.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 group mb-2 ${
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-sm leading-tight">{item.name}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        

        {/* Logout */}
        <div className="p-4 border-t border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center font-semibold shadow-lg"
          >
            <FaSignOutAlt className="w-5 h-5 mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-80 min-h-screen">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;