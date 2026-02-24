import { useState, useEffect } from 'react';
import { FaMedal } from 'react-icons/fa';
import memberImage from '../assets/member.png';

function Membership() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://taekwondo-backend-j8w4.onrender.com/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://taekwondo-backend-j8w4.onrender.com';

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/students/public`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        setStudents(data.data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students;

  const getBeltColorStyle = (beltLevel) => {
    if (!beltLevel) return { backgroundColor: '#E5E7EB', color: '#1F2937', border: '2px solid #1F2937' };
    
    const level = beltLevel.toLowerCase();
    
    // Check for striped belts (e.g., "white yellow stripe", "yellow green stripe")
    if (level.includes('stripe')) {
      // White belt with yellow stripe
      if (level.includes('white') && level.includes('yellow')) {
        return { 
          background: 'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 40%, #FCD34D 40%, #FCD34D 60%, #FFFFFF 60%, #FFFFFF 100%)',
          color: '#000000', 
          border: '2px solid #000000' 
        };
      }
      // Yellow belt with green stripe
      if (level.includes('yellow') && level.includes('green')) {
        return { 
          background: 'linear-gradient(to bottom, #FCD34D 0%, #FCD34D 40%, #10B981 40%, #10B981 60%, #FCD34D 60%, #FCD34D 100%)',
          color: '#000000', 
          border: '2px solid #000000' 
        };
      }
      // Green belt with blue stripe
      if (level.includes('green') && level.includes('blue')) {
        return { 
          background: 'linear-gradient(to bottom, #10B981 0%, #10B981 40%, #3B82F6 40%, #3B82F6 60%, #10B981 60%, #10B981 100%)',
          color: '#FFFFFF', 
          border: '2px solid #000000' 
        };
      }
      // Blue belt with red stripe
      if (level.includes('blue') && level.includes('red')) {
        return { 
          background: 'linear-gradient(to bottom, #3B82F6 0%, #3B82F6 40%, #EF4444 40%, #EF4444 60%, #3B82F6 60%, #3B82F6 100%)',
          color: '#FFFFFF', 
          border: '2px solid #000000' 
        };
      }
      // Red belt with black stripe
      if (level.includes('red') && level.includes('black')) {
        return { 
          background: 'linear-gradient(to bottom, #EF4444 0%, #EF4444 40%, #000000 40%, #000000 60%, #EF4444 60%, #EF4444 100%)',
          color: '#FFFFFF', 
          border: '2px solid #000000' 
        };
      }
    }
    
    // Solid color belts
    if (level.includes('white')) return { backgroundColor: '#FFFFFF', color: '#000000', border: '2px solid #000000' };
    if (level.includes('yellow')) return { backgroundColor: '#FCD34D', color: '#000000', border: '2px solid #000000' };
    if (level.includes('green')) return { backgroundColor: '#10B981', color: '#FFFFFF', border: '2px solid #000000' };
    if (level.includes('blue')) return { backgroundColor: '#3B82F6', color: '#FFFFFF', border: '2px solid #000000' };
    if (level.includes('red')) return { backgroundColor: '#EF4444', color: '#FFFFFF', border: '2px solid #000000' };
    if (level.includes('black')) return { backgroundColor: '#000000', color: '#FFFFFF', border: '2px solid #000000' };
    
    return { backgroundColor: '#E5E7EB', color: '#1F2937', border: '2px solid #1F2937' };
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
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg text-white">Our Members</h1>
            <p className="text-xl md:text-2xl mb-6 drop-shadow-lg text-white">Meet Our Dedicated Taekwondo Students</p>
          </div>
        </div>
      </div>

      {/* Title and Description Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Students</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Meet our dedicated students who are on their journey to master the art of Taekwondo. 
            Each member brings their unique spirit and determination to our dojo, creating a strong 
            and supportive community of martial artists.
          </p>
        </div>

        {/* Members Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🥋</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Members Found</h3>
            <p className="text-gray-500">No members available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStudents.map((student) => (
              <div
                key={student.id || student._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
                onClick={() => {
                  setSelectedStudent(student);
                  setShowModal(true);
                }}
              >
                {/* Photo Section */}
                <div className="relative h-64 bg-gradient-to-br from-blue-500 to-blue-700">
                  {student.photo ? (
                    <img
                      src={`${BASE_URL}/${student.photo}`}
                      alt={student.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                            <svg class="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                            </svg>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                      <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="p-6">
                  {/* Name */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3 truncate">
                    {student.fullName}
                  </h3>
                  
                  {/* Belt Level */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">Current Belt</p>
                    <div 
                      className="px-4 py-2 rounded-lg font-bold text-sm inline-block"
                      style={getBeltColorStyle(student.currentBeltLevel)}
                    >
                      {student.currentBeltLevel || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Student Details</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedStudent(null);
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
                  <div className="w-48 h-48 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600">
                    {selectedStudent.photo ? (
                      <img
                        src={`${BASE_URL}/${selectedStudent.photo}`}
                        alt={selectedStudent.fullName}
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
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{selectedStudent.fullName}</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Current Belt</p>
                      <div 
                        className="px-3 py-1 rounded-lg font-bold text-sm inline-block mt-1"
                        style={getBeltColorStyle(selectedStudent.currentBeltLevel)}
                      >
                        {selectedStudent.currentBeltLevel || 'N/A'}
                      </div>
                    </div>
                    
                    {selectedStudent.joiningDate && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600">Joining Date</p>
                        <p className="text-base text-gray-900 mt-1">
                          {new Date(selectedStudent.joiningDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    {selectedStudent.age && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600">Age</p>
                        <p className="text-base text-gray-900 mt-1">{selectedStudent.age} years</p>
                      </div>
                    )}
                    
                    {selectedStudent.gender && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600">Gender</p>
                        <p className="text-base text-gray-900 mt-1 capitalize">{selectedStudent.gender}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Achievements */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">Student Achievements</h4>
                {selectedStudent.achievements && selectedStudent.achievements.length > 0 ? (
                  <div className="space-y-4">
                    {selectedStudent.achievements.map((achievement, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {achievement.tournamentName && (
                          <div className="flex items-start gap-2 mb-3">
                            <FaMedal className="text-yellow-500 text-xl mt-0.5" />
                            <h5 className="font-bold text-gray-800 text-lg">{achievement.tournamentName}</h5>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-7">
                          {achievement.address && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600">Address</p>
                              <p className="text-sm text-gray-900">{achievement.address}</p>
                            </div>
                          )}
                          
                          {achievement.type && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600">Type</p>
                              <p className="text-sm text-gray-900">{achievement.type}</p>
                            </div>
                          )}
                          
                          {achievement.date && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600">Date</p>
                              <p className="text-sm text-gray-900">
                                {new Date(achievement.date).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          
                          {achievement.prize && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600">Prize</p>
                              <p className="text-sm text-gray-900 font-semibold">{achievement.prize}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-8">No achievements yet</p>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedStudent(null);
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
    </div>
  );
}

export default Membership;
