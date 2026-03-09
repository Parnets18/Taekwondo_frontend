import { useState, useEffect } from 'react';
import memberImage from '../../assets/member.png';

function Community() {
  const [members, setMembers] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://taekwondo-backend-j8w4.onrender.com/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://taekwondo-backend-j8w4.onrender.com';

  useEffect(() => {
    fetchMembers();
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/achievements`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setAchievements(data.data.achievements || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/community`);
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

  const getBeltColorStyle = (belt) => {
    if (!belt) return { backgroundColor: '#E5E7EB', color: '#1F2937', border: '2px solid #1F2937' };
    
    const beltLower = belt.toLowerCase();
    
    // Check for striped belts
    if (beltLower.includes('stripe')) {
      // White belt with yellow stripe
      if (beltLower.includes('white') && beltLower.includes('yellow')) {
        return { 
          background: 'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 40%, #FCD34D 40%, #FCD34D 60%, #FFFFFF 60%, #FFFFFF 100%)',
          color: '#000000', 
          border: '2px solid #000000' 
        };
      }
      // Yellow belt with green stripe
      if (beltLower.includes('yellow') && beltLower.includes('green')) {
        return { 
          background: 'linear-gradient(to bottom, #FCD34D 0%, #FCD34D 40%, #10B981 40%, #10B981 60%, #FCD34D 60%, #FCD34D 100%)',
          color: '#000000', 
          border: '2px solid #000000' 
        };
      }
      // Green belt with blue stripe
      if (beltLower.includes('green') && beltLower.includes('blue')) {
        return { 
          background: 'linear-gradient(to bottom, #10B981 0%, #10B981 40%, #3B82F6 40%, #3B82F6 60%, #10B981 60%, #10B981 100%)',
          color: '#FFFFFF', 
          border: '2px solid #000000' 
        };
      }
      // Blue belt with red stripe
      if (beltLower.includes('blue') && beltLower.includes('red')) {
        return { 
          background: 'linear-gradient(to bottom, #3B82F6 0%, #3B82F6 40%, #EF4444 40%, #EF4444 60%, #3B82F6 60%, #3B82F6 100%)',
          color: '#FFFFFF', 
          border: '2px solid #000000' 
        };
      }
      // Red belt with black stripe
      if (beltLower.includes('red') && beltLower.includes('black')) {
        return { 
          background: 'linear-gradient(to bottom, #EF4444 0%, #EF4444 40%, #000000 40%, #000000 60%, #EF4444 60%, #EF4444 100%)',
          color: '#FFFFFF', 
          border: '2px solid #000000' 
        };
      }
    }
    
    // Solid color belts
    if (beltLower.includes('white')) return { backgroundColor: '#FFFFFF', color: '#000000', border: '2px solid #000000' };
    if (beltLower.includes('yellow')) return { backgroundColor: '#FCD34D', color: '#000000', border: '2px solid #000000' };
    if (beltLower.includes('green')) return { backgroundColor: '#10B981', color: '#FFFFFF', border: '2px solid #000000' };
    if (beltLower.includes('blue')) return { backgroundColor: '#3B82F6', color: '#FFFFFF', border: '2px solid #000000' };
    if (beltLower.includes('red')) return { backgroundColor: '#EF4444', color: '#FFFFFF', border: '2px solid #000000' };
    if (beltLower.includes('black')) return { backgroundColor: '#000000', color: '#FFFFFF', border: '2px solid #000000' };
    
    return { backgroundColor: '#E5E7EB', color: '#1F2937', border: '2px solid #1F2937' };
  };

  const getMedalCounts = (achievements) => {
    if (!achievements || !Array.isArray(achievements)) {
      return { Gold: 0, Silver: 0, Bronze: 0, total: 0, events: 0 };
    }
    
    const counts = { Gold: 0, Silver: 0, Bronze: 0, total: 0, events: 0 };
    const uniqueEvents = new Set();
    
    achievements.forEach(achievement => {
      if (achievement.medalType) {
        counts[achievement.medalType]++;
        counts.total++;
      }
      if (achievement.eventName) {
        uniqueEvents.add(achievement.eventName);
      }
    });
    
    counts.events = uniqueEvents.size;
    return counts;
  };

  const getInstructorAchievements = () => {
    return achievements.filter(a => a.type === 'instructor');
  };

  const getStudentAchievements = () => {
    return achievements.filter(a => a.type === 'student');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Modal - Just photo in a card */}
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
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold hover:bg-red-600 shadow-lg z-10"
            >
              ×
            </button>

            {/* Photo Only - Bigger Size */}
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="max-w-[90vw] max-h-[95vh] object-contain rounded-lg"
              style={{ minWidth: '600px', minHeight: '600px' }}
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
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg text-white">Our Community</h1>
            <p className="text-xl md:text-2xl mb-6 drop-shadow-lg text-white">Building Strength Together</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Community Leaders</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Meet the dedicated instructors and leaders who guide our community. Their expertise, 
            passion, and commitment create a supportive environment for all members to thrive.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Community Members Yet</h3>
            <p className="text-gray-500">Community members will appear here once added</p>
          </div>
        ) : (
          // Community Members Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map((member) => (
              <div
                key={member._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Photo Section */}
                <div 
                  className="relative h-64 bg-gradient-to-br from-blue-500 to-blue-700 overflow-hidden cursor-pointer"
                  onClick={() => member.photo && setSelectedImage({
                    url: `${BASE_URL}/${member.photo}`,
                    name: member.name,
                    role: member.role,
                    belt: member.belt,
                    beltStyle: getBeltColorStyle(member.belt)
                  })}
                >
                  {member.photo ? (
                    <img
                      src={`${BASE_URL}/${member.photo}`}
                      alt={member.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  ) : null}
                  
                  {/* Fallback icon if no photo */}
                  {!member.photo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                      <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  )}
                  
                  {/* Belt Badge Overlay - Top Right Corner */}
                  <div className="absolute top-1 right-1 z-20">
                    <div 
                      className="px-3 py-1.5 rounded-full font-bold text-xs shadow-xl border-2 border-white flex items-center gap-1.5 backdrop-blur-sm"
                      style={{
                        ...getBeltColorStyle(member.belt),
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <svg className="w-3.5 h-3.5" fill="white" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span className="text-xs font-bold">{member.belt || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-6">
                  {/* Name */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 uppercase">
                    {member.name}
                  </h3>
                  
                  {/* Role */}
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Community;
