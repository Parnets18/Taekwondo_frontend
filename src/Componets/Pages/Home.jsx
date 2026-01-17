import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import image1 from '../../assets/image1.jpg';
import image3 from '../../assets/image3.jpg';
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
  FaDumbbell
} from 'react-icons/fa';

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState({});

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

  const heroSlides = [
    {
      title: "Master the Ancient Art of Taekwon-Do",
      subtitle: "Discipline • Honor • Excellence • Tradition",
      description: "Join Karnataka's premier ITF Taekwon-Do Dojang with over 15 years of authentic martial arts mastery. Train under certified masters in the true spirit of Korean martial arts.",
      image: "/combat-warrior-logo.png"
    },
    {
      title: "Forge Champions Through Discipline",
      subtitle: "Traditional Training • Modern Champions • Timeless Values",
      description: "Our certified black belt masters have forged over 50 state and national champions. Your journey from white belt to mastery begins here.",
      image: "/combat-warrior-logo.png"
    },
    {
      title: "ITF Taekwon-Do Excellence",
      subtitle: "Authentic Techniques • Korean Heritage • Global Standards",
      description: "Experience true International Taekwon-Do Federation training with traditional Korean values and cutting-edge martial arts methodology.",
      image: "/combat-warrior-logo.png"
    }
  ];

  const features = [
    {
      icon: <FaFistRaised className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300" />,
      title: 'Authentic ITF Taekwon-Do',
      description: 'Traditional patterns and techniques under certified Korean masters',
      color: 'from-yellow-400 to-yellow-600',
      delay: '0ms'
    },
    {
      icon: <FaTrophy className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300" />,
      title: 'Championship Training',
      description: 'Proven track record with 50+ state and national champions',
      color: 'from-red-500 to-red-700',
      delay: '200ms'
    },
    {
      icon: <FaBullseye className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300" />,
      title: 'Character Development',
      description: 'Build discipline, respect, and mental strength',
      color: 'from-yellow-400 to-yellow-600',
      delay: '400ms'
    },
    {
      icon: <FaBolt className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300" />,
      title: 'Self-Defense Skills',
      description: 'Practical techniques for real-world situations',
      color: 'from-red-500 to-red-700',
      delay: '600ms'
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

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Enhanced Hero Section with Slider */}
      <section 
        className="hero-background mobile-hero-fix relative min-h-screen flex items-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4)), url(${image3})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: window.innerWidth <= 768 ? 'scroll' : 'scroll'
        }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full">
          <div className="flex justify-start items-center min-h-screen pt-16 sm:pt-20">
            <div className="text-white text-left max-w-lg hero-content">
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
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
              
              <p className="text-base sm:text-lg mb-3 sm:mb-4 font-bold text-yellow-300 tracking-wide">
                {heroSlides[currentSlide].subtitle}
              </p>
              
              <p className="text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed text-gray-100">
                {heroSlides[currentSlide].description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 justify-start">
                <Link
                  to="/admission"
                  className="group bg-yellow-400 text-black px-4 sm:px-6 py-3 sm:py-4 rounded-full text-sm sm:text-base font-bold hover:bg-yellow-300 hover:shadow-2xl transition-all duration-300 text-center border-2 border-yellow-400 touch-manipulation cursor-pointer relative z-10 active:scale-95 active:bg-yellow-500"
                  style={{
                    minHeight: '48px',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
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
                  className="border-2 border-red-500 text-red-500 bg-black bg-opacity-50 px-4 sm:px-6 py-3 sm:py-4 rounded-full text-sm sm:text-base font-bold hover:bg-red-500 hover:text-white transition-all duration-300 text-center backdrop-blur-sm touch-manipulation cursor-pointer relative z-10 active:scale-95 active:bg-red-600 active:text-white"
                  style={{
                    minHeight: '48px',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  <span className="flex items-center justify-center">
                    <FaDumbbell className="mr-2" />
                    Training Programs
                  </span>
                </Link>
              </div>

              {/* Achievement Stats */}
              {/* <div className="grid grid-cols-3 gap-6 text-center max-w-2xl mx-auto">
                <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-4 border border-yellow-400">
                  <div className="text-2xl font-bold text-yellow-400">500+</div>
                  <div className="text-sm text-white">Students Trained</div>
                </div>
                <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-4 border border-red-500">
                  <div className="text-2xl font-bold text-red-500">15+</div>
                  <div className="text-sm text-white">Years Excellence</div>
                </div>
                <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-4 border border-yellow-400">
                  <div className="text-2xl font-bold text-yellow-400">50+</div>
                  <div className="text-sm text-white">Champions</div>
                </div>
              </div> */}
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

      {/* About Preview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-black mb-6">
                About <span className="text-red-600">Combat Warrior</span> <span className="text-yellow-600">Dojang</span>
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Established in 2010, Combat Warrior Taekwon-Do Association of Karnataka is dedicated to 
                preserving and teaching authentic International Taekwon-Do Federation (ITF) training. 
                We follow the original teachings of General Choi Hong Hi, the founder of Taekwon-Do.
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Our certified masters have trained over 500 students and produced 50+ state and national 
                champions. We emphasize traditional values, discipline, and character development alongside 
                physical fitness and martial arts excellence.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-red-500 text-black px-8 py-4 rounded-full text-lg font-bold hover:from-yellow-300 hover:to-red-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Read More About Us
                <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            
            <div className="relative group">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-gradient-to-r from-yellow-500 to-red-500 transform transition-all duration-500 hover:scale-105 hover:rotate-1">
                <div className="relative overflow-hidden">
                  <img 
                    src={image1} 
                    alt="Combat Warrior Dojang Training" 
                    className="w-full h-96 object-cover transition-all duration-700 group-hover:scale-110 filter group-hover:brightness-110 group-hover:contrast-110"
                  />
                  
                  {/* Multiple gradient overlays for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-red-500/10"></div>
                </div>
                
                {/* Enhanced stats overlay with animation */}
                

              
              </div>

              {/* Floating elements around the image */}
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full opacity-60 animate-bounce" style={{animationDelay: '0s'}}></div>
              <div className="absolute -top-4 right-10 w-4 h-4 bg-red-500 rounded-full opacity-60 animate-bounce" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-10 -right-2 w-5 h-5 bg-yellow-500 rounded-full opacity-60 animate-bounce" style={{animationDelay: '2s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-12 bg-gradient-to-br from-gray-50 via-yellow-50 to-red-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 via-white to-red-100 opacity-50"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            id="features-title"
            data-animate
            className={`text-center mb-10 transition-all duration-1000 ${
              isVisible['features-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl font-bold text-black mb-3">
              Why Choose <span className="text-red-600">Combat Warrior</span> <span className="text-yellow-600">Dojang?</span>
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Authentic Korean martial arts with traditional values and modern excellence
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 via-red-500 to-black mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`group text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-2 border-t-4 ${
                  index % 2 === 0 ? 'border-yellow-500 hover:border-yellow-600' : 'border-red-500 hover:border-red-600'
                } perspective-1000`}
                style={{ 
                  animationDelay: feature.delay,
                  background: `linear-gradient(135deg, white 0%, ${index % 2 === 0 ? '#fefce8' : '#fef2f2'} 100%)`,
                  transform: 'rotateX(5deg) rotateY(5deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="transform group-hover:rotateY-12 transition-transform duration-500">
                  <div className={`text-${index % 2 === 0 ? 'yellow' : 'red'}-600 group-hover:text-${index % 2 === 0 ? 'yellow' : 'red'}-700`}>
                    {feature.icon}
                  </div>
                  <h3 className={`text-lg font-bold mb-3 transition-colors ${
                    index % 2 === 0 ? 'text-black group-hover:text-yellow-600' : 'text-black group-hover:text-red-600'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm">{feature.description}</p>
                  
                  {/* 3D Hover effect decoration */}
                  <div className={`mt-4 h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full shadow-lg`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Programs Section */}
      <section className="py-12 bg-white text-black relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-yellow-600/10 to-red-600/10"></div>
          {/* Martial Arts pattern background */}
          <div className="absolute inset-0 opacity-5">
            <div className="text-9xl font-bold text-yellow-400 absolute top-20 left-20 rotate-12">TKD</div>
            <div className="text-9xl font-bold text-red-400 absolute bottom-20 right-20 -rotate-12">ITF</div>
            <div className="text-6xl font-bold text-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">MARTIAL ARTS</div>
          </div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-black">
              Traditional <span className="text-red-600">Training</span> <span className="text-yellow-600">Programs</span>
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Authentic ITF Taekwon-Do curriculum designed for every age and skill level, from white belt to black belt mastery
            </p>
            <div className="w-32 h-2 bg-gradient-to-r from-yellow-400 via-red-500 to-black mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div 
                key={index} 
                className="group relative bg-white backdrop-blur-sm rounded-2xl p-6 hover:bg-gray-50 transition-all duration-500 transform hover:-translate-y-4 border-2 border-gray-200 hover:border-yellow-400 shadow-lg"
              >
                {/* Program icon with gradient background */}
                <div className={`absolute -top-4 left-6 w-12 h-12 bg-gradient-to-r ${program.color} rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-white`}>
                  {program.icon}
                </div>
                
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-600 transition-colors text-black">
                    {program.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed text-sm">{program.description}</p>
                  
                  {/* Program details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="text-yellow-600 font-semibold w-20 flex items-center">
                        ⏱️ Duration:
                      </span>
                      <span className="text-gray-700 text-xs">{program.duration}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-yellow-600 font-semibold w-20 flex items-center">
                        📅 Schedule:
                      </span>
                      <span className="text-gray-700 text-xs">{program.schedule}</span>
                    </div>
                  </div>

                  {/* Program features */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-yellow-600 mb-2">Training Focus:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {program.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-xs text-gray-600">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Link
                    to="/admission"
                    className="inline-block w-full text-center bg-gradient-to-r from-yellow-400 to-red-500 text-black px-4 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-300 hover:from-yellow-300 hover:to-red-400 text-sm touch-manipulation cursor-pointer relative z-10 active:scale-95 active:from-yellow-500 active:to-red-600"
                    style={{
                      minHeight: '44px',
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                  >
                    Join This Program
                  </Link>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 to-red-500/0 group-hover:from-yellow-400/5 group-hover:to-red-500/5 rounded-2xl transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-gradient-to-r from-yellow-50 via-white to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-3">
              What Our <span className="text-red-600">Martial</span> <span className="text-yellow-600">Artists</span> Say
            </h2>
            <p className="text-lg text-gray-700">Testimonials from our Taekwon-Do family</p>
            <div className="w-32 h-2 bg-gradient-to-r from-yellow-500 via-red-500 to-black mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-6 transform hover:-translate-y-4 hover:rotate-2 transition-all duration-500 border-t-4 border-yellow-500 hover:border-red-500 group perspective-1000"
                   style={{
                     transform: 'rotateX(5deg) rotateY(5deg)',
                     transformStyle: 'preserve-3d'
                   }}>
                <div className="flex items-center mb-4">
                  <div className="mr-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    {testimonial.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-black text-base">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-500 text-lg animate-pulse" style={{animationDelay: `${i * 100}ms`}} />
                  ))}
                </div>
                
                <p className="text-gray-700 italic leading-relaxed text-sm">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-12 bg-gradient-to-br from-yellow-50 via-white to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-3">Our <span className="text-red-600">Dojang</span> <span className="text-yellow-600">Excellence</span></h2>
            <p className="text-lg text-gray-700">Proven results in traditional martial arts training</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '500+', label: 'Students Trained', icon: <FaUsers className="text-2xl" />, color: 'from-yellow-400 to-yellow-600' },
              { number: '15+', label: 'Years Excellence', icon: <FaCalendarAlt className="text-2xl" />, color: 'from-red-500 to-red-700' },
              { number: '50+', label: 'Champions Forged', icon: <FaMedal className="text-2xl" />, color: 'from-yellow-400 to-yellow-600' },
              { number: '10+', label: 'Black Belt Masters', icon: <FaGraduationCap className="text-2xl" />, color: 'from-red-500 to-red-700' }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center text-black mx-auto mb-3 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-2xl border-2 border-white transform-gpu perspective-1000`}
                     style={{
                       transform: 'rotateX(10deg) rotateY(10deg)',
                       transformStyle: 'preserve-3d'
                     }}>
                  {stat.icon}
                </div>
                <div className={`text-3xl font-bold mb-2 group-hover:scale-110 transition-all duration-500 ${
                  index % 2 === 0 ? 'text-yellow-600' : 'text-red-500'
                } animate-pulse`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium text-sm transform group-hover:translate-y-1 transition-transform duration-300">{stat.label}</div>
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
          <h2 className="text-3xl font-bold text-black mb-4">
            Ready to Begin Your <span className="text-red-600">Taekwon-Do</span> <span className="text-yellow-600">Journey?</span>
          </h2>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Join hundreds of martial artists who have discovered strength, discipline, and honor through authentic Korean Taekwon-Do. 
            Your path to black belt mastery starts with a single step into our dojang.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center">
            <Link
              to="/admission"
              className="group bg-yellow-600 text-white px-8 py-4 rounded-full text-base font-bold hover:bg-yellow-700 hover:shadow-2xl transition-all duration-300 border-2 border-yellow-600 touch-manipulation cursor-pointer relative z-10 active:scale-95 active:bg-yellow-800"
              style={{
                minHeight: '52px',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
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
              className="border-2 border-red-500 text-red-500 bg-white px-8 py-4 rounded-full text-base font-bold hover:bg-red-500 hover:text-white transition-all duration-300 touch-manipulation cursor-pointer relative z-10 active:scale-95 active:bg-red-600 active:text-white"
              style={{
                minHeight: '52px',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <span className="flex items-center justify-center">
                <FaGraduationCap className="mr-2" />
                Visit Our Dojang
              </span>
            </Link>
          </div>

          {/* Contact info with React Icons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-gray-600">
            <div className="flex items-center group hover:scale-105 transition-transform duration-300">
              <FaPhone className="text-yellow-600 mr-2 group-hover:animate-bounce" />
              <span>Call: +91 98765 43210</span>
            </div>
            <div className="flex items-center group hover:scale-105 transition-transform duration-300">
              <FaEnvelope className="text-yellow-600 mr-2 group-hover:animate-pulse" />
              <span>Email: info@combatwarrior.com</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;