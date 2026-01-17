import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('achievements');
  const [totalPoints, setTotalPoints] = useState(0);
  const [nextMilestones, setNextMilestones] = useState([]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch achievements
      const achievementsResponse = await axios.get('/api/student/achievements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAchievements(achievementsResponse.data.achievements || []);
      setTotalPoints(achievementsResponse.data.totalPoints || 0);
      setNextMilestones(achievementsResponse.data.nextMilestones || []);

      // Fetch certificates
      const certificatesResponse = await axios.get('/api/student/certificates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCertificates(certificatesResponse.data || []);

      // Fetch earned badges
      const badgesResponse = await axios.get('/api/student/badges', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBadges(badgesResponse.data || []);

    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificateId) => {
    try {
      const response = await axios.get(`/api/certificates/${certificateId}/download`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate');
    }
  };

  const shareCertificate = (certificate) => {
    const shareUrl = `${window.location.origin}/verify/${certificate.verificationCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${certificate.achievementDetails.title} Certificate`,
        text: `Check out my ${certificate.achievementDetails.title} certificate from Combat Warrior Taekwon-Do Institute!`,
        url: shareUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Certificate verification link copied to clipboard!');
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'bg-gray-100 text-gray-800',
      uncommon: 'bg-green-100 text-green-800',
      rare: 'bg-blue-100 text-blue-800',
      legendary: 'bg-purple-100 text-purple-800'
    };
    return colors[rarity] || colors.common;
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-6">
        <h1 className="text-3xl font-bold mb-4">My Achievements</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{achievements.length}</div>
            <div className="text-blue-100">Total Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{certificates.length}</div>
            <div className="text-blue-100">Certificates Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{badges.length}</div>
            <div className="text-blue-100">Badges Collected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{totalPoints}</div>
            <div className="text-blue-100">Total Points</div>
          </div>
        </div>
      </div>

      {/* Next Milestones */}
      {nextMilestones.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Next Milestones</h2>
          <div className="space-y-4">
            {nextMilestones.map((milestone, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                  <span className="text-sm text-gray-500">
                    {milestone.current}/{milestone.target}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(milestone.current, milestone.target)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{milestone.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
            onClick={() => setActiveTab('certificates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'certificates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Certificates
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
        <div className="space-y-4">
          {achievements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No achievements yet. Keep training to earn your first achievement!
            </div>
          ) : (
            achievements.map((achievement) => (
              <div key={achievement._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{achievement.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(achievement.category)}`}>
                        {achievement.category.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {achievement.points} pts
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{achievement.description}</p>
                    <div className="text-sm text-gray-500">
                      Achieved on {formatDate(achievement.dateAchieved)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {achievement.certificateId && (
                      <button
                        onClick={() => downloadCertificate(achievement.certificateId)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Download Certificate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Certificates Tab */}
      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-gray-500">
              No certificates yet. Complete courses or achieve belt promotions to earn certificates!
            </div>
          ) : (
            certificates.map((certificate) => (
              <div key={certificate._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {certificate.achievementDetails.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      certificate.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {certificate.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{certificate.achievementDetails.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div>Type: {certificate.achievementType.replace('_', ' ').toUpperCase()}</div>
                    {certificate.achievementDetails.level && (
                      <div>Level: {certificate.achievementDetails.level}</div>
                    )}
                    {certificate.achievementDetails.grade && (
                      <div>Grade: {certificate.achievementDetails.grade}</div>
                    )}
                    <div>Issued: {formatDate(certificate.issuedDate)}</div>
                    <div className="font-mono text-xs">Code: {certificate.verificationCode}</div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => downloadCertificate(certificate._id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => shareCertificate(certificate)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No badges earned yet. Keep achieving milestones to collect badges!
            </div>
          ) : (
            badges.map((badge) => (
              <div key={badge._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="text-xs text-gray-500">
                    Earned on {formatDate(badge.earnedDate)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StudentAchievements;