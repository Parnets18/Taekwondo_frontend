import { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaUsers,
  FaCheckCircle
} from 'react-icons/fa';

function EventManagement() {
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [showRegisterStudentModal, setShowRegisterStudentModal] = useState(false);
  const [showViewParticipantsModal, setShowViewParticipantsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  
  // Data states
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [statistics, setStatistics] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    completedEvents: 0,
    upcomingEvents: 0
  });

  // Form states
  const [eventForm, setEventForm] = useState({
    name: '',
    eventType: '',
    eventLevel: '',
    description: '',
    date: '',
    location: '',
    capacity: '',
    status: 'Scheduled'
  });

  const [participantForm, setParticipantForm] = useState({
    student: '',
    studentName: '',
    participationStatus: 'Registered'
  });

  // Autocomplete states
  const [studentSuggestions, setStudentSuggestions] = useState([]);
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);

  // API base URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    }
  }, []);

  // Get auth headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    };
  };

  // Fetch functions
  const fetchEvents = async () => {
    if (!authToken) return;
    try {
      console.log('🔍 Fetching events from API...');
      const response = await fetch(`${API_BASE_URL}/events`, {
        headers: getAuthHeaders()
      });
      console.log('📡 Response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      console.log('📦 Events data received:', data);
      if (data.status === 'success') {
        console.log('✅ Events loaded:', data.data.events?.length || 0);
        setEvents(data.data.events || []);
      }
    } catch (error) {
      console.error('❌ Error fetching events:', error);
    }
  };

  const fetchStudents = async () => {
    if (!authToken) return;
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      if (data.status === 'success') {
        console.log('📚 Fetched students:', data.data.students);
        setStudents(data.data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStatistics = async () => {
    if (!authToken) return;
    try {
      const response = await fetch(`${API_BASE_URL}/events/statistics`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      if (data.status === 'success') {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchParticipants = async (eventId) => {
    if (!authToken || !eventId) return;
    try {
      console.log('🔍 Fetching participants for event:', eventId);
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/participants`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch participants');
      const data = await response.json();
      console.log('📥 Participants response:', data);
      if (data.status === 'success') {
        console.log('✅ Setting participants:', data.data.participants);
        setParticipants(data.data.participants || []);
      }
    } catch (error) {
      console.error('❌ Error fetching participants:', error);
    }
  };

  // Load all data
  useEffect(() => {
    if (authToken) {
      Promise.all([
        fetchEvents(),
        fetchStudents(),
        fetchStatistics()
      ]);
    }
  }, [authToken]);

  // Form handlers
  const handleEventFormChange = (field, value) => {
    setEventForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetEventForm = () => {
    setEventForm({
      name: '',
      eventType: '',
      eventLevel: '',
      description: '',
      date: '',
      location: '',
      capacity: '',
      status: 'Scheduled'
    });
  };

  const resetParticipantForm = () => {
    setParticipantForm({
      student: '',
      studentName: '',
      participationStatus: 'Registered'
    });
    setStudentSuggestions([]);
    setShowStudentSuggestions(false);
  };

  // Autocomplete handlers
  const handleStudentNameChange = (value) => {
    setParticipantForm(prev => ({
      ...prev,
      studentName: value,
      student: '' // Clear student ID when typing
    }));

    if (value.trim() === '') {
      setStudentSuggestions([]);
      setShowStudentSuggestions(false);
    } else {
      // Filter students by name
      const filtered = students.filter(s => 
        s.fullName.toLowerCase().includes(value.toLowerCase())
      );
      setStudentSuggestions(filtered);
      setShowStudentSuggestions(true);
    }
  };

  const selectStudent = (student) => {
    setParticipantForm(prev => ({
      ...prev,
      studentName: student.fullName,
      student: student._id || student.id
    }));
    setShowStudentSuggestions(false);
  };

  // Click outside handler for autocomplete
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-container')) {
        setShowStudentSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Event CRUD operations
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.name || !eventForm.eventType || !eventForm.eventLevel || !eventForm.date || !eventForm.location || !eventForm.capacity) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(eventForm)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create event');

      if (data.status === 'success') {
        alert('Event created successfully!');
        setShowAddEventModal(false);
        resetEventForm();
        await fetchEvents();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    const eventType = typeof event.eventType === 'object' ? event.eventType.name : event.eventType;
    const eventLevel = typeof event.eventLevel === 'object' ? event.eventLevel.name : event.eventLevel;
    
    setEventForm({
      name: event.name,
      eventType: eventType,
      eventLevel: eventLevel,
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      location: event.location,
      capacity: event.capacity,
      status: event.status
    });
    setShowEditEventModal(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      const response = await fetch(`${API_BASE_URL}/events/${selectedEvent._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(eventForm)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update event');

      if (data.status === 'success') {
        alert('Event updated successfully!');
        setShowEditEventModal(false);
        setSelectedEvent(null);
        resetEventForm();
        await fetchEvents();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    console.log('🗑️ Delete event called with ID:', eventId);
    
    if (!confirm('Are you sure you want to delete this event?')) {
      console.log('❌ Delete cancelled by user');
      return;
    }

    try {
      console.log('📤 Sending DELETE request to:', `${API_BASE_URL}/events/${eventId}`);
      
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      console.log('📥 Response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Response data:', data);
      
      if (!response.ok) throw new Error(data.message || 'Failed to delete event');

      if (data.status === 'success') {
        console.log('✅ Event deleted successfully');
        alert('Event deleted successfully!');
        await fetchEvents();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Participant operations
  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    if (!participantForm.student || !selectedEvent) {
      alert('Please select a student');
      return;
    }

    console.log('📝 Registering student to event...');
    console.log('Event ID:', selectedEvent._id);
    console.log('Student ID:', participantForm.student);
    console.log('Participation Status:', participantForm.participationStatus);

    try {
      const requestBody = {
        studentId: participantForm.student,
        participationStatus: participantForm.participationStatus
      };
      
      console.log('📤 Sending request:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/events/${selectedEvent._id}/participants`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Response data:', data);
      
      if (!response.ok) {
        // Show the actual error message from the server
        const errorMsg = data.error || data.message || 'Failed to register student';
        throw new Error(errorMsg);
      }

      if (data.status === 'success') {
        alert('Student registered successfully!');
        setShowRegisterStudentModal(false);
        resetParticipantForm();
        await fetchEvents();
        await fetchStatistics();
        if (showViewParticipantsModal) {
          await fetchParticipants(selectedEvent._id);
          
          // Update selectedEvent with fresh data from backend
          const eventResponse = await fetch(`${API_BASE_URL}/events/${selectedEvent._id}`, {
            headers: getAuthHeaders()
          });
          if (eventResponse.ok) {
            const eventData = await eventResponse.json();
            if (eventData.status === 'success') {
              setSelectedEvent(eventData.data.event);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error registering student:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleViewParticipants = async (event) => {
    console.log('👁️ Opening participants modal for event:', event.name, 'ID:', event._id);
    setSelectedEvent(event);
    await fetchParticipants(event._id);
    setShowViewParticipantsModal(true);
  };

  const handleOpenRegisterModal = (event) => {
    setSelectedEvent(event);
    setShowRegisterStudentModal(true);
  };

  const handleRemoveParticipant = async (participantId) => {
    if (!confirm('Are you sure you want to remove this participant?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/events/${selectedEvent._id}/participants/${participantId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to remove participant');

      if (data.status === 'success') {
        alert('Participant removed successfully!');
        
        // Refresh participants list
        await fetchParticipants(selectedEvent._id);
        
        // Refresh events list
        await fetchEvents();
        await fetchStatistics();
        
        // Update selectedEvent with fresh data from backend
        const eventResponse = await fetch(`${API_BASE_URL}/events/${selectedEvent._id}`, {
          headers: getAuthHeaders()
        });
        if (eventResponse.ok) {
          const eventData = await eventResponse.json();
          if (eventData.status === 'success') {
            setSelectedEvent(eventData.data.event);
          }
        }
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdateParticipationStatus = async (participantId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/participants/${participantId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ participationStatus: newStatus })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update status');

      if (data.status === 'success') {
        // Refresh participants list to show updated status
        await fetchParticipants(selectedEvent._id);
      }
    } catch (error) {
      console.error('Error updating participation status:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleSyncParticipantCounts = async () => {
    if (!confirm('This will sync participant counts for all events. Continue?')) {
      return;
    }

    try {
      console.log('🔄 Syncing participant counts...');
      const response = await fetch(`${API_BASE_URL}/events/sync-participants`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to sync counts');

      if (data.status === 'success') {
        alert(`✅ ${data.message}`);
        // Refresh events to show updated counts
        await fetchEvents();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error syncing participant counts:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getParticipationStatusColor = (status) => {
    switch (status) {
      case 'Participated':
        return 'bg-green-100 text-green-800';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
      case 'No-Show':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Render functions
  const renderEvents = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Events</p>
              <p className="text-3xl font-bold text-slate-900">{statistics.totalEvents}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaCalendarAlt className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Participants</p>
              <p className="text-3xl font-bold text-slate-900">{statistics.totalParticipants}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaUsers className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Completed Events</p>
              <p className="text-3xl font-bold text-slate-900">{statistics.completedEvents}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Upcoming Events</p>
              <p className="text-3xl font-bold text-slate-900">{statistics.upcomingEvents}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FaCalendarAlt className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Event Management</h3>
        <div className="flex gap-3">
          <button 
            onClick={handleSyncParticipantCounts}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            title="Sync participant counts if they're out of sync"
          >
            <FaCheckCircle className="w-4 h-4" />
            <span>Sync Counts</span>
          </button>
          <button 
            onClick={() => setShowAddEventModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Event Name</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Location</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Participants</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <FaCalendarAlt className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500 font-medium">No events found</p>
                    <p className="text-slate-400 text-sm mt-1">Click "Create Event" to add one</p>
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-900">{event.name}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-slate-600">{event.location}</td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-900">{event.currentParticipants}</span>
                      <span className="text-slate-500">/{event.capacity}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewParticipants(event)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                        >
                          <FaUsers className="w-3.5 h-3.5" />
                          <span>Participants</span>
                        </button>
                        <button 
                          onClick={() => handleOpenRegisterModal(event)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5"
                        >
                          <FaPlus className="w-3.5 h-3.5" />
                          <span>Register</span>
                        </button>
                        <button 
                          onClick={() => handleEditEvent(event)}
                          className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event._id)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <FaCalendarAlt className="mr-3 text-blue-500" />
            Event Management System
          </h1>
          <p className="text-slate-600 mt-2">Manage events and participant registrations</p>
        </div>
      </div>

      {/* Content */}
      <div>
        {renderEvents()}
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
            <div className="bg-blue-600 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Create New Event</h2>
                <button 
                  onClick={() => {
                    setShowAddEventModal(false);
                    resetEventForm();
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Event Name *
                    </label>
                    <input
                      type="text"
                      value={eventForm.name}
                      onChange={(e) => handleEventFormChange('name', e.target.value)}
                      placeholder="e.g., Spring Tournament 2025"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Event Type *
                    </label>
                    <input 
                      type="text"
                      value={eventForm.eventType}
                      onChange={(e) => handleEventFormChange('eventType', e.target.value)}
                      placeholder="e.g., Tournament, Workshop, Seminar"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Event Level *
                    </label>
                    <select 
                      value={eventForm.eventLevel}
                      onChange={(e) => handleEventFormChange('eventLevel', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option key="select-level" value="">Select Level</option>
                      <option key="beginner" value="Beginner">Beginner</option>
                      <option key="intermediate" value="Intermediate">Intermediate</option>
                      <option key="advanced" value="Advanced">Advanced</option>
                      <option key="expert" value="Expert">Expert</option>
                      <option key="all-levels" value="All Levels">All Levels</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => handleEventFormChange('date', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => handleEventFormChange('location', e.target.value)}
                      placeholder="e.g., Main Hall, Sports Complex"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Capacity (Max Participants) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={eventForm.capacity}
                      onChange={(e) => handleEventFormChange('capacity', e.target.value)}
                      placeholder="e.g., 50"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => handleEventFormChange('description', e.target.value)}
                    placeholder="Provide details about the event..."
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select 
                    value={eventForm.status}
                    onChange={(e) => handleEventFormChange('status', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option key="scheduled" value="Scheduled">Scheduled</option>
                    <option key="in-progress" value="In Progress">In Progress</option>
                    <option key="completed" value="Completed">Completed</option>
                    <option key="cancelled" value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold transition"
                  >
                    Create Event
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddEventModal(false);
                      resetEventForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
            <div className="bg-amber-600 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Edit Event</h2>
                <button 
                  onClick={() => {
                    setShowEditEventModal(false);
                    setSelectedEvent(null);
                    resetEventForm();
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleUpdateEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Event Name *
                    </label>
                    <input
                      type="text"
                      value={eventForm.name}
                      onChange={(e) => handleEventFormChange('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Event Type *
                    </label>
                    <input 
                      type="text"
                      value={eventForm.eventType}
                      onChange={(e) => handleEventFormChange('eventType', e.target.value)}
                      placeholder="e.g., Tournament, Workshop, Seminar"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Event Level *
                    </label>
                    <select 
                      value={eventForm.eventLevel}
                      onChange={(e) => handleEventFormChange('eventLevel', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    >
                      <option key="select-level-edit" value="">Select Level</option>
                      <option key="beginner-edit" value="Beginner">Beginner</option>
                      <option key="intermediate-edit" value="Intermediate">Intermediate</option>
                      <option key="advanced-edit" value="Advanced">Advanced</option>
                      <option key="expert-edit" value="Expert">Expert</option>
                      <option key="all-levels-edit" value="All Levels">All Levels</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => handleEventFormChange('date', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => handleEventFormChange('location', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Capacity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={eventForm.capacity}
                      onChange={(e) => handleEventFormChange('capacity', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => handleEventFormChange('description', e.target.value)}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select 
                    value={eventForm.status}
                    onChange={(e) => handleEventFormChange('status', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option key="scheduled-edit" value="Scheduled">Scheduled</option>
                    <option key="in-progress-edit" value="In Progress">In Progress</option>
                    <option key="completed-edit" value="Completed">Completed</option>
                    <option key="cancelled-edit" value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 font-semibold transition"
                  >
                    Update Event
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditEventModal(false);
                      setSelectedEvent(null);
                      resetEventForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Register Student Modal */}
      {showRegisterStudentModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl">
            <div className="bg-green-600 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Register Student</h2>
                <button 
                  onClick={() => {
                    setShowRegisterStudentModal(false);
                    setSelectedEvent(null);
                    resetParticipantForm();
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Event Details</h3>
                <p className="text-sm text-blue-800">
                  <strong>Event:</strong> {selectedEvent.name}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Capacity:</strong> {selectedEvent.currentParticipants}/{selectedEvent.capacity}
                </p>
              </div>

              <form onSubmit={handleRegisterStudent} className="space-y-6">
                <div className="autocomplete-container relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    value={participantForm.studentName}
                    onChange={(e) => handleStudentNameChange(e.target.value)}
                    placeholder="Type student name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                    autoComplete="off"
                  />
                  
                  {/* Autocomplete Dropdown */}
                  {showStudentSuggestions && studentSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {studentSuggestions.map((student) => (
                        <div
                          key={student._id}
                          onClick={() => selectStudent(student)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{student.fullName}</p>
                              <p className="text-sm text-gray-500">{student.email || 'No email'}</p>
                            </div>
                            <div className="ml-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {student.studentId || 'No ID'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Warning if name doesn't match */}
                  {participantForm.studentName && !participantForm.student && !showStudentSuggestions && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Please select a student from the suggestions
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-1">Start typing to search for a student. Student ID is shown to help identify students with the same name.</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-semibold transition"
                  >
                    Register Student
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegisterStudentModal(false);
                      setSelectedEvent(null);
                      resetParticipantForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Participants Modal */}
      {showViewParticipantsModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl">
            <div className="bg-blue-600 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Event Participants</h2>
                <button 
                  onClick={async () => {
                    setShowViewParticipantsModal(false);
                    setSelectedEvent(null);
                    setParticipants([]);
                    // Refresh events to show updated participant counts
                    await fetchEvents();
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">{selectedEvent.name}</h3>
                <p className="text-sm text-blue-800">
                  <strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Location:</strong> {selectedEvent.location}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Participants:</strong> {selectedEvent.currentParticipants}/{selectedEvent.capacity}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Student Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Registration Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-8 text-center">
                          <FaUsers className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                          <p className="text-slate-500 font-medium">No participants registered yet</p>
                        </td>
                      </tr>
                    ) : (
                      participants.map((participant) => (
                        <tr key={participant._id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-900">
                              {participant.studentName || 'Unknown Student'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getParticipationStatusColor(participant.participationStatus)}`}>
                              {participant.participationStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {new Date(participant.registrationDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <button 
                              onClick={() => handleRemoveParticipant(participant._id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Remove Participant"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-6">
                <button 
                  onClick={async () => {
                    setShowViewParticipantsModal(false);
                    setSelectedEvent(null);
                    setParticipants([]);
                    // Refresh events to show updated participant counts
                    await fetchEvents();
                  }}
                  className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventManagement;
