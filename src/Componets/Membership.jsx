import { useState, useEffect } from 'react';
import { FaMedal } from 'react-icons/fa';
import memberImage from '../assets/member.png';

function Membership() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getBeltColor = (beltLevel) => {
    if (!beltLevel) return 'bg-gray-200 text-gray-800';
    
    const level = beltLevel.toLowerCase();
    if (level.includes('white')) return 'bg-gray-100 text-gray-800 border-2 border-gray-300';
    if (level.includes('yellow')) return 'bg-yellow-400 text-yellow-900';
    if (level.includes('green')) return 'bg-green-500 text-white';
    if (level.includes('blue')) return 'bg-blue-500 text-white';
    if (level.includes('red')) return 'bg-red-500 text-white';
    if (level.includes('black')) return 'bg-black text-white';
    return 'bg-gray-200 text-gray-800';
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Members</h2>
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
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1"
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
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100%25" height="100%25"%3E%3Crect fill="%23ddd" width="100%25" height="100%25"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="64"%3E👤%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-8xl text-white">👤</span>
                    </div>
                  )}
                  
                  {/* Belt Badge Overlay */}
                  <div className="absolute top-4 right-4">
                    <div className={`${getBeltColor(student.currentBeltLevel)} px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1`}>
                      <FaMedal />
                      <span>{student.currentBeltLevel || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
                    {student.fullName}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    {student.age && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Age:</span>
                        <span>{student.age} years</span>
                      </div>
                    )}
                    
                    {student.gender && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Gender:</span>
                        <span className="capitalize">{student.gender}</span>
                      </div>
                    )}
                    
                    {student.instructorName && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Instructor:</span>
                        <span className="truncate">{student.instructorName}</span>
                      </div>
                    )}
                    
                    {student.joiningDate && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Joined:</span>
                        <span>{new Date(student.joiningDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Belt Level Display */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Current Belt</p>
                      <div className={`${getBeltColor(student.currentBeltLevel)} px-4 py-2 rounded-lg font-bold text-sm inline-block`}>
                        {student.currentBeltLevel || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Membership;
