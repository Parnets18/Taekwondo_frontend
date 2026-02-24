import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import image1 from '../../assets/image1.jpg';
import { 
  FaFistRaised, 
  FaTrophy, 
  FaBullseye, 
  FaBolt, 
  FaUsers, 
  FaCalendarAlt, 
  FaMedal, 
  FaGraduationCap,
  FaStar,
  FaPhone,
  FaEnvelope,
  FaRocket,
  FaDumbbell,
  FaUserTie,
  FaPray,
  FaHandPaper
} from 'react-icons/fa';

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [heroSlides, setHeroSlides] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  const API_BASE_URL = 'https://taekwondo-backend-j8w4.onrender.com/api';

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoadingBanners(true);
        const response = await fetch(`${API_BASE_URL}/banners?isActive=true`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch banners');
        }

        const data = await response.json();
        
        if (data.status === 'success' && data.data.banners.length > 0) {
          // Transform API banners to match component format
          const transformedBanners = data.data.banners.map(banner => ({
            title: banner.title,
            subtitle: banner.subtitle,
            description: banner.description,
            image: `${API_BASE_URL.replace('/api', '')}/${banner.image}`,
            buttonText: banner.buttonText,
            buttonLink: banner.buttonLink,
            secondaryButtonText: banner.secondaryButtonText,
            secondaryButtonLink: banner.secondaryButtonLink
          }));
          setHeroSlides(transformedBanners);
        } else {
          // No banners available
          setHeroSlides([]);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
        // No banners on error
        setHeroSlides([]);
      } finally {
        setLoadingBanners(false);
      }
    };

    fetchBanners();
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <FaUserTie className="text-4xl mb-4 mx-auto transform group-hover:scale-110 transition-transform duration-300" />,
      title: 'Discipline',
      description: 'Develop self-control, focus, and commitment through structured training that builds mental strength and personal responsibility',
      color: 'from-yellow-400 to-yellow-600',
      delay: '0ms'
    },
    {
      icon: <FaFistRaised className="text-4xl mb-4 mx-auto transform group-hover:scale-110 transition-transform duration-300" />,
      title: 'Self-Defence',
      description: 'Master practical self-defense techniques and gain confidence to protect yourself in real-world situations',
      color: 'from-red-500 to-red-700',
      delay: '100ms'
    },
    {
      icon: <FaBullseye className="text-4xl mb-4 mx-auto transform group-hover:scale-110 transition-transform duration-300" />,
      title: 'Focus',
      description: 'Enhance concentration and mental clarity through mindful practice, improving performance in all areas of life',
      color: 'from-yellow-400 to-yellow-600',
      delay: '200ms'
    },
    {
      icon: <FaPray className="text-4xl mb-4 mx-auto transform group-hover:scale-110 transition-transform duration-300" />,
      title: 'Self-Respect',
      description: 'Build confidence and self-worth through achievement and personal growth in a supportive martial arts environment',
      color: 'from-red-500 to-red-700',
      delay: '300ms'
    },
    {
      icon: <FaUsers className="text-4xl mb-4 mx-auto transform group-hover:scale-110 transition-transform duration-300" />,
      title: 'Leadership',
      description: 'Cultivate leadership qualities and learn to inspire others through example, teamwork, and mentorship',
      color: 'from-yellow-400 to-yellow-600',
      delay: '400ms'
    },
    {
      icon: <FaHandPaper className="text-4xl mb-4 mx-auto transform group-hover:scale-110 transition-transform duration-300" />,
      title: 'Anti-Bullying',
      description: 'Develop the confidence and skills to stand against bullying while promoting respect and kindness',
      color: 'from-red-500 to-red-700',
      delay: '500ms'
    }
  ];

  const programs = [
    {
      title: 'Little Tigers (4-7 years)',
      description: 'Traditional martial arts foundation with Korean terminology, basic patterns, and character development through disciplined training',
      duration: '45 minutes',
      schedule: 'Mon, Wed, Fri - 4:00 PM',
      icon: '🐅',
      color: 'from-yellow-400 to-red-500',
      features: ['Korean Commands', 'Basic Patterns (Tul)', 'Respect & Discipline', 'White to Yellow Belt']
    },
    {
      title: 'Young Warriors (8-12 years)',
      description: 'Structured ITF curriculum with traditional patterns, sparring fundamentals, and Korean martial arts philosophy',
      duration: '60 minutes',
      schedule: 'Tue, Thu, Sat - 5:00 PM',
      icon: '🦅',
      color: 'from-red-500 to-black',
      features: ['ITF Patterns (Tul)', 'Sparring Basics', 'Breaking Techniques', 'Yellow to Green Belt']
    },
    {
      title: 'Adult Mastery (13+ years)',
      description: 'Advanced ITF Taekwon-Do with competition training, black belt preparation, and traditional Korean martial arts mastery',
      duration: '90 minutes',
      schedule: 'Mon-Sat - 6:30 PM',
      icon: '🥷',
      color: 'from-black to-yellow-400',
      features: ['Advanced Patterns', 'Competition Sparring', 'Black Belt Training', 'Instructor Development']
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Parent",
      text: "My daughter has gained so much confidence since joining. The instructors are amazing!",
      rating: 5,
      icon: <FaUsers className="text-3xl text-yellow-600" />
    },
    {
      name: "Rajesh Kumar",
      role: "Adult Student",
      text: "Best decision I made for my fitness and mental discipline. Highly recommended!",
      rating: 5,
      icon: <FaGraduationCap className="text-3xl text-red-600" />
    },
    {
      name: "Anita Reddy",
      role: "Teen Student",
      text: "Won my first state championship thanks to the excellent training here!",
      rating: 5,
      icon: <FaTrophy className="text-3xl text-yellow-600" />
    }
  ];

  // Auto-slide functionality - only if there are slides
  useEffect(() => {
    if (heroSlides.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [heroSlides.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Hero Section - Only show if banners are available */}
      {loadingBanners ? (
        <section className="hero-background mobile-hero-fix relative min-h-screen flex items-center bg-gradient-to-br from-yellow-50 via-white to-red-50">
          <div className="relative z-10 max-w-7xl mx-auto px-4 w-full h-full">
            <div className="flex justify-start items-center min-h-screen pt-16">
              <div className="text-gray-800 text-center w-full">
                <div className="animate-pulse">
                  <div className="h-12 bg-gray-300 bg-opacity-40 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-300 bg-opacity-40 rounded w-1/2 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-300 bg-opacity-40 rounded w-2/3 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : heroSlides.length > 0 ? (
        <section 
          className="hero-background mobile-hero-fix relative min-h-screen flex items-center bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4)), url(${heroSlides[currentSlide]?.image})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: window.innerWidth <= 768 ? 'scroll' : 'scroll'
          }}
        >
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full">
            <div className="flex justify-start items-center min-h-screen pt-16 sm:pt-20">
              <div className="text-white text-left max-w-lg hero-content">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight" style={{ color: 'white' }}>
                  {heroSlides[currentSlide].title.split(' ').map((word, index) => (
                    <span
                      key={index}
                      className="inline-block animate-fade-in-up mr-2"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      {word}
                    </span>
                  ))}
                </h1>
                
                <p className="text-base sm:text-lg mb-3 sm:mb-4 font-bold tracking-wide" style={{ color: 'white' }}>
                  {heroSlides[currentSlide].subtitle}
                </p>
                
                <p className="text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed" style={{ color: 'white' }}>
                  {heroSlides[currentSlide].description}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 justify-start">
                  <Link
                    to="/admission"
                    className="px-4 sm:px-6 py-3 sm:py-4 rounded-full text-sm sm:text-base font-bold hover:shadow-2xl transition-all duration-300 text-center"
                    style={{
                      backgroundColor: 'white',
                      color: '#006CB5',
                      minHeight: '48px'
                    }}
                  >
                    <span className="flex items-center justify-center">
                      <FaRocket className="mr-2" />
                      Begin Your Journey
                      <svg className="ml-2 w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </Link>
                  <Link
                    to="/courses"
                    className="px-4 sm:px-6 py-3 sm:py-4 rounded-full text-sm sm:text-base font-bold hover:shadow-2xl transition-all duration-300 text-center"
                    style={{
                      backgroundColor: 'white',
                      color: '#006CB5',
                      border: '2px solid white',
                      minHeight: '48px'
                    }}
                  >
                    <span className="flex items-center justify-center">
                      <FaDumbbell className="mr-2" />
                      {heroSlides[currentSlide]?.secondaryButtonText || "Training Programs"}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Slide indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`rounded-full transition-all duration-300 touch-manipulation ${
                  index === currentSlide ? 'bg-white opacity-100' : 'bg-white opacity-40'
                }`}
                style={{
                  width: '12px',
                  height: '12px',
                  minHeight: '20px',
                  minWidth: '20px',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  borderRadius: '50%'
                }}
              />
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 right-8 animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>
      ) : (
        // Show only "No Banner Available" with gray background
        <section className="hero-background mobile-hero-fix relative min-h-[60vh] flex items-center justify-center bg-gray-300">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-700">
              No Banner Available
            </h1>
          </div>
        </section>
      )}

      {/* About Preview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6" style={{ color: '#006CB5' }}>
                About Combat Warrior Dojang
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Taekwon-Do is a South Korean form of martial arts. It is a combat sport characterised by punching and kicking techniques and was developed during 1940's and 1950's by Korean Martial artists. The main International Taekwon-Do Federation (ITF), founded by Choi Hong- hi in 1966 and Kukkiwon and World Taekwon-Do Federation (WTF).
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Taekwon-Do made it's Paralympic debut at Tokyo 2020 and is a sport governed by World Taekwon-Do (WT). The goal of this martial art is to give a sense of self-esteem, knowledge of self-defence heightened mental and physical well-being.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center px-8 py-4 rounded-full text-lg font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                style={{ backgroundColor: '#006CB5' }}
              >
                Read More About Us
                <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl" style={{ border: '4px solid #006CB5' }}>
                <img 
                  src={image1} 
                  alt="Combat Warrior Dojang Training" 
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-12 bg-gradient-to-br from-gray-50 via-yellow-50 to-red-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gray-50 opacity-50"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            id="features-title"
            data-animate
            className={`text-center mb-10 transition-all duration-1000 ${
              isVisible['features-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl font-bold mb-3" style={{ color: '#006CB5' }}>
              Why Choose Combat Warrior Dojang?
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Building character and life skills through traditional martial arts training
            </p>
            <div className="w-24 h-1 mx-auto mt-4 rounded-full" style={{ backgroundColor: '#006CB5' }}></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4"
                style={{ 
                  animationDelay: feature.delay,
                  borderTop: '4px solid #006CB5'
                }}
              >
                <div className="transform transition-transform duration-500">
                  <div style={{ color: '#006CB5' }}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: '#006CB5' }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm">{feature.description}</p>
                  
                  <div className="mt-4 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full shadow-lg" style={{ backgroundColor: '#006CB5' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Training Benefits Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3" style={{ color: '#006CB5' }}>
              Benefits of Training with Us
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Discover how Taekwon-Do training transforms lives through physical fitness, mental discipline, and character development
            </p>
            <div className="w-32 h-2 mx-auto mt-4 rounded-full" style={{ backgroundColor: '#006CB5' }}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300" style={{ borderTop: '4px solid #006CB5' }}>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4" style={{ border: '3px solid #006CB5' }}>
                <FaDumbbell style={{ color: '#006CB5', fontSize: '1.5rem' }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#006CB5' }}>Physical Fitness</h3>
              <p className="text-gray-600 leading-relaxed">
                Improve strength, flexibility, cardiovascular health, and overall physical conditioning through structured training programs.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300" style={{ borderTop: '4px solid #006CB5' }}>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4" style={{ border: '3px solid #006CB5' }}>
                <FaBullseye style={{ color: '#006CB5', fontSize: '1.5rem' }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#006CB5' }}>Mental Focus</h3>
              <p className="text-gray-600 leading-relaxed">
                Develop concentration, mental clarity, and the ability to stay calm under pressure through mindful practice.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300" style={{ borderTop: '4px solid #006CB5' }}>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4" style={{ border: '3px solid #006CB5' }}>
                <FaUserTie style={{ color: '#006CB5', fontSize: '1.5rem' }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#006CB5' }}>Character Building</h3>
              <p className="text-gray-600 leading-relaxed">
                Build confidence, respect, integrity, and perseverance through the traditional values of martial arts.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300" style={{ borderTop: '4px solid #006CB5' }}>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4" style={{ border: '3px solid #006CB5' }}>
                <FaFistRaised style={{ color: '#006CB5', fontSize: '1.5rem' }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#006CB5' }}>Self-Defense Skills</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn practical self-defense techniques and gain the confidence to protect yourself in real-world situations.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300" style={{ borderTop: '4px solid #006CB5' }}>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4" style={{ border: '3px solid #006CB5' }}>
                <FaUsers style={{ color: '#006CB5', fontSize: '1.5rem' }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#006CB5' }}>Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Join a supportive community of like-minded individuals who share your passion for martial arts excellence.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300" style={{ borderTop: '4px solid #006CB5' }}>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4" style={{ border: '3px solid #006CB5' }}>
                <FaMedal style={{ color: '#006CB5', fontSize: '1.5rem' }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#006CB5' }}>Achievement</h3>
              <p className="text-gray-600 leading-relaxed">
                Progress through belt ranks, compete in tournaments, and achieve personal goals in your martial arts journey.
              </p>
            </div>
          </div>
        </div>
      </section>
 {/* Recent Promotions & Members' Birthdays Section */}
      <section className="py-12 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Promotions */}
            <RecentPromotions />
            
            {/* Members' Birthdays */}
            <MembersBirthdaysCard />
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3" style={{ color: '#006CB5' }}>
              What Our Martial Artists Say
            </h2>
            <p className="text-lg text-gray-700">Testimonials from our Taekwon-Do family</p>
            <div className="w-32 h-2 mx-auto mt-4 rounded-full" style={{ backgroundColor: '#006CB5' }}></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-6 transform hover:-translate-y-4 transition-all duration-500"
                   style={{ borderTop: '4px solid #006CB5' }}>
                <div className="flex items-center mb-4">
                  <div className="mr-3 transition-all duration-300">
                    {testimonial.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-base" style={{ color: '#006CB5' }}>{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-lg" style={{ color: '#006CB5' }} />
                  ))}
                </div>
                
                <p className="text-gray-700 italic leading-relaxed text-sm">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3" style={{ color: '#006CB5' }}>Our Dojang Excellence</h2>
            <p className="text-lg text-gray-700">Proven results in traditional martial arts training</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '500+', label: 'Students Trained', icon: <FaUsers className="text-2xl" /> },
              { number: '15+', label: 'Years Excellence', icon: <FaCalendarAlt className="text-2xl" /> },
              { number: '50+', label: 'Champions Forged', icon: <FaMedal className="text-2xl" /> },
              { number: '10+', label: 'Black Belt Masters', icon: <FaGraduationCap className="text-2xl" /> }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-all duration-500 shadow-lg"
                     style={{ border: '3px solid #006CB5', color: '#006CB5' }}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-2 transition-all duration-500" style={{ color: '#006CB5' }}>
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-12 bg-white relative overflow-hidden">
        {/* Background animation */}
        <div className="absolute inset-0">
          {/* Martial Arts background */}
          <div className="absolute inset-0 opacity-10">
            <div className="text-9xl font-bold text-yellow-400 absolute top-10 left-10 rotate-12">TAEKWON-DO</div>
            <div className="text-6xl font-bold text-red-400 absolute bottom-10 right-10 -rotate-12">ITF</div>
          </div>
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-yellow-400 rounded-full opacity-20 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#006CB5' }}>
            Ready to Begin Your Taekwon-Do Journey?
          </h2>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Join hundreds of martial artists who have discovered strength, discipline, and honor through authentic Korean Taekwon-Do. 
            Your path to black belt mastery starts with a single step into our dojang.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center">
            <Link
              to="/admission"
              className="text-white px-8 py-4 rounded-full text-base font-bold hover:shadow-2xl transition-all duration-300"
              style={{
                backgroundColor: '#006CB5',
                minHeight: '52px'
              }}
            >
              <span className="flex items-center justify-center">
                <FaFistRaised className="mr-2" />
                Start Training Today
                <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </Link>
            <Link
              to="/contact"
              className="bg-white px-8 py-4 rounded-full text-base font-bold hover:shadow-2xl transition-all duration-300"
              style={{
                border: '2px solid #006CB5',
                color: '#006CB5',
                minHeight: '52px'
              }}
            >
              <span className="flex items-center justify-center">
                <FaPhone className="mr-2" />
                Contact Us
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Recent Promotions Component
function RecentPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        console.log('🏆 Fetching promotions from API...');
        const response = await fetch('https://taekwondo-backend-j8w4.onrender.com/api/belts/promotions/public?limit=10');
        console.log('📡 Response status:', response.status);
        const data = await response.json();
        console.log('📦 Promotions data received:', data);
        
        if (data.status === 'success') {
          console.log('✅ Promotions found:', data.data.promotions?.length || 0);
          // Sort by date descending and take last 10
          const sortedPromotions = (data.data.promotions || [])
            .sort((a, b) => new Date(b.promotionDate) - new Date(a.promotionDate))
            .slice(0, 10);
          setPromotions(sortedPromotions);
        } else {
          console.log('⚠️ No promotions or error:', data.message);
        }
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching promotions:', error);
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const getBeltColor = (beltName) => {
    if (!beltName) return '#6B7280';
    
    const beltLower = beltName.toLowerCase();
    
    // Handle striped belts with gradients - check specific combinations
    if (beltLower.includes('white') && beltLower.includes('yellow') && beltLower.includes('stripe')) {
      return 'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 40%, #FCD34D 40%, #FCD34D 60%, #FFFFFF 60%, #FFFFFF 100%)';
    }
    if (beltLower.includes('yellow') && beltLower.includes('green') && beltLower.includes('stripe')) {
      return 'linear-gradient(to bottom, #FCD34D 0%, #FCD34D 40%, #10B981 40%, #10B981 60%, #FCD34D 60%, #FCD34D 100%)';
    }
    if (beltLower.includes('green') && beltLower.includes('blue') && beltLower.includes('stripe')) {
      return 'linear-gradient(to bottom, #10B981 0%, #10B981 40%, #3B82F6 40%, #3B82F6 60%, #10B981 60%, #10B981 100%)';
    }
    if (beltLower.includes('blue') && beltLower.includes('red') && beltLower.includes('stripe')) {
      return 'linear-gradient(to bottom, #3B82F6 0%, #3B82F6 40%, #EF4444 40%, #EF4444 60%, #3B82F6 60%, #3B82F6 100%)';
    }
    if (beltLower.includes('red') && beltLower.includes('black') && beltLower.includes('stripe')) {
      return 'linear-gradient(to bottom, #EF4444 0%, #EF4444 40%, #000000 40%, #000000 60%, #EF4444 60%, #EF4444 100%)';
    }
    
    // Solid color belts
    const beltColors = {
      'white': '#FFFFFF',
      'yellow': '#FCD34D',
      'orange': '#FB923C',
      'green': '#10B981',
      'blue': '#3B82F6',
      'red': '#EF4444',
      'black': '#000000',
      '1st dan': '#000000',
      '2nd dan': '#000000',
      '3rd dan': '#000000'
    };
    
    // Check for partial matches
    for (const [key, color] of Object.entries(beltColors)) {
      if (beltLower.includes(key)) {
        return color;
      }
    }
    
    return '#6B7280';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}${getDaySuffix(day)} ${month} ${year}`;
  };

  const getDaySuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const groupByDate = () => {
    const grouped = {};
    promotions.forEach(promo => {
      const date = formatDate(promo.promotionDate);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(promo);
    });
    return grouped;
  };

  const groupedPromotions = groupByDate();

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="p-4 text-center home-section-header" style={{ backgroundColor: '#006CB5' }}>
        <h3 className="text-2xl font-bold home-section-title" style={{ color: '#FFFFFF' }}>Recent Promotions</h3>
      </div>
      <div className="p-4 max-h-96 overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-600">Loading promotions...</p>
        ) : promotions.length === 0 ? (
          <p className="text-center text-gray-600">No recent promotions</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedPromotions).map(([date, promos]) => (
              <div key={date}>
                <h4 className="font-bold text-gray-700 mb-2">{date}</h4>
                <div className="space-y-2">
                  {promos.map((promo) => {
                    const beltColor = getBeltColor(promo.toBelt);
                    const isGradient = beltColor.startsWith('linear-gradient');
                    const textColor = !isGradient && (beltColor === '#FFFFFF' || beltColor === '#FCD34D') ? '#000' : '#FFF';
                    
                    return (
                      <div key={promo._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <div 
                          className="w-16 h-8 rounded flex items-center justify-center text-xs font-bold border-2"
                          style={{ 
                            ...(isGradient ? { backgroundImage: beltColor } : { backgroundColor: beltColor }),
                            borderColor: '#000',
                            color: textColor
                          }}
                        >
                          {promo.toBelt?.split(' ')[0] || 'Belt'}
                        </div>
                        <p className="text-gray-800 font-medium">{promo.studentName}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Members' Birthdays Card Component
function MembersBirthdaysCard() {
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        console.log('🎂 Fetching birthdays from API...');
        const response = await fetch('https://taekwondo-backend-j8w4.onrender.com/api/students/birthdays');
        console.log('📡 Response status:', response.status);
        const data = await response.json();
        console.log('📦 Birthday data received:', data);
        
        if (data.status === 'success') {
          console.log('✅ Birthdays found:', data.data.length);
          setBirthdays(data.data);
        } else {
          console.log('⚠️ No birthdays or error:', data.message);
        }
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching birthdays:', error);
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, []);

  const getBeltColor = (beltLevel) => {
    if (!beltLevel) return '#6B7280';
    
    // Convert to lowercase for case-insensitive matching
    const beltLower = beltLevel.toLowerCase();
    
    // Check for striped belts - return gradient
    if (beltLower.includes('stripe')) {
      if (beltLower.includes('white') && beltLower.includes('yellow')) {
        return 'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 40%, #FCD34D 40%, #FCD34D 60%, #FFFFFF 60%, #FFFFFF 100%)';
      }
      if (beltLower.includes('yellow') && beltLower.includes('green')) {
        return 'linear-gradient(to bottom, #FCD34D 0%, #FCD34D 40%, #10B981 40%, #10B981 60%, #FCD34D 60%, #FCD34D 100%)';
      }
      if (beltLower.includes('green') && beltLower.includes('blue')) {
        return 'linear-gradient(to bottom, #10B981 0%, #10B981 40%, #3B82F6 40%, #3B82F6 60%, #10B981 60%, #10B981 100%)';
      }
      if (beltLower.includes('blue') && beltLower.includes('red')) {
        return 'linear-gradient(to bottom, #3B82F6 0%, #3B82F6 40%, #EF4444 40%, #EF4444 60%, #3B82F6 60%, #3B82F6 100%)';
      }
      if (beltLower.includes('red') && beltLower.includes('black')) {
        return 'linear-gradient(to bottom, #EF4444 0%, #EF4444 40%, #000000 40%, #000000 60%, #EF4444 60%, #EF4444 100%)';
      }
    }
    
    const beltColors = {
      'white': '#FFFFFF',
      'yellow': '#FCD34D',
      'green': '#10B981',
      'blue': '#3B82F6',
      'red': '#EF4444',
      'black': '#000000',
      'black-1st': '#000000',
      'black-2nd': '#000000',
      'black-3rd': '#000000'
    };
    return beltColors[beltLower] || '#6B7280';
  };

  const groupByDate = () => {
    const today = [];
    const tomorrow = [];
    const thisWeek = [];
    const upcoming = [];

    birthdays.forEach(student => {
      if (student.daysUntil === 0) {
        today.push(student);
      } else if (student.daysUntil === 1) {
        tomorrow.push(student);
      } else if (student.daysUntil <= 7) {
        thisWeek.push(student);
      } else {
        upcoming.push(student);
      }
    });

    return { today, tomorrow, thisWeek, upcoming };
  };

  const { today, tomorrow, thisWeek, upcoming } = groupByDate();

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="p-4 text-center home-section-header" style={{ backgroundColor: '#006CB5' }}>
        <h3 className="text-2xl font-bold home-section-title" style={{ color: '#FFFFFF' }}>Members' Birthdays</h3>
      </div>
      <div className="p-4 max-h-96 overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-600">Loading birthdays...</p>
        ) : birthdays.length === 0 ? (
          <p className="text-center text-gray-600">No upcoming birthdays</p>
        ) : (
          <div className="space-y-4">
            {/* Today */}
            {today.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-700 mb-2">Today</h4>
                <div className="space-y-2">
                  {today.map((student) => {
                    const beltColor = getBeltColor(student.currentBelt);
                    const isGradient = beltColor.startsWith('linear-gradient');
                    const beltLower = (student.currentBelt || '').toLowerCase();
                    const textColor = !isGradient && (beltLower.includes('white') || beltLower.includes('yellow')) ? '#000' : '#FFF';
                    
                    return (
                      <div key={student._id} className="flex items-center gap-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                        <div 
                          className="w-16 h-8 rounded flex items-center justify-center text-xs font-bold border-2"
                          style={{ 
                            ...(isGradient ? { backgroundImage: beltColor } : { backgroundColor: beltColor }),
                            borderColor: '#000',
                            color: textColor
                          }}
                        >
                          {student.currentBelt?.split(' ')[0] || 'Belt'}
                        </div>
                        <p className="text-gray-800 font-medium flex-1">{student.fullName}</p>
                        <span className="text-yellow-600">🎂</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tomorrow */}
            {tomorrow.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-700 mb-2">Tomorrow</h4>
                <div className="space-y-2">
                  {tomorrow.map((student) => {
                    const beltColor = getBeltColor(student.currentBelt);
                    const isGradient = beltColor.startsWith('linear-gradient');
                    const beltLower = (student.currentBelt || '').toLowerCase();
                    const textColor = !isGradient && (beltLower.includes('white') || beltLower.includes('yellow')) ? '#000' : '#FFF';
                    
                    return (
                      <div key={student._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <div 
                          className="w-16 h-8 rounded flex items-center justify-center text-xs font-bold border-2"
                          style={{ 
                            ...(isGradient ? { backgroundImage: beltColor } : { backgroundColor: beltColor }),
                            borderColor: '#000',
                            color: textColor
                          }}
                        >
                          {student.currentBelt?.split(' ')[0] || 'Belt'}
                        </div>
                        <p className="text-gray-800 font-medium">{student.fullName}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* This Week */}
            {thisWeek.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-700 mb-2">This Week</h4>
                <div className="space-y-2">
                  {thisWeek.map((student) => {
                    const beltColor = getBeltColor(student.currentBelt);
                    const isGradient = beltColor.startsWith('linear-gradient');
                    const beltLower = (student.currentBelt || '').toLowerCase();
                    const textColor = !isGradient && (beltLower.includes('white') || beltLower.includes('yellow')) ? '#000' : '#FFF';
                    
                    return (
                      <div key={student._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <div 
                          className="w-16 h-8 rounded flex items-center justify-center text-xs font-bold border-2"
                          style={{ 
                            ...(isGradient ? { backgroundImage: beltColor } : { backgroundColor: beltColor }),
                            borderColor: '#000',
                            color: textColor
                          }}
                        >
                          {student.currentBelt?.split(' ')[0] || 'Belt'}
                        </div>
                        <p className="text-gray-800 font-medium flex-1">{student.fullName}</p>
                        <span className="text-gray-500 text-xs">In {student.daysUntil}d</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upcoming (Next Month) */}
            {upcoming.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-700 mb-2">Next Month</h4>
                <div className="space-y-2">
                  {upcoming.map((student) => {
                    const beltColor = getBeltColor(student.currentBelt);
                    const isGradient = beltColor.startsWith('linear-gradient');
                    const beltLower = (student.currentBelt || '').toLowerCase();
                    const textColor = !isGradient && (beltLower.includes('white') || beltLower.includes('yellow')) ? '#000' : '#FFF';
                    
                    return (
                      <div key={student._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <div 
                          className="w-16 h-8 rounded flex items-center justify-center text-xs font-bold border-2"
                          style={{ 
                            ...(isGradient ? { backgroundImage: beltColor } : { backgroundColor: beltColor }),
                            borderColor: '#000',
                            color: textColor
                          }}
                        >
                          {student.currentBelt?.split(' ')[0] || 'Belt'}
                        </div>
                        <p className="text-gray-800 font-medium flex-1">{student.fullName}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;