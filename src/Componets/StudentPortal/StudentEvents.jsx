import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import { MdEvent, MdLocationOn, MdMilitaryTech, MdEventBusy, MdSchedule, MdToday, MdHistory } from 'react-icons/md';

const StudentEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [viewMode, setViewMode] = useState('All Events');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://taekwondo-backend-j8w4.onrender.com/api';

  // Generate years from 2015 to 2040
  const years = Array.from({ length: 26 }, (_, i) => 2015 + i);
  
  const months = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const eventTypes = ['All Events', 'Upcoming', 'Past'];

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      navigate('/verify-certificate');
      return;
    }
    loadEvents();
  }, []); // Load events only once on mount

  const loadEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('studentToken');
      
      console.log('🔄 Loading events from:', `${API_BASE_URL}/student-portal/events`);
      
      const response = await fetch(`${API_BASE_URL}/student-portal/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('📡 Events response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Events data received:', data);
        
        if (data.status === 'success') {
          const eventsList = data.data?.events || [];
          console.log('✅ Found', eventsList.length, 'events');
          const processedEvents = processEvents(eventsList);
          setEvents(processedEvents);
        }
      } else {
        console.error('❌ Events request failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const processEvents = (eventsList) => {
    return eventsList.map(event => {
      const eventDate = new Date(event.date);
      const now = new Date();
      
      let status = 'Upcoming';
      if (eventDate < now) {
        status = 'Past';
      } else if (eventDate.toDateString() === now.toDateString()) {
        status = 'Today';
      }
      
      return {
        ...event,
        formattedDate: eventDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        year: eventDate.getFullYear(),
        month: eventDate.toLocaleDateString('en-US', { month: 'long' }),
        status
      };
    });
  };

  const filteredEvents = events.filter(event => {
    // Filter by year
    if (event.year !== selectedYear) return false;
    
    // Filter by month
    if (selectedMonth !== 'All Months' && event.month !== selectedMonth) return false;
    
    // Filter by view mode
    if (viewMode === 'Upcoming' && event.status !== 'Upcoming' && event.status !== 'Today') return false;
    if (viewMode === 'Past' && event.status !== 'Past') return false;
    
    return true;
  });

  const getStatusColor = (status) => {
    if (status === 'Upcoming') return '#ea104a';
    if (status === 'Today') return '#FF9800';
    if (status === 'Past') return '#95a5a6';
    return '#e74c3c';
  };

  const getStatusIcon = (status) => {
    if (status === 'Upcoming') return <MdSchedule className="w-3.5 h-3.5" />;
    if (status === 'Today') return <MdToday className="w-3.5 h-3.5" />;
    if (status === 'Past') return <MdHistory className="w-3.5 h-3.5" />;
    return <MdEvent className="w-3.5 h-3.5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border border-[#006CB5] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-b-3xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
            >
              <IoMdArrowBack className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Events</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Year and Month Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Month Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              style={{ color: '#111827' }}
            >
              {months.map((month) => (
                <option key={month} value={month} style={{ color: '#111827' }}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              style={{ color: '#111827' }}
            >
              {years.map((year) => (
                <option key={year} value={year} style={{ color: '#111827' }}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Event Type Selection */}
        <div className="mb-6">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {eventTypes.map((type) => (
              <button
                key={type}
                onClick={() => setViewMode(type)}
                style={viewMode === type ? { backgroundColor: '#ef4444', color: '#ffffff' } : { backgroundColor: '#ffffff', color: '#111827' }}
                className="px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shadow-md hover:opacity-90"
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length > 0 ? (
          <div>
            <p className="text-base font-semibold text-gray-900 mb-4">{filteredEvents.length} events</p>
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event._id} className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-blue-500">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-black text-gray-900 flex-1 mr-4 leading-6">{event.name || event.title}</h3>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: getStatusColor(event.status) }}
                      >
                        <span className="text-white">{getStatusIcon(event.status)}</span>
                      </div>
                      <span 
                        className="text-xs font-black tracking-wide"
                        style={{ color: getStatusColor(event.status) }}
                      >
                        {event.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <MdEvent className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-bold text-gray-500 min-w-[85px]">Date:</span>
                      <span className="text-sm font-bold text-gray-900">{event.formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <MdLocationOn className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-bold text-gray-500 min-w-[85px]">Location:</span>
                      <span className="text-sm font-bold text-gray-900">{event.location || 'TBD'}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <MdMilitaryTech className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-bold text-gray-500 min-w-[85px]">Level:</span>
                      <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        {event.level || 'All Levels'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <MdEventBusy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No events found</h3>
            <p className="text-sm text-gray-500">
              {viewMode === 'All Events' 
                ? `No events available for ${selectedYear}${selectedMonth !== 'All Months' ? ` in ${selectedMonth}` : ''}`
                : viewMode === 'Upcoming'
                ? `No upcoming events for ${selectedYear}${selectedMonth !== 'All Months' ? ` in ${selectedMonth}` : ''}`
                : `No past events for ${selectedYear}${selectedMonth !== 'All Months' ? ` in ${selectedMonth}` : ''}`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEvents;
