import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import img1 from '../../assets/img1.jpg';
import { 
  FaFistRaised, 
  FaTrophy, 
  FaBolt, 
  FaShieldAlt, 
  FaUsers, 
  FaClock, 
  FaCalendarAlt, 
  FaRupeeSign, 
  FaCheckCircle, 
  FaMedal, 
  FaGraduationCap,
  FaFire,
  FaStar,
  FaHeart,
  FaSpinner
} from 'react-icons/fa';

function Courses() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // Fetch courses from backend
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/courses?isActive=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        // Transform backend data to match frontend format
        const transformedCourses = data.data.courses.map((course, index) => ({
          id: course.id,
          title: course.title,
          ageGroup: course.ageGroup,
          duration: course.duration,
          schedule: course.schedule,
          price: `₹${course.price.toLocaleString()}/month`,
          description: course.description,
          features: course.features || [],
          color: getColorForIndex(index),
          category: course.category,
          currentStudents: course.currentStudents,
          status: course.status
        }));
        
        setPrograms(transformedCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again later.');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  // Get color gradient for course cards based on index
  const getColorForIndex = (index) => {
    const colors = [
      'from-yellow-400 to-orange-500',
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-red-400 to-red-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-rose-500'
    ];
    return colors[index % colors.length];
  };

  // Load courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const belts = [
    { name: 'White Belt', requirements: 'Basic stances, blocks, and kicks', duration: '2-3 months' },
    { name: 'Yellow Belt', requirements: 'Chon-Ji pattern, basic combinations', duration: '3-4 months' },
    { name: 'Green Belt', requirements: 'Dan-Gun pattern, intermediate techniques', duration: '4-5 months' },
    { name: 'Blue Belt', requirements: 'Do-San pattern, advanced kicks', duration: '5-6 months' },
    { name: 'Red Belt', requirements: 'Won-Hyo pattern, sparring techniques', duration: '6-8 months' },
    { name: 'Black Belt 1st Dan', requirements: 'All color belt patterns, breaking', duration: '12+ months' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white" style={{ perspective: '1000px' }}>
      {/* Hero Section */}
      <section 
        className="hero-section mobile-hero-fix relative py-16 sm:py-20 min-h-[60vh] flex items-center justify-center transform-gpu"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${img1})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll',
          transform: 'rotateX(2deg)',
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-in-up">
          <div className="transform hover:scale-105 transition-all duration-500">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white">
              Training <span className="text-white">Programs</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed">
              Discover our comprehensive Taekwon-Do programs designed for every age and skill level. 
              From beginners to black belts, we have the perfect program for your martial arts journey.
            </p>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
              <FaSpinner className="animate-spin text-4xl text-red-600 mr-4" />
              <span className="text-xl text-gray-600">Loading courses...</span>
            </div>
          </div>
        </section>
      )}

      {/* Error State */}
      {error && !loading && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-4">{error}</div>
              <button
                onClick={fetchCourses}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Programs Grid */}
      {!loading && !error && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our <span className="text-red-600">Programs</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Choose from our comprehensive range of Taekwon-Do programs designed for all ages and skill levels. 
                Each program is carefully structured to provide the best learning experience.
              </p>
            </div>

            {programs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No courses available at the moment</div>
                <p className="text-gray-400 mt-2">Please check back later or contact us for more information</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {programs.map((program, index) => (
                  <div 
                    key={program.id || index} 
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:rotate-1 group"
                    style={{
                      transform: `rotateX(${5 + index * 2}deg) rotateY(${2 + index}deg)`,
                      transformStyle: 'preserve-3d',
                      animation: `float-${index % 3} 3s ease-in-out infinite`
                    }}
                  >
                    <div className={`h-2 bg-gradient-to-r ${program.color} group-hover:h-4 transition-all duration-300`}></div>
                    <div className="p-8 transform group-hover:translate-z-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                            {index === 0 && <FaUsers className="w-6 h-6 text-white" />}
                            {index === 1 && <FaGraduationCap className="w-6 h-6 text-white" />}
                            {index === 2 && <FaFire className="w-6 h-6 text-white" />}
                            {index === 3 && <FaFistRaised className="w-6 h-6 text-white" />}
                            {index === 4 && <FaTrophy className="w-6 h-6 text-white" />}
                            {index === 5 && <FaShieldAlt className="w-6 h-6 text-white" />}
                          </div>
                          <h3 className="text-3xl font-bold text-black">{program.title}</h3>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold transform group-hover:scale-110 transition-transform duration-300">
                          {program.ageGroup}
                        </span>
                      </div>
                      
                      <p className="text-base text-gray-700 mb-6">{program.description}</p>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center group/item hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
                          <div className="flex items-center">
                            <FaClock className="text-amber-500 mr-2 group-hover/item:animate-spin" />
                            <span className="text-base text-gray-700">Duration:</span>
                          </div>
                          <span className="font-semibold text-black">{program.duration}</span>
                        </div>
                        <div className="flex justify-between items-center group/item hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
                          <div className="flex items-center">
                            <FaCalendarAlt className="text-amber-500 mr-2 group-hover/item:animate-pulse" />
                            <span className="text-base text-gray-700">Schedule:</span>
                          </div>
                          <span className="font-semibold text-black text-sm">{program.schedule}</span>
                        </div>
                        <div className="flex justify-between items-center group/item hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
                          <div className="flex items-center">
                            <FaRupeeSign className="text-amber-500 mr-2 group-hover/item:animate-bounce" />
                            <span className="text-base text-gray-700">Price:</span>
                          </div>
                          <span className="font-bold text-red-600">{program.price}</span>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="font-semibold text-black mb-3 flex items-center">
                          <FaStar className="text-yellow-500 mr-2" />
                          What You'll Learn:
                        </h4>
                        <ul className="space-y-2">
                          {program.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-700 group/feature hover:text-black transition-colors duration-200">
                              <FaCheckCircle className="w-4 h-4 text-green-500 mr-2 group-hover/feature:animate-pulse" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Link
                        to="/admission"
                        className="block w-full text-center bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-500 transform hover:scale-105 hover:rotate-1 shadow-lg group-hover:shadow-xl"
                        style={{
                          transform: 'rotateX(5deg)',
                          transformStyle: 'preserve-3d'
                        }}
                      >
                        <span className="flex items-center justify-center">
                          <FaBolt className="mr-2 group-hover:animate-bounce" />
                          Enroll Now
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Belt System */}
      <section className="py-12 bg-gradient-to-r from-yellow-50 to-red-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 transform hover:scale-105 transition-all duration-500">
            <h2 className="text-2xl font-bold text-black mb-3 flex items-center justify-center">
              <FaMedal className="text-yellow-500 mr-2 animate-pulse" />
              ITF Belt <span className="text-red-600 ml-2">System</span>
            </h2>
            <p className="text-sm text-gray-700">Progress through the traditional ranking system</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {belts.map((belt, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-500 transform hover:scale-105 hover:rotate-1 group"
                style={{
                  transform: `rotateX(${3 + index}deg) rotateY(${1 + index}deg)`,
                  transformStyle: 'preserve-3d',
                  animation: `float-${index % 3} 4s ease-in-out infinite`
                }}
              >
                <div className="flex items-center mb-3">
                  <div className={`w-6 h-6 rounded-full mr-2 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 ${
                    belt.name.includes('White') ? 'bg-gray-200 border-2 border-gray-400' :
                    belt.name.includes('Yellow') ? 'bg-yellow-400' :
                    belt.name.includes('Green') ? 'bg-green-500' :
                    belt.name.includes('Blue') ? 'bg-blue-600' :
                    belt.name.includes('Red') ? 'bg-red-600' :
                    'bg-black'
                  }`}></div>
                  <h3 className="text-lg font-bold text-black group-hover:text-red-600 transition-colors duration-300">{belt.name}</h3>
                </div>
                <p className="text-sm text-gray-700 mb-2 group-hover:text-black transition-colors duration-300">{belt.requirements}</p>
                <div className="flex items-center">
                  <FaClock className="text-amber-500 mr-1 group-hover:animate-spin text-sm" />
                  <p className="text-red-600 font-semibold text-xs">Duration: {belt.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Training Schedule */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 transform hover:scale-105 transition-all duration-500">
            <h2 className="text-2xl font-bold text-black mb-3 flex items-center justify-center">
              <FaCalendarAlt className="text-red-600 mr-2 animate-bounce" />
              Weekly <span className="text-yellow-600 ml-2">Schedule</span>
            </h2>
            <p className="text-sm text-gray-700">Find the perfect time for your training</p>
          </div>
          
          <div className="bg-gray-100 rounded-xl p-6 overflow-x-auto transform hover:scale-105 hover:rotate-1 transition-all duration-500 shadow-lg"
               style={{
                 transform: 'rotateX(5deg)',
                 transformStyle: 'preserve-3d'
               }}>
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 px-3 font-semibold text-black flex items-center text-sm">
                    <FaClock className="text-amber-500 mr-1" />
                    Time
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-black text-sm">Monday</th>
                  <th className="text-left py-2 px-3 font-semibold text-black text-sm">Tuesday</th>
                  <th className="text-left py-2 px-3 font-semibold text-black text-sm">Wednesday</th>
                  <th className="text-left py-2 px-3 font-semibold text-black text-sm">Thursday</th>
                  <th className="text-left py-2 px-3 font-semibold text-black text-sm">Friday</th>
                  <th className="text-left py-2 px-3 font-semibold text-black text-sm">Saturday</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                  <td className="py-2 px-3 font-semibold text-black">9:00 AM</td>
                  <td className="py-2 px-3">-</td>
                  <td className="py-2 px-3 bg-pink-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaShieldAlt className="text-pink-600 mr-1 text-xs" />
                      <span className="text-xs">Women's Self-Defense</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">-</td>
                  <td className="py-2 px-3 bg-pink-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaShieldAlt className="text-pink-600 mr-1 text-xs" />
                      <span className="text-xs">Women's Self-Defense</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">-</td>
                  <td className="py-2 px-3 bg-purple-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaTrophy className="text-purple-600 mr-1 text-xs" />
                      <span className="text-xs">Competition Team</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                  <td className="py-2 px-3 font-semibold text-black">4:00 PM</td>
                  <td className="py-2 px-3 bg-yellow-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaUsers className="text-yellow-600 mr-1 text-xs" />
                      <span className="text-xs">Little Warriors</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">-</td>
                  <td className="py-2 px-3 bg-yellow-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaUsers className="text-yellow-600 mr-1 text-xs" />
                      <span className="text-xs">Little Warriors</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">-</td>
                  <td className="py-2 px-3 bg-yellow-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaUsers className="text-yellow-600 mr-1 text-xs" />
                      <span className="text-xs">Little Warriors</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">-</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                  <td className="py-2 px-3 font-semibold text-black">5:00 PM</td>
                  <td className="py-2 px-3">-</td>
                  <td className="py-2 px-3 bg-blue-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaGraduationCap className="text-blue-600 mr-1 text-xs" />
                      <span className="text-xs">Junior Program</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">-</td>
                  <td className="py-2 px-3 bg-blue-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaGraduationCap className="text-blue-600 mr-1 text-xs" />
                      <span className="text-xs">Junior Program</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">-</td>
                  <td className="py-2 px-3 bg-blue-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaGraduationCap className="text-blue-600 mr-1 text-xs" />
                      <span className="text-xs">Junior Program</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                  <td className="py-2 px-3 font-semibold text-black">6:00 PM</td>
                  <td className="py-2 px-3 bg-green-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaFire className="text-green-600 mr-1 text-xs" />
                      <span className="text-xs">Teen Program</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 bg-green-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaFire className="text-green-600 mr-1 text-xs" />
                      <span className="text-xs">Teen Program</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 bg-green-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaFire className="text-green-600 mr-1 text-xs" />
                      <span className="text-xs">Teen Program</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 bg-green-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaFire className="text-green-600 mr-1 text-xs" />
                      <span className="text-xs">Teen Program</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 bg-green-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaFire className="text-green-600 mr-1 text-xs" />
                      <span className="text-xs">Teen Program</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 bg-green-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaFire className="text-green-600 mr-1 text-xs" />
                      <span className="text-xs">Teen Program</span>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="py-2 px-3 font-semibold text-black">7:30 PM</td>
                  <td className="py-2 px-3 bg-red-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaFistRaised className="text-red-600 mr-1 text-xs" />
                      <span className="text-xs">Adult Program</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 bg-red-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaFistRaised className="text-red-600 mr-1 text-xs" />
                      <span className="text-xs">Adult Program</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 bg-red-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaFistRaised className="text-red-600 mr-1 text-xs" />
                      <span className="text-xs">Adult Program</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 bg-red-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaFistRaised className="text-red-600 mr-1 text-xs" />
                      <span className="text-xs">Adult Program</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 bg-red-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaFistRaised className="text-red-600 mr-1 text-xs" />
                      <span className="text-xs">Adult Program</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 bg-red-100 rounded transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                      <FaFistRaised className="text-red-600 mr-1 text-xs" />
                      <span className="text-xs">Adult Program</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8 transform hover:scale-105 transition-all duration-500">
          <div className="bg-white rounded-2xl p-8 shadow-lg"
               style={{
                 transform: 'rotateX(5deg)',
                 transformStyle: 'preserve-3d'
               }}>
            <div className="flex items-center justify-center mb-4">
              <FaHeart className="text-red-600 text-2xl mr-2 animate-pulse" />
              <h2 className="text-2xl font-bold text-black">Ready to Start Your Training?</h2>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              Choose the program that's right for you and begin your martial arts journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/admission"
                className="bg-red-600 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-red-700 transition-all duration-300 transform hover:scale-105 hover:rotate-1 shadow-lg flex items-center justify-center"
                style={{
                  transform: 'rotateX(5deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                <FaBolt className="mr-2 animate-bounce" />
                Enroll Now
              </Link>
              <Link
                to="/contact"
                className="border-2 border-gray-400 text-black px-6 py-3 rounded-lg text-base font-semibold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 hover:-rotate-1 shadow-lg flex items-center justify-center"
                style={{
                  transform: 'rotateX(-5deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                <FaCalendarAlt className="mr-2 animate-pulse" />
                Schedule a Visit
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Courses;

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes float-0 {
    0%, 100% { transform: translateY(0px) rotateX(5deg) rotateY(2deg); }
    50% { transform: translateY(-10px) rotateX(7deg) rotateY(4deg); }
  }
  @keyframes float-1 {
    0%, 100% { transform: translateY(0px) rotateX(7deg) rotateY(4deg); }
    50% { transform: translateY(-15px) rotateX(9deg) rotateY(6deg); }
  }
  @keyframes float-2 {
    0%, 100% { transform: translateY(0px) rotateX(9deg) rotateY(6deg); }
    50% { transform: translateY(-8px) rotateX(11deg) rotateY(8deg); }
  }
  @keyframes animate-fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in-up {
    animation: animate-fade-in-up 1s ease-out;
  }
`;
document.head.appendChild(style);