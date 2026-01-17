import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AchievementManagement = () => {
  const [achievements, setAchievements] = useState([]);
  const [badges, setBadges] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('achievements');
  const [showCreateBadgeModal, setShowCreateBadgeModal] = useState(false);
  const [showAwardAchievementModal, setShowAwardAchievementModal] = useState(false);
  const [newBadge, setNewBadge] = useState({
    name: '',
    description: '',
    rarity: 'common',
    points: 10,
    criteria: {
      type: 'attendance',
      requirements: {}
    }
  });
  const [newAchievement, setNewAchievement] = useState({
    studentId: '',
    type: 'belt_promotion',
    title: '',
    description: '',
    points: 0,
    metadata: {}
  });

  useEffect(() => {
    fetchAchievements();
    fetchBadges();
    fetchStudents();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/achievements', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAchievements(response.data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await axios.get('/api/badges', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBadges(response.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCreateBadge = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('/api/badges', newBadge, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        alert('Badge created successfully!');
        setShowCreateBadgeModal(false);
        fetchBadges();
        resetBadgeForm();
      }
    } catch (error) {
      console.error('Error creating badge:', error);
      alert('Failed to create badge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAwardAchievement = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('/api/achievements', newAchievement, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        alert('Achievement awarded successfully!');
        setShowAwardAchievementModal(false);
        fetchAchievements();
        resetAchievementForm();
      }
    } catch (error) {
      console.error('Error awarding achievement:', error);
      alert('Failed to award achievement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetBadgeForm = () => {
    setNewBadge({
      name: '',
      description: '',
      rarity: 'common',
      points: 10,
      criteria: {
        type: 'attendance',
        requirements: {}
      }
    });
  };

  const resetAchievementForm = () => {
    setNewAchievement({
      studentId: '',
      type: 'belt_promotion',
      title: '',
      description: '',
      points: 0,
      metadata: {}
    });
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'bg-gray-100 text-gray-800',
      uncommon: 'bg-green-100 text-green-800',
      rare: 'bg-blue-100 text-blue-800',
      legendary: 'bg-purple-100 text-purple-800'
    };
    return colors[rarity] || colors.common;
  };

  const getCategoryColor = (category) => {
    const colors = {
      belt_promotion: 'bg-yellow-100 text-yellow-800',
      course_completion: 'bg-blue-100 text-blue-800',
      attendance: 'bg-green-100 text-green-800',
      tournament: 'bg-red-100 text-red-800',
      special: 'bg-purple-100 text-purple-800'
    };
    return colors[category] || colors.special;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Achievement Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateBadgeModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Badge
          </button>
          <button
            onClick={() => setShowAwardAchievementModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Award Achievement
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('achievements')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'achievements'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Achievements
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'badges'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Badges
          </button>
        </nav>
      </div>

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Student Achievements</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Achievement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Achieved
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {achievements.map((achievement) => (
                    <tr key={achievement._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {achievement.studentId?.fullName || 'Unknown Student'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{achievement.title}</div>
                          <div className="text-sm text-gray-500">{achievement.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(achievement.category)}`}>
                          {achievement.category.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {achievement.points}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(achievement.dateAchieved)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <div key={badge._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">{badge.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{badge.points} pts</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Criteria</h4>
                <div className="text-sm text-gray-600">
                  <div>Type: {badge.criteria.type.replace('_', ' ')}</div>
                  {badge.criteria.requirements.attendancePercentage && (
                    <div>Attendance: {badge.criteria.requirements.attendancePercentage}%</div>
                  )}
                  {badge.criteria.requirements.beltLevel && (
                    <div>Belt Level: {badge.criteria.requirements.beltLevel}</div>
                  )}
                  {badge.criteria.requirements.yearsRequired && (
                    <div>Years: {badge.criteria.requirements.yearsRequired}</div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  badge.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {badge.isActive ? 'Active' : 'Inactive'}
                </span>
                <button className="text-blue-600 hover:text-blue-900 text-sm">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Badge Modal */}
      {showCreateBadgeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Badge</h3>
              
              <form onSubmit={handleCreateBadge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Badge Name</label>
                  <input
                    type="text"
                    value={newBadge.name}
                    onChange={(e) => setNewBadge({...newBadge, name: e.target.value})}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newBadge.description}
                    onChange={(e) => setNewBadge({...newBadge, description: e.target.value})}
                    required
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rarity</label>
                  <select
                    value={newBadge.rarity}
                    onChange={(e) => setNewBadge({...newBadge, rarity: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Points</label>
                  <input
                    type="number"
                    value={newBadge.points}
                    onChange={(e) => setNewBadge({...newBadge, points: parseInt(e.target.value)})}
                    min="0"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Criteria Type</label>
                  <select
                    value={newBadge.criteria.type}
                    onChange={(e) => setNewBadge({
                      ...newBadge, 
                      criteria: {...newBadge.criteria, type: e.target.value}
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="attendance">Attendance</option>
                    <option value="belt_promotion">Belt Promotion</option>
                    <option value="course_completion">Course Completion</option>
                    <option value="tournament">Tournament</option>
                    <option value="years_service">Years of Service</option>
                    <option value="special">Special</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateBadgeModal(false);
                      resetBadgeForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Badge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Award Achievement Modal */}
      {showAwardAchievementModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Award Achievement</h3>
              
              <form onSubmit={handleAwardAchievement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student</label>
                  <select
                    value={newAchievement.studentId}
                    onChange={(e) => setNewAchievement({...newAchievement, studentId: e.target.value})}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.fullName} - {student.studentId}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Achievement Type</label>
                  <select
                    value={newAchievement.type}
                    onChange={(e) => setNewAchievement({...newAchievement, type: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="belt_promotion">Belt Promotion</option>
                    <option value="course_completion">Course Completion</option>
                    <option value="perfect_attendance">Perfect Attendance</option>
                    <option value="tournament_participation">Tournament Participation</option>
                    <option value="tournament_winner">Tournament Winner</option>
                    <option value="years_of_training">Years of Training</option>
                    <option value="instructor_recognition">Instructor Recognition</option>
                    <option value="community_service">Community Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={newAchievement.title}
                    onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newAchievement.description}
                    onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                    required
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Points</label>
                  <input
                    type="number"
                    value={newAchievement.points}
                    onChange={(e) => setNewAchievement({...newAchievement, points: parseInt(e.target.value)})}
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAwardAchievementModal(false);
                      resetAchievementForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                  >
                    {loading ? 'Awarding...' : 'Award Achievement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementManagement;