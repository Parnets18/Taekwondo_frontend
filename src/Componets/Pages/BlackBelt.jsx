import { useState, useEffect } from 'react';
import memberImage from '../../assets/member.png';

function BlackBelt() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:9000';

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/black-belt`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setMembers(data.data.members || []);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementsList = (achievementsStr) => {
    if (!achievementsStr) return [];
    return achievementsStr.split(', ').filter(a => a.trim());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative h-96 bg-cover bg-center"
        style={{
          backgroundImage: `url(${memberImage})`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg text-white">Black Belt</h1>
            <p className="text-xl md:text-2xl mb-6 drop-shadow-lg text-white">Masters of the Art</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Black Belt Members</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our black belt members represent the highest level of achievement in Taekwondo. 
            They embody the principles of discipline, respect, and mastery through years of dedicated training.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🥋</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Black Belt Members Yet</h3>
            <p className="text-gray-500">Black belt members will appear here once added</p>
          </div>
        ) : (
          /* Black Belt Members Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map((member) => (
              <div
                key={member._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Photo Section - Click to view image */}
                <div 
                  className="relative h-64 bg-gradient-to-br from-gray-800 to-black overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (member.photo) {
                      setSelectedImage(`${BASE_URL}/${member.photo}`);
                      setShowImageModal(true);
                    }
                  }}
                >
                  {member.photo ? (
                    <img
                      src={`${BASE_URL}/${member.photo}`}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  
                  {/* Fallback icon if no photo */}
                  {!member.photo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  )}
                  
                  {/* Belt Badge Overlay - Top Right Corner */}
                  <div className="absolute top-1 right-1 z-20">
                    <div className="px-3 py-1.5 rounded-full font-bold text-xs shadow-xl border-2 border-white flex items-center gap-1.5 backdrop-blur-sm bg-black text-white">
                      <svg className="w-3.5 h-3.5" fill="white" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span className="text-xs font-bold">{member.belt || 'Black'}</span>
                    </div>
                  </div>
                </div>

                {/* Info Section - Click to view full card */}
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => {
                    setSelectedMember(member);
                    setShowModal(true);
                  }}
                >
                  {/* Name */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3 text-center uppercase">
                    {member.name}
                  </h3>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-semibold text-gray-700">Training:</span>
                      <span className="text-gray-600 ml-2">{member.yearsTraining}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-semibold text-gray-700">Achievements:</span>
                      <div className="text-gray-600 mt-1">
                        {(() => {
                          const achievements = getAchievementsList(member.achievements);
                          const displayCount = Math.min(2, achievements.length);
                          
                          return (
                            <>
                              {achievements.slice(0, displayCount).map((achievement, idx) => (
                                <p key={idx} className="mb-1 text-xs truncate">• {achievement}</p>
                              ))}
                              {achievements.length > 2 && (
                                <p className="text-blue-600 text-xs font-semibold mt-1">
                                  +{achievements.length - 2} more...
                                </p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Details Modal */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4 pt-32">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Black Belt Details</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedMember(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Photo and Basic Info */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Photo */}
                <div className="flex-shrink-0">
                  <div className="w-48 h-48 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-black">
                    {selectedMember.photo ? (
                      <img
                        src={`${BASE_URL}/${selectedMember.photo}`}
                        alt={selectedMember.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{selectedMember.name}</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Belt Level</p>
                      <div className="bg-black text-white px-3 py-1 rounded-lg font-bold text-sm inline-block mt-1">
                        {selectedMember.belt}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Years of Training</p>
                      <p className="text-base text-gray-900 mt-1">{selectedMember.yearsTraining}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏆</span> Achievements
                </h4>
                {getAchievementsList(selectedMember.achievements).length > 0 ? (
                  <div className="space-y-3">
                    {getAchievementsList(selectedMember.achievements).map((achievement, index) => (
                      <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            {index + 1}
                          </div>
                          <p className="text-gray-800 flex-1 pt-1 font-medium">{achievement}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <span className="text-6xl mb-4 block">🥋</span>
                    <p className="text-gray-500 italic">No achievements listed yet</p>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedMember(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal - Show only photo */}
      {showImageModal && selectedImage && (
        <div 
          className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4 pt-32"
          onClick={() => {
            setShowImageModal(false);
            setSelectedImage(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl p-4 w-[50vw] max-w-[600px] max-h-[80vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedImage(null);
                }}
                className="text-red-500 hover:text-red-700 text-3xl font-bold"
              >
                ×
              </button>
            </div>
            <img
              src={selectedImage}
              alt="Black Belt Member"
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default BlackBelt;
