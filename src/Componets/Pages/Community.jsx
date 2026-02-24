import { useState, useEffect } from 'react';
import memberImage from '../../assets/member.png';

function Community() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://taekwondo-backend-j8w4.onrender.com/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://taekwondo-backend-j8w4.onrender.com';

  useEffect(() => {
    fetchMembers();
  }, []);

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
          /* Community Members Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map((member) => (
              <div
                key={member._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Photo Section */}
                <div className="relative h-64 bg-gradient-to-br from-blue-500 to-blue-700">
                  {member.photo ? (
                    <img
                      src={`${BASE_URL}/${member.photo}`}
                      alt={member.name}
                      className="w-full h-full object-cover"
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
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {member.name}
                  </h3>
                  
                  {/* Role */}
                  <p className="text-sm font-semibold text-blue-600 mb-3">
                    {member.role}
                  </p>
                  
                  {/* Belt Level */}
                  <div className="text-center mb-3">
                    <div 
                      className="px-4 py-2 rounded-lg font-bold text-sm inline-block"
                      style={getBeltColorStyle(member.belt)}
                    >
                      {member.belt}
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

export default Community;
