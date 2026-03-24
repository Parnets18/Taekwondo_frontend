import { useState, useEffect } from 'react';
import memberImage from '../assets/member.png';

function Membership() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

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
      {/* Image Modal - Just photo */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold hover:bg-red-600 shadow-lg z-10"
            >
              ×
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="max-w-[70vw] max-h-[80vh] object-contain rounded-lg"
              style={{ maxWidth: '500px', maxHeight: '600px' }}
            />
          </div>
        </div>
      )}

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
            {filteredStudents.map((student) => {
              const numEvents = student.achievements?.reduce((total, ach) => {
                return total + (ach.typePrices?.filter(tp => tp.type).length || 0);
              }, 0) || 0;
              
              const numMedals = student.achievements?.reduce((total, ach) => {
                return total + (ach.typePrices?.filter(tp => tp.price).length || 0);
              }, 0) || 0;

              // Count medals by type
              const medalCounts = { Gold: 0, Silver: 0, Bronze: 0 };
              student.achievements?.forEach(ach => {
                ach.typePrices?.forEach(tp => {
                  if (tp.price) {
                    const medalType = tp.price.toLowerCase().trim();
                    console.log('Medal type found:', tp.price, 'normalized:', medalType);
                    if (medalType.includes('gold')) medalCounts.Gold++;
                    else if (medalType.includes('silver') || medalType.includes('sliver')) medalCounts.Silver++;
                    else if (medalType.includes('bronze')) medalCounts.Bronze++;
                  }
                });
              });
              console.log('Student:', student.fullName, 'Medal counts:', medalCounts);
              
              return (
              <div
                key={student.id || student._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Photo Section with Belt Badge - Click to view large image */}
                <div 
                  className="relative h-64 bg-gradient-to-br from-blue-500 to-blue-700 overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (student.photo) {
                      setSelectedImage({
                        url: `${BASE_URL}/${student.photo}`,
                        name: student.fullName
                      });
                    }
                  }}
                >
                  {student.photo ? (
                    <img
                      src={`${BASE_URL}/${student.photo}`}
                      alt={student.fullName}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback icon if no photo */}
                  {!student.photo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                      <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  )}
                  
                  {/* Belt Badge Overlay - Top Right Corner - Always on top */}
                  <div className="absolute top-1 right-1 z-20">
                    <div 
                      className="px-3 py-1.5 rounded-full font-bold text-xs shadow-xl border-2 border-white flex items-center gap-1.5 backdrop-blur-sm"
                      style={{
                        ...getBeltColorStyle(student.currentBeltLevel),
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span className="text-xs font-bold">{student.currentBeltLevel || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Info Section - Click to view full card */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setSelectedStudent(student);
                    setShowModal(true);
                  }}
                >
                  {/* Name */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3 text-center uppercase">
                    {student.fullName}
                  </h3>
                  
                  {/* ID Number */}
                  <div className="text-center mb-4">
                    <p className="text-xs text-gray-500">ID Number</p>
                    <p className="text-sm font-semibold text-gray-700">{student.idNumber || student.admissionNumber || 'N/A'}</p>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="space-y-2 mt-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-700 space-y-1">
                        <div className="font-bold">Events: {numEvents}  Medals: {numMedals}</div>
                        <div className="font-bold">Gold: {student.achievements?.reduce((total, ach) => total + (ach.typePrices?.filter(tp => tp.price === 'Gold').length || 0), 0) || 0}, Silver: {student.achievements?.reduce((total, ach) => total + (ach.typePrices?.filter(tp => tp.price === 'Silver').length || 0), 0) || 0}, Bronze: {student.achievements?.reduce((total, ach) => total + (ach.typePrices?.filter(tp => tp.price === 'Bronze').length || 0), 0) || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4" style={{ paddingTop: '80px' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Student Information</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedStudent(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Photo */}
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-gray-800 shadow-lg">
                  {selectedStudent.photo ? (
                    <img
                      src={`${BASE_URL}/${selectedStudent.photo}`}
                      alt={selectedStudent.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Student Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Name */}
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-900 mb-1">1. Name</p>
                  <p className="text-base font-bold text-gray-900 uppercase">{selectedStudent.fullName}</p>
                </div>

                {/* 2. ID Number */}
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-900 mb-1">2. ID Number</p>
                  <p className="text-base font-bold text-gray-900">{selectedStudent.idNumber || selectedStudent.admissionNumber || 'N/A'}</p>
                </div>

                {/* 3. Age */}
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-900 mb-1">3. Age</p>
                  <p className="text-base font-bold text-gray-900">{selectedStudent.age || 'N/A'} years</p>
                </div>

                {/* 4. Gender */}
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-900 mb-1">4. Gender</p>
                  <p className="text-base font-bold text-gray-900 capitalize">{selectedStudent.gender || 'N/A'}</p>
                </div>

                {/* 5. Joining Date */}
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-900 mb-1">5. Joining Date</p>
                  <p className="text-base font-bold text-gray-900">
                    {selectedStudent.joiningDate ? new Date(selectedStudent.joiningDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                {/* 6. Number of Events */}
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-900 mb-1">6. Number of Events</p>
                  <p className="text-base font-bold text-gray-900">
                    {selectedStudent.achievements?.reduce((total, ach) => {
                      return total + (ach.typePrices?.filter(tp => tp.type).length || 0);
                    }, 0) || 0}
                  </p>
                </div>

                {/* 7. Number of Medals */}
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-900 mb-1">7. Number of Medals</p>
                  <p className="text-base font-bold text-gray-900">
                    {selectedStudent.achievements?.reduce((total, ach) => {
                      return total + (ach.typePrices?.filter(tp => tp.price).length || 0);
                    }, 0) || 0}
                  </p>
                  {/* Medal Breakdown */}
                  {(() => {
                    const medalCounts = { Gold: 0, Silver: 0, Bronze: 0 };
                    selectedStudent.achievements?.forEach(ach => {
                      ach.typePrices?.forEach(tp => {
                        if (tp.price) {
                          const medalType = tp.price.toLowerCase().trim();
                          if (medalType.includes('gold')) medalCounts.Gold++;
                          else if (medalType.includes('silver') || medalType.includes('sliver')) medalCounts.Silver++;
                          else if (medalType.includes('bronze')) medalCounts.Bronze++;
                        }
                      });
                    });
                    const total = medalCounts.Gold + medalCounts.Silver + medalCounts.Bronze;
                    return total > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Gold: {medalCounts.Gold}, Silver: {medalCounts.Silver}, Bronze: {medalCounts.Bronze}
                      </p>
                    );
                  })()}
                </div>

                {/* 8. Present Belt */}
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-900 mb-1">8. Present Belt</p>
                  <div 
                    className="px-3 py-1.5 rounded-lg font-bold text-xs inline-block mt-1"
                    style={getBeltColorStyle(selectedStudent.currentBeltLevel)}
                  >
                    {selectedStudent.currentBeltLevel || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedStudent(null);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
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
