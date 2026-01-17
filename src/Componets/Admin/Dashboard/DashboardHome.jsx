import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaFileAlt, FaMoneyBillWave, FaGraduationCap, FaChartLine, FaTrophy, FaUserCheck } from 'react-icons/fa';

function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalStudents: 0, totalEvents: 0, dailyAdmissions: 0, totalRevenue: 0, beltTests: 0, dailyAttendance: 0, certificates: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => { fetchDashboardData(); }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) };
  };

  const fetchDashboardData = async () => {
    try {
      const headers = getAuthHeaders();
      const [studentsRes, eventsRes, admissionsRes, feesRes, certificatesRes, attendanceRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/students`, { headers }), fetch(`${API_BASE_URL}/events`, { headers }),
        fetch(`${API_BASE_URL}/admin/admissions`, { headers }), fetch(`${API_BASE_URL}/fees`, { headers }),
        fetch(`${API_BASE_URL}/certificates`, { headers }), fetch(`${API_BASE_URL}/attendance`, { headers })
      ]);

      let totalStudents = 0;
      if (studentsRes.status === 'fulfilled' && studentsRes.value.ok) {
        const response = await studentsRes.value.json();
        const studentsData = response.data?.students || response.data || response || [];
        totalStudents = Array.isArray(studentsData) ? studentsData.length : 0;
      }

      let totalEvents = 0, upcomingEventsData = [];
      if (eventsRes.status === 'fulfilled' && eventsRes.value.ok) {
        const response = await eventsRes.value.json();
        const eventsData = response.data?.events || response.data || response || [];
        if (Array.isArray(eventsData)) {
          const now = new Date();
          totalEvents = eventsData.length || 0;
          upcomingEventsData = eventsData.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3)
            .map(e => ({ title: e.name, date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              participants: e.capacity || 0, status: e.status || 'Scheduled',
              statusColor: e.status === 'Completed' ? 'bg-green-100 text-green-700' : e.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700' }));
        }
      }

      let dailyAdmissions = 0;
      if (admissionsRes.status === 'fulfilled' && admissionsRes.value.ok) {
        const response = await admissionsRes.value.json();
        const admissionsData = response.data?.admissions || response.data || response || [];
        if (Array.isArray(admissionsData)) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          dailyAdmissions = admissionsData.filter(admission => {
            const admissionDate = new Date(admission.createdAt || admission.submissionDate);
            return admissionDate >= today && admissionDate < tomorrow;
          }).length;
        }
      }

      let totalRevenue = 0;
      if (feesRes.status === 'fulfilled' && feesRes.value.ok) {
        const response = await feesRes.value.json();
        const feesData = response.data?.fees || response.data || response || [];
        if (Array.isArray(feesData)) {
          const currentMonth = new Date().getMonth(), currentYear = new Date().getFullYear();
          totalRevenue = feesData.filter(f => { const feeDate = new Date(f.dueDate || f.createdAt); return feeDate.getMonth() === currentMonth && feeDate.getFullYear() === currentYear; })
            .reduce((sum, f) => sum + (f.amount || 0), 0);
        }
      }

      let certificates = 0;
      if (certificatesRes.status === 'fulfilled' && certificatesRes.value.ok) {
        const response = await certificatesRes.value.json();
        const certificatesData = response.data?.certificates || response.data || response || [];
        certificates = Array.isArray(certificatesData) ? certificatesData.length : 0;
      }

      let dailyAttendance = 0;
      if (attendanceRes.status === 'fulfilled' && attendanceRes.value.ok) {
        const response = await attendanceRes.value.json();
        const attendanceData = response.data?.attendance || response.data || response || [];
        if (Array.isArray(attendanceData)) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          dailyAttendance = attendanceData.filter(attendance => {
            const attendanceDate = new Date(attendance.date || attendance.createdAt);
            return attendanceDate >= today && attendanceDate < tomorrow;
          }).length;
        }
      }

      setStats({ totalStudents, totalEvents, dailyAdmissions, totalRevenue, beltTests: 0, dailyAttendance, certificates });
      setUpcomingEvents(upcomingEventsData);

      const activities = [];
      if (totalStudents > 0) activities.push({ icon: FaUsers, iconColor: 'text-blue-600', iconBg: 'bg-blue-100', title: 'Students enrolled', subtitle: `${totalStudents} total students in the system`, time: 'Current' });
      if (totalEvents > 0) activities.push({ icon: FaCalendarAlt, iconColor: 'text-green-600', iconBg: 'bg-green-100', title: 'Total events', subtitle: `${totalEvents} events in the system`, time: 'Total' });
      if (dailyAdmissions > 0) activities.push({ icon: FaFileAlt, iconColor: 'text-orange-600', iconBg: 'bg-orange-100', title: 'Daily admissions', subtitle: `${dailyAdmissions} applications today`, time: 'Today' });
      if (certificates > 0) activities.push({ icon: FaTrophy, iconColor: 'text-yellow-600', iconBg: 'bg-yellow-100', title: 'Certificates issued', subtitle: `${certificates} certificates in the system`, time: 'Total' });
      if (dailyAttendance > 0) activities.push({ icon: FaUserCheck, iconColor: 'text-teal-600', iconBg: 'bg-teal-100', title: 'Daily attendance', subtitle: `${dailyAttendance} attendance records today`, time: 'Today' });
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (<div className="flex items-center justify-center h-screen"><div className="text-center"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-800 mx-auto mb-4"></div><p className="text-slate-600 text-lg">Loading dashboard...</p></div></div>);

  const mainStats = [
    { title: 'Total Students', value: stats.totalStudents.toString(), change: 'Enrolled students', icon: FaUsers, color: 'blue', link: '/admin/students' },
    { title: 'Total Events', value: stats.totalEvents.toString(), change: 'All events', icon: FaCalendarAlt, color: 'green', link: '/admin/events' },
    { title: 'Daily Admissions', value: stats.dailyAdmissions.toString(), change: 'Today', icon: FaFileAlt, color: 'orange', link: '/admin/admissions' },
    { title: 'Monthly Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, change: 'This month', icon: FaMoneyBillWave, color: 'purple', link: '/admin/fees' }
  ];

  const secondaryStats = [
    { title: 'Belt Tests', value: stats.beltTests.toString(), subtitle: 'This Month', icon: FaGraduationCap, color: 'amber' },
    { title: 'Daily Attendance', value: stats.dailyAttendance.toString(), subtitle: 'Today', icon: FaUserCheck, color: 'teal' },
    { title: 'Certificates', value: stats.certificates.toString(), subtitle: 'Issued', icon: FaTrophy, color: 'yellow' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold">Dashboard Overview</h1><p className="text-slate-300 mt-2">Welcome back! Here is what is happening with your academy.</p></div>
          <div className="text-right"><p className="text-slate-400 text-sm">Today</p><p className="text-xl font-semibold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <Link key={index} to={stat.link} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-slate-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1"><p className="text-slate-600 text-sm font-medium mb-2">{stat.title}</p><p className="text-3xl font-bold text-slate-800 mb-2">{stat.value}</p><p className="text-xs text-slate-500">{stat.change}</p></div>
              <div className={`p-3 rounded-lg bg-${stat.color}-50 group-hover:bg-${stat.color}-100 transition-colors`}><stat.icon className={`text-2xl text-${stat.color}-600`} /></div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {secondaryStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-lg bg-${stat.color}-50`}><stat.icon className={`text-3xl text-${stat.color}-600`} /></div>
              <div><p className="text-slate-600 text-sm">{stat.title}</p><p className="text-2xl font-bold text-slate-800">{stat.value}</p><p className="text-xs text-slate-500">{stat.subtitle}</p></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-slate-200">
          <div className="p-6 border-b border-slate-200"><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-slate-800 flex items-center"><FaChartLine className="mr-2 text-slate-600" />Recent Activity</h2><span className="text-xs text-slate-500">System Status</span></div></div>
          <div className="p-6"><div className="space-y-4">{recentActivities.length > 0 ? recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className={`p-2 rounded-lg ${activity.iconBg} flex-shrink-0`}><activity.icon className={`text-lg ${activity.iconColor}`} /></div>
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-800">{activity.title}</p><p className="text-xs text-slate-600 mt-1">{activity.subtitle}</p><p className="text-xs text-slate-400 mt-1">{activity.time}</p></div>
            </div>
          )) : (<div className="text-center py-8"><p className="text-slate-500">No recent activity</p><p className="text-xs text-slate-400 mt-2">Activity will appear here as you use the system</p></div>)}</div></div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-slate-200">
          <div className="p-6 border-b border-slate-200"><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-slate-800 flex items-center"><FaCalendarAlt className="mr-2 text-slate-600" />Upcoming Events</h2><Link to="/admin/events" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All</Link></div></div>
          <div className="p-6"><div className="space-y-4">{upcomingEvents.length > 0 ? upcomingEvents.map((event, index) => (
            <div key={index} className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-slate-800">{event.title}</h3><span className={`px-3 py-1 text-xs font-medium rounded-full ${event.statusColor}`}>{event.status}</span></div>
              <div className="flex items-center justify-between text-sm text-slate-600"><div className="flex items-center"><FaCalendarAlt className="mr-2 text-slate-400" /><span>{event.date}</span></div><div className="flex items-center"><FaUsers className="mr-2 text-slate-400" /><span>{event.participants} capacity</span></div></div>
            </div>
          )) : (<div className="text-center py-8"><p className="text-slate-500">No upcoming events</p><p className="text-xs text-slate-400 mt-2">Create events to see them here</p></div>)}</div>
          {upcomingEvents.length > 0 && (<Link to="/admin/events" className="mt-4 block text-center py-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">Manage All Events</Link>)}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/students" className="p-4 bg-slate-50 hover:bg-blue-50 rounded-lg transition-all text-center group border border-slate-200 hover:border-blue-200"><FaUsers className="text-3xl text-slate-600 group-hover:text-blue-600 mx-auto mb-2 transition-colors" /><p className="text-sm font-medium text-slate-700 group-hover:text-blue-700">Manage Students</p></Link>
          <Link to="/admin/attendance" className="p-4 bg-slate-50 hover:bg-green-50 rounded-lg transition-all text-center group border border-slate-200 hover:border-green-200"><FaUserCheck className="text-3xl text-slate-600 group-hover:text-green-600 mx-auto mb-2 transition-colors" /><p className="text-sm font-medium text-slate-700 group-hover:text-green-700">Mark Attendance</p></Link>
          <Link to="/admin/belts" className="p-4 bg-slate-50 hover:bg-amber-50 rounded-lg transition-all text-center group border border-slate-200 hover:border-amber-200"><FaGraduationCap className="text-3xl text-slate-600 group-hover:text-amber-600 mx-auto mb-2 transition-colors" /><p className="text-sm font-medium text-slate-700 group-hover:text-amber-700">Belt Management</p></Link>
          <Link to="/admin/events" className="p-4 bg-slate-50 hover:bg-red-50 rounded-lg transition-all text-center group border border-slate-200 hover:border-red-200"><FaCalendarAlt className="text-3xl text-slate-600 group-hover:text-red-600 mx-auto mb-2 transition-colors" /><p className="text-sm font-medium text-slate-700 group-hover:text-red-700">Create Event</p></Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
