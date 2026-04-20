import { useEffect, useState } from 'react';
import { 
  FaFistRaised, 
  FaBolt, 
  FaCheckCircle, 
  FaMedal, 
  FaGraduationCap,
  FaStar,
  FaHandshake,
  FaQuoteLeft,
  FaAward,
  FaFlag,
  FaBalanceScale,
  FaWalking,
  FaUserAlt,
  FaDumbbell,
  FaUsers,
  FaUser
} from 'react-icons/fa';
import photo1 from '../../assets/photo1.jpg';
import p1 from '../../assets/p1.jpg';
import cwtakBanner from '../../assets/image 11.png';
import textImage from '../../assets/text.png';
import choiJung from '../../assets/Choi Jung.png';
import './About.css';

function About() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dojangStory, setDojangStory] = useState(null);
  const [loadingStory, setLoadingStory] = useState(true);
  const [mentors, setMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [leadership, setLeadership] = useState([]);
  const [loadingLeadership, setLoadingLeadership] = useState(true);
  const [instructorAchievements, setInstructorAchievements] = useState([]);
  const [studentAchievements, setStudentAchievements] = useState([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [founders, setFounders] = useState([]);
  const [founderDescription, setFounderDescription] = useState('');
  const [loadingFounders, setLoadingFounders] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cwtakarnataka.com/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://cwtakarnataka.com';

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setLightboxImage(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    // Fetch locations from API
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/locations`);
        const data = await response.json();
        setLocations(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    // Fetch dojang story from API
    const fetchDojangStory = async () => {
      try {
        setLoadingStory(true);
        const response = await fetch(`${API_BASE_URL}/about-dojang-story`);
        const data = await response.json();
        
        if (data.status === 'success') {
          setDojangStory(data.data.story);
        }
      } catch (error) {
        console.error('Error fetching dojang story:', error);
      } finally {
        setLoadingStory(false);
      }
    };

    fetchDojangStory();
  }, []);

  useEffect(() => {
    // Fetch mentors from API
    const fetchMentors = async () => {
      try {
        setLoadingMentors(true);
        const response = await fetch(`${API_BASE_URL}/mentors`);
        const data = await response.json();
        
        if (data.status === 'success') {
          setMentors(data.data.mentors);
        }
      } catch (error) {
        console.error('Error fetching mentors:', error);
      } finally {
        setLoadingMentors(false);
      }
    };

    fetchMentors();
  }, []);

  useEffect(() => {
    // Fetch leadership from API
    const fetchLeadership = async () => {
      try {
        setLoadingLeadership(true);
        const response = await fetch(`${API_BASE_URL}/leadership`);
        const data = await response.json();
        
        if (data.status === 'success') {
          setLeadership(data.data.leadership);
        }
      } catch (error) {
        console.error('Error fetching leadership:', error);
      } finally {
        setLoadingLeadership(false);
      }
    };

    fetchLeadership();
  }, []);

  useEffect(() => {
    // Fetch achievements from API
    const fetchAchievements = async () => {
      try {
        setLoadingAchievements(true);
        const response = await fetch(`${API_BASE_URL}/achievements`);
        const data = await response.json();
        
        if (data.status === 'success') {
          const achievements = data.data.achievements;
          setInstructorAchievements(achievements.filter(a => a.type === 'instructor'));
          setStudentAchievements(achievements.filter(a => a.type === 'student'));
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoadingAchievements(false);
      }
    };

    fetchAchievements();
  }, []);

  useEffect(() => {
    const fetchFounders = async () => {
      try {
        setLoadingFounders(true);
        const response = await fetch(`${API_BASE_URL}/founders`);
        const data = await response.json();
        
        if (data.status === 'success') {
          setFounders(data.data.founders);
          setFounderDescription(data.data.description || '');
        }
      } catch (error) {
        console.error('Error fetching founders:', error);
      } finally {
        setLoadingFounders(false);
      }
    };

    fetchFounders();
  }, []);
  
  useEffect(() => {
    // Inject CSS to override blue colors immediately when component mounts
    const styleId = 'about-page-override';
    
    // Remove existing style if present
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create new style element
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* FORCE ALL BLUE TO BLACK IN ABOUT PAGE - HIGHEST PRIORITY */
      .about-page * {
        color: #000000 !important;
      }
      
      /* Preserve white text */
      .about-page .text-white,
      .about-page .text-white *,
      .about-page [class*="text-white"],
      .about-page [class*="text-white"] * {
        color: white !important;
      }
      
      /* Preserve red text */
      .about-page [style*="color: #DC2626"],
      .about-page [style*="color: #DC2626"] *,
      .about-page [style*="color:#DC2626"],
      .about-page [style*="color:#DC2626"] *,
      .about-page [style*="color: rgb(220, 38, 38)"],
      .about-page [style*="color: rgb(220, 38, 38)"] * {
        color: #DC2626 !important;
      }
      
      /* Preserve yellow text */
      .about-page [style*="color: #FFDE21"],
      .about-page [style*="color: #FFDE21"] *,
      .about-page [style*="color:#FFDE21"],
      .about-page [style*="color:#FFDE21"] *,
      .about-page [style*="color: #FFDE21"],
      .about-page [style*="color: #FFDE21"] *,
      .about-page [style*="color:#FFDE21"],
      .about-page [style*="color:#FFDE21"] * {
        color: #FFDE21 !important;
      }
      
      /* Preserve gray text */
      .about-page [style*="color: #374151"],
      .about-page [style*="color: #374151"] *,
      .about-page [style*="color:#374151"],
      .about-page [style*="color:#374151"] *,
      .about-page [style*="color: #4B5563"],
      .about-page [style*="color: #4B5563"] *,
      .about-page [style*="color:#4B5563"],
      .about-page [style*="color:#4B5563"] * {
        color: #374151 !important;
      }
      
      /* Force all headings to black */
      .about-page h1,
      .about-page h2,
      .about-page h3,
      .about-page h4,
      .about-page h5,
      .about-page h6 {
        color: #000000 !important;
      }
      
      /* Force all text elements to black */
      .about-page p,
      .about-page span,
      .about-page div,
      .about-page a,
      .about-page li {
        color: #000000 !important;
      }
    `;
    
    // Append to head
    document.head.appendChild(style);
    
    // Cleanup function
    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, []);


  return (
    <div className="about-page" style={{ background: 'linear-gradient(to bottom, #FEF3C7, #FECACA)', minHeight: '100vh' }}>
      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              maxWidth: '560px',
              width: '90vw',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
            }}
          >
            <button
              onClick={() => setLightboxImage(null)}
              style={{
                position: 'absolute', top: '8px', right: '10px', zIndex: 1,
                background: 'white', border: 'none', borderRadius: '50%',
                width: '28px', height: '28px', fontSize: '1.1rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                color: '#333'
              }}
            >×</button>
            <img
              src={lightboxImage}
              alt="Full view"
              style={{ width: '100%', maxHeight: '80vh', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section 
        className="hero-section mobile-hero-fix relative py-20 sm:py-24 min-h-[60vh] flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${photo1})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            <span style={{ color: '#DC2626' }}>About Combat</span> <span className="text-white">Warrior Taekwon-Do</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
            <span style={{ color: '#FFFFFF' }}>
              Authentic ITF Taekwon-Do training in Karnataka, preserving the traditional 
              martial art founded by General Choi Hong Hi while building strong character 
              and physical fitness in our students.
            </span>
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loadingStory ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
            </div>
          ) : dojangStory ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-4xl font-bold mb-4 sm:mb-6 flex items-center flex-wrap" style={{ color: '#000000' }}>
                  <FaFlag className="mr-2 sm:mr-3" style={{ color: '#DC2626' }} />
                  <span style={{ color: '#DC2626' }}>Our</span>
                  <span className="mx-2"></span>
                  <span style={{ color: '#000000' }}>Dojang</span>
                  <span className="mx-2"></span>
                  <span style={{ color: '#FFDE21' }}>Story</span>
                </h2>
                <div className="space-y-3 sm:space-y-4 text-sm sm:text-base" style={{ color: '#374151' }}>
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {dojangStory.description}
                  </p>
                </div>
              </div>
              <div className="relative order-1 lg:order-2">
                <div className="rounded-2xl overflow-hidden shadow-xl" style={{ border: '4px solid #F97316' }}>
                  <img 
                    src={`${BASE_URL}/${dojangStory.photo}`}
                    alt={dojangStory.title}
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                  />
                </div>
                {/* Decorative circles */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#FFDE21] rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-red-400 rounded-full"></div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">Story Not Available</h3>
              <p className="text-gray-500">Please contact the administrator</p>
            </div>
          )}
        </div>
      </section>

      {/* CWTAK History Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-4xl font-bold mb-3 sm:mb-4 flex items-center justify-center flex-wrap" style={{ color: '#000000' }}>
              <FaFlag className="mr-2 sm:mr-3" style={{ color: '#DC2626' }} />
              <span style={{ color: '#DC2626' }}>CW</span>
              <span style={{ color: '#FFDE21' }}>TAK</span>
              <span className="mx-2"></span>
              <span style={{ color: '#000000' }}>History</span>
            </h2>
            <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: '#FFDE21' }}></div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-50 to-[#FFF9E6] rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10" style={{ borderLeft: '4px solid #DC2626' }}>
              <div className="space-y-4 sm:space-y-5 text-sm sm:text-base leading-relaxed" style={{ color: '#374151' }}>
                <p className="text-base sm:text-lg font-semibold" style={{ color: '#000000' }}>
                  Combat Warrior Taekwon-Do Association of Karnataka (CWTAK) was formed in 2017. It is affiliated to All India Taekwon-Do Association and International Taekwon-DO Federation, UK.
                </p>
                
                <p>
                  Here, Taekwon-Do is more than just training for strength, confidence and self-esteem can only be improved by coaching each student.
                </p>
                
                <p>
                  When looking for a martial arts school, it can be difficult. We live in an age of commercialised, franchised martial arts and a market saturated with instructors.
                </p>
                
                <p>
                  Several athletes (martial artists) learned much about the roots of Taekwon-Do and gained a greater appreciation for the art by our <span className="font-semibold" style={{ color: '#000000' }}>Master V. Maruthi Prasad, 8th Dan, President, All India Taekwon-Do Association.</span>
                </p>
                
                <p className="text-base sm:text-lg font-semibold" style={{ color: '#DC2626' }}>
                  CWTAK is the perfect tool to unlocking your child's potential. It can be seen that the study of Taekwon-Do is recommended for men, women and children of all age groups.
                </p>
              </div>

              {/* Decorative elements */}
              <div className="mt-6 pt-6" style={{ borderTop: '1px solid #FDE68A' }}>
                <div className="flex items-center justify-center space-x-4">
                  <FaStar className="text-xl animate-pulse" style={{ color: '#DC2626' }} />
                  <span className="text-sm font-semibold text-gray-600">Established 2017</span>
                  <FaStar className="text-xl animate-pulse" style={{ color: '#DC2626' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Class Process In CWTAK Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-[#FFF9E6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-4xl font-bold mb-3 sm:mb-4" style={{ color: '#000000' }}>
               <span style={{ color: '#DC2626' }}>Class</span>
               <span className="mx-2"></span>
              <span style={{ color: '#000000' }}>Process In</span>
              <span className="mx-2"></span>
              <span style={{ color: '#FFDE21' }}>CWTAK</span>
            </h2>
            <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: '#FFDE21' }}></div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Process Item 1 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#FFFFFF', border: '2px solid #FFDE21' }}>
                    <span style={{ color: '#DC2626', fontWeight: 'bold', fontSize: '1.125rem' }}>1</span>
                  </div>
                  <p className="leading-relaxed" style={{ color: '#374151' }}>
                    Classes are conducted <span className="font-semibold" style={{ color: '#000000' }}>twice in a week.</span>
                  </p>
                </div>
              </div>

              {/* Process Item 2 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#FFFFFF', border: '2px solid #FFDE21' }}>
                    <span style={{ color: '#DC2626', fontWeight: 'bold', fontSize: '1.125rem' }}>2</span>
                  </div>
                  <p className="leading-relaxed" style={{ color: '#374151' }}>
                    Group sessions for students to <span className="font-semibold" style={{ color: '#000000' }}>promote social skills.</span>
                  </p>
                </div>
              </div>

              {/* Process Item 3 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#FFFFFF', border: '2px solid #FFDE21' }}>
                    <span style={{ color: '#DC2626', fontWeight: 'bold', fontSize: '1.125rem' }}>3</span>
                  </div>
                  <p className="leading-relaxed" style={{ color: '#374151' }}>
                    Advanced tests are conducted for the <span className="font-semibold" style={{ color: '#000000' }}>promotion of students to the next level belt (Belt Exams)</span>
                  </p>
                </div>
              </div>

              {/* Process Item 4 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#FFFFFF', border: '2px solid #FFDE21' }}>
                    <span style={{ color: '#DC2626', fontWeight: 'bold', fontSize: '1.125rem' }}>4</span>
                  </div>
                  <p className="leading-relaxed" style={{ color: '#374151' }}>
                    Provided <span className="font-semibold" style={{ color: '#000000' }}>one-on-one sessions to empower students.</span>
                  </p>
                </div>
              </div>

              {/* Process Item 5 - Full Width */}
              <div className="md:col-span-2 bg-gradient-to-r from-[#FFF9E6] to-red-50 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#FFFFFF', border: '2px solid #FFDE21' }}>
                    <span style={{ color: '#DC2626', fontWeight: 'bold', fontSize: '1.125rem' }}>5</span>
                  </div>
                  <p className="leading-relaxed" style={{ color: '#374151' }}>
                    Involving students in various events like <span className="font-semibold" style={{ color: '#000000' }}>internal level, club level, district level, state level, Nationals, Internationals, and Asian.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* General Choi Hong-Hi - Founder Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#000000' }}>
              <span style={{ color: '#DC2626' }}>Founder</span>
              <span className="mx-2">of</span>
              <span style={{ color: '#FFDE21' }}>Taekwon-Do</span>
            </h2>
            <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: '#DC2626' }}></div>
          </div>

          {loadingFounders ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
            </div>
          ) : founders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Side - Photos Stacked */}
              <div className="lg:col-span-1 space-y-6">
                {founders.map((founder, index) => (
                  <div 
                    key={founder._id} 
                    className="bg-white rounded-xl shadow-lg overflow-hidden" 
                    style={{ border: `3px solid ${index === 0 ? '#DC2626' : '#FFDE21'}` }}
                  >
                    <div className="relative">
                      <img 
                        src={`${BASE_URL}/${founder.photo}`}
                        alt={founder.name} 
                        className="w-full h-64 object-cover"
                        style={{ cursor: 'zoom-in' }}
                        onClick={() => setLightboxImage(`${BASE_URL}/${founder.photo}`)}
                      />
                    </div>
                    <div className="p-4 text-center bg-white">
                      <h3 className="text-lg font-bold mb-1" style={{ color: '#000000' }}>{founder.name}</h3>
                      <p className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>{founder.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Side - Content */}
              <div className="lg:col-span-3">
                <div className="space-y-5">
                  {founderDescription.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-base leading-relaxed" style={{ color: '#374151' }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Founder Information Available</h3>
              <p className="text-gray-500">Please contact the administrator</p>
            </div>
          )}
        </div>
      </section>

      {/* Core Values - ITF Tenets */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16 transform hover:scale-105 transition-all duration-500">
            <h2 className="text-4xl font-bold mb-3 sm:mb-4 flex items-center justify-center flex-wrap" style={{ color: '#000000' }}>
              <FaStar className="mr-2 sm:mr-3" style={{ color: '#FFDE21' }} />
              <span className="mx-2"></span>
              <span style={{ color: '#DC2626' }}>The Five</span>
                <span className="mx-2"></span>
              <span style={{ color: '#000000' }}>Tenets of</span>
              <span className="mx-2"></span>
              <span style={{ color: '#FFDE21' }}>Taekwon-Do</span>
            </h2>
            <p className="text-lg sm:text-xl font-semibold" style={{ color: '#374151' }}>The fundamental principles that guide every ITF practitioner</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { 
                title: 'Courtesy', 
                description: 'Refers to showing courtesy to all others inside and outside of the training academy.', 
                icon: FaHandshake,
                bgColor: '#FFFFFF',
                iconColor: '#FFDE21'
              },
              { 
                title: 'Integrity', 
                description: 'Students are expected to be honest and be willing to exhibit strong moral principles that will help them distinguish between right and wrong.', 
                icon: FaBalanceScale,
                bgColor: '#FFFFFF',
                iconColor: '#DC2626'
              },
              { 
                title: 'Perseverance', 
                description: 'Perseverance simply refers to the willingness of the Taekwon-Do student to continue his/her training and struggle against all odds in order to reach the goal.', 
                icon: FaWalking,
                bgColor: '#FFFFFF',
                iconColor: '#FFDE21'
              },
              { 
                title: 'Self-control', 
                description: 'Students are expected to have control over your thoughts, emotions as well as your actions.', 
                icon: FaUserAlt,
                bgColor: '#FFFFFF',
                iconColor: '#DC2626'
              },
              { 
                title: 'Indomitable Spirit', 
                description: 'Students will consistently exhibit a full 100% effort in all they do and must show courage to stand up for your principles and beliefs and to stay standing strong no matter who you go against and what hindrances are ahead of you.', 
                icon: FaDumbbell,
                bgColor: '#FFFFFF',
                iconColor: '#FFDE21'
              }
            ].map((tenet, index) => (
              <div 
                key={index} 
                className="rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 text-center"
                style={{ backgroundColor: tenet.bgColor }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FFFFFF' }}>
                  <tenet.icon style={{ color: tenet.iconColor, fontSize: '2rem' }} />
                </div>
                <h3 style={{ color: '#000000', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.75rem' }}>{tenet.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{tenet.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Training History Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-red-100 to-[#FFF4CC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-4xl font-bold mb-3 sm:mb-4 flex items-center justify-center flex-wrap" style={{ color: '#000000' }}>
              <FaGraduationCap className="mr-2 sm:mr-3" style={{ color: '#FFDE21', fontSize: '1.5rem' }} />
              <span className="mx-2"></span>
              <span style={{ color: '#DC2626' }}>Our</span>
                <span className="mx-2"></span>
              <span style={{ color: '#000000' }}>Esteemed</span>
              <span className="mx-2"></span>
              <span style={{ color: '#FFDE21' }}>Mentors</span>
            </h2>
            <p className="text-lg sm:text-xl" style={{ color: '#374151' }}>In 2008, Yeshwanth B R began training under</p>
          </div>
          
          {loadingMentors ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
            </div>
          ) : mentors.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {mentors.map((mentor) => (
                  <div key={mentor._id} className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-500" style={{ borderTop: '4px solid #FFDE21' }}>
                    <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '3px solid #FFDE21' }}>
                      {mentor.photo ? (
                        <img
                          src={`${BASE_URL}/${mentor.photo}`}
                          alt={mentor.name}
                          className="w-full h-full object-cover"
                          style={{ cursor: 'zoom-in' }}
                          onClick={() => setLightboxImage(`${BASE_URL}/${mentor.photo}`)}
                        />
                      ) : (
                        <FaUser style={{ color: '#FFDE21', fontSize: '3rem' }} />
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: '#000000' }}>{mentor.name}</h3>
                    <p className="font-bold mb-1 text-sm sm:text-base" style={{ color: '#DC2626' }}>{mentor.rank}</p>
                    <p className="text-xs sm:text-sm mb-2" style={{ color: '#374151' }}>{mentor.position}</p>
                    {mentor.description && (
                      <p className="font-semibold text-xs sm:text-sm" style={{ color: '#374151' }}>{mentor.description}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Closing Statement */}
              <div className="text-center mt-8">
                <p className="text-lg sm:text-xl font-semibold" style={{ color: '#374151' }}>
                  Yeshwanth B.R feels Grateful to be Trained Under Fabulous Mentors.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Mentors Available</h3>
              <p className="text-gray-500">Please contact the administrator</p>
            </div>
          )}
        </div>
      </section>

      {/* CWTAK Leadership Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-4xl font-bold mb-3 sm:mb-4 flex items-center justify-center flex-wrap" style={{ color: '#000000' }}>
              <FaUsers className="mr-2 sm:mr-3" style={{ color: '#FFDE21', fontSize: '1.5rem' }} />
              <span style={{ color: '#DC2626' }}>CWTAK</span>
              <span className="mx-2"></span>
              <span style={{ color: '#000000' }}>Leadership</span>
            </h2>
            <p className="text-lg sm:text-xl" style={{ color: '#374151' }}>Combat Warrior Taekwon-Do Association of Karnataka</p>
          </div>
          
          {loadingLeadership ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
            </div>
          ) : leadership.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {leadership.map((leader) => (
                <div key={leader._id} className="bg-gradient-to-br from-[#FFF9E6] to-orange-50 rounded-2xl shadow-xl p-6 sm:p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2" style={{ borderTop: '4px solid #FFDE21' }}>
                  <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg overflow-hidden" style={{ border: '4px solid #DC2626' }}>
                    {leader.photo ? (
                      <img
                        src={`${BASE_URL}/${leader.photo}`}
                        alt={leader.name}
                        className="w-full h-full object-cover"
                        style={{ cursor: 'zoom-in' }}
                        onClick={() => setLightboxImage(`${BASE_URL}/${leader.photo}`)}
                      />
                    ) : (
                      <FaUser style={{ fontSize: '3rem', color: '#DC2626' }} />
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#000000' }}>{leader.name}</h3>
                  <div className="mb-3">
                    <p className="font-bold text-base sm:text-lg" style={{ color: '#DC2626' }}>{leader.rank}</p>
                    <p className="font-semibold text-sm sm:text-base" style={{ color: '#374151' }}>{leader.position}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 mt-4">
                    <p className="text-sm leading-relaxed" style={{ color: '#4B5563' }}>
                      {leader.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Leadership Information Available</h3>
              <p className="text-gray-500">Please contact the administrator</p>
            </div>
          )}
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-4xl font-bold mb-3 flex items-center justify-center flex-wrap" style={{ color: '#000000' }}>
              <span style={{ color: '#DC2626' }}>Achieve</span>
              <span style={{ color: '#FFDE21' }}>ments</span>
            </h2>
            <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: '#DC2626' }}></div>
          </div>
          
          {loadingAchievements ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Instructor Achievements */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300" style={{ borderTop: '4px solid #DC2626' }}>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4" style={{ border: '3px solid #DC2626' }}>
                    <FaMedal style={{ color: '#DC2626', fontSize: '1.5rem' }} />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: '#000000' }}>
                    <span style={{ color: '#000000' }}>Instructor</span>{' '}
                    <span style={{ color: '#000000' }}>Achievements</span>
                  </h3>
                </div>
                {instructorAchievements.length > 0 ? (
                  <ul className="space-y-4">
                    {instructorAchievements.map((achievement) => (
                      <li key={achievement._id} className="flex items-start group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ border: '2px solid #FFDE21' }}>
                          <FaMedal style={{ color: '#DC2626', fontSize: '0.875rem' }} />
                        </div>
                        <span className="leading-relaxed" style={{ color: '#374151' }}>{achievement.description}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center py-8 text-gray-500">No instructor achievements available</p>
                )}
              </div>

              {/* Students Achievement */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300" style={{ borderTop: '4px solid #DC2626' }}>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4" style={{ border: '3px solid #DC2626' }}>
                    <FaAward style={{ color: '#DC2626', fontSize: '1.5rem' }} />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: '#000000' }}>
                    <span style={{ color: '#000000' }}>Students</span>{' '}
                    <span style={{ color: '#000000' }}>Achievement</span>
                  </h3>
                </div>
                {studentAchievements.length > 0 ? (
                  <ul className="space-y-4">
                    {studentAchievements.map((achievement) => (
                      <li key={achievement._id} className="flex items-start group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ border: '2px solid #FFDE21' }}>
                          <FaAward style={{ color: '#DC2626', fontSize: '0.875rem' }} />
                        </div>
                        <span className="leading-relaxed" style={{ color: '#374151' }}>{achievement.description}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center py-8 text-gray-500">No student achievements available</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Locations & School Partnerships Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#FFF9E6] to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-4xl font-bold mb-3 flex items-center justify-center flex-wrap" style={{ color: '#000000' }}>
              <span style={{ color: '#DC2626' }}>Our</span>
              <span className="mx-2"></span>
              <span style={{ color: '#000000' }}>Locations</span>
              <span className="mx-2"></span>
              <span style={{ color: '#FFDE21' }}>&</span>
              <span className="mx-2"></span>
              <span style={{ color: '#DC2626' }}>School</span>
              <span className="mx-2"></span>
              <span style={{ color: '#FFDE21' }}>Partnerships</span>
            </h2>
            <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: '#DC2626' }}></div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p style={{ color: '#374151' }}>Loading locations...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Class Locations */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300" style={{ borderTop: '4px solid #DC2626' }}>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4" style={{ border: '3px solid #DC2626' }}>
                    <FaFlag style={{ color: '#DC2626', fontSize: '1.5rem' }} />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: '#000000' }}>
                    <span style={{ color: '#000000' }}>Class</span>{' '}
                    <span style={{ color: '#000000' }}>Locations</span>
                  </h3>
                </div>
                <ul className="space-y-4">
                  {locations.filter(loc => loc.type === 'location').length > 0 ? (
                    locations.filter(loc => loc.type === 'location').map((location) => (
                      <li key={location._id} className="flex items-start group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ border: '2px solid #FFDE21' }}>
                          <FaFlag style={{ color: '#DC2626', fontSize: '0.875rem' }} />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold leading-relaxed" style={{ color: '#000000' }}>{location.name}</span>
                          <p className="text-sm" style={{ color: '#374151' }}>{location.location}</p>
                          {location.timings?.days && location.timings?.time && (
                            <p className="text-xs mt-1" style={{ color: '#000000', fontWeight: '600' }}>
                              {location.timings.days} • {location.timings.time}
                            </p>
                          )}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-center py-4" style={{ color: '#374151' }}>No class locations available</li>
                  )}
                </ul>
              </div>

              {/* School Partnerships */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300" style={{ borderTop: '4px solid #DC2626' }}>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4" style={{ border: '3px solid #DC2626' }}>
                    <FaGraduationCap style={{ color: '#DC2626', fontSize: '1.5rem' }} />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: '#000000' }}>
                    <span style={{ color: '#000000' }}>School</span>{' '}
                    <span style={{ color: '#000000' }}>Tie-ups</span>
                  </h3>
                </div>
                <ul className="space-y-4">
                  {locations.filter(loc => loc.type === 'school').length > 0 ? (
                    locations.filter(loc => loc.type === 'school').map((location) => (
                      <li key={location._id} className="flex items-start group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ border: '2px solid #FFDE21' }}>
                          <FaGraduationCap style={{ color: '#DC2626', fontSize: '0.875rem' }} />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold leading-relaxed" style={{ color: '#000000' }}>{location.name}</span>
                          <p className="text-sm" style={{ color: '#374151' }}>{location.location}</p>
                          {location.timings?.days && location.timings?.time && (
                            <p className="text-xs mt-1" style={{ color: '#000000', fontWeight: '600' }}>
                              {location.timings.days} • {location.timings.time}
                            </p>
                          )}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-center py-4" style={{ color: '#374151' }}>No school partnerships available</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CWTAK Banner Section */}
      <section className="py-8 bg-white">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Title */}
    <div className="text-center mb-6">
      <h2 className="text-3xl font-bold" style={{ color: '#000000' }}>
        <span style={{ color: '#FFDE21' }}>Our</span>
        <span className="mx-2"></span>
        <span style={{ color: '#DC2626' }}>Motto</span>
      </h2>
      <div
        className="w-24 h-1 mx-auto mt-3 rounded-full"
        style={{ backgroundColor: '#DC2626' }}
      ></div>
    </div>

    {/* CWTAK Banner */}
    <div className="text-center py-6">
      <img
        src={cwtakBanner}
        alt="CWTAK Banner"
        className="mx-auto object-contain"
        style={{ maxHeight: "420px", marginTop: "-40px" }}
      />

        {/* Text Image */}
      <div className="mt-2">
        <img
          src={textImage}
          alt="Courage First, Power Second, Technique Third"
          className="mx-auto object-contain"
          style={{ maxHeight: "30px" }}
        />
      </div>

      {/* Slogan Text */}
      <h2
    className="
      mt-3
      uppercase
      font-bold
      tracking-[3px]
      text-sm sm:text-lg md:text-xl
      bg-gradient-to-r
      from-yellow-300
      via-[#FFF9E6]0
      to-yellow-300
      bg-clip-text
      text-transparent
      drop-shadow-[2px_2px_3px_rgba(0,0,0,0.8)]
    "
    style={{ fontFamily: "'Cinzel', serif" }}
  >
    Courage First, Power Second, Technique Third
  </h2>
</div>
  </div>
</section>

     
    </div>
  );
}

export default About;

// Add CSS animations and force blue to black
const style = document.createElement('style');
style.textContent = `
  /* FORCE ALL BLUE TO BLACK IN ABOUT PAGE */
  .about-page * {
    color: #000000 !important;
  }
  
  /* Preserve white text */
  .about-page .text-white,
  .about-page .text-white * {
    color: white !important;
  }
  
  /* Preserve red text */
  .about-page [style*="color: #DC2626"],
  .about-page [style*="color: #DC2626"] *,
  .about-page [style*="color:#DC2626"],
  .about-page [style*="color:#DC2626"] * {
    color: #DC2626 !important;
  }
  
  /* Preserve yellow text */
  .about-page [style*="color: #FFDE21"],
  .about-page [style*="color: #FFDE21"] *,
  .about-page [style*="color:#FFDE21"],
  .about-page [style*="color:#FFDE21"] *,
  .about-page [style*="color: #FFDE21"],
  .about-page [style*="color: #FFDE21"] *,
  .about-page [style*="color:#FFDE21"],
  .about-page [style*="color:#FFDE21"] * {
    color: #FFDE21 !important;
  }
  
  /* Preserve gray text */
  .about-page [style*="color: #374151"],
  .about-page [style*="color: #374151"] *,
  .about-page [style*="color:#374151"],
  .about-page [style*="color:#374151"] *,
  .about-page [style*="color: #4B5563"],
  .about-page [style*="color: #4B5563"] *,
  .about-page [style*="color:#4B5563"],
  .about-page [style*="color:#4B5563"] * {
    color: #374151 !important;
  }
  
  /* Force headings to black */
  .about-page h1,
  .about-page h2,
  .about-page h3,
  .about-page h4,
  .about-page h5,
  .about-page h6 {
    color: #000000 !important;
  }

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



