import { 
  FaFistRaised, 
  FaTrophy, 
  FaBullseye, 
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
  FaHandshake,
  FaGem,
  FaMountain,
  FaBrain,
  FaQuoteLeft,
  FaAward,
  FaFlag
} from 'react-icons/fa';
import photo1 from '../../assets/photo1.jpg';
import p1 from '../../assets/p1.jpg';

function About() {
  const instructors = [
    {
      name: 'Sabum Nim Ravi Kumar',
      title: 'Chief Instructor & Founder',
      belt: '5th Dan Black Belt ITF',
      experience: '20+ Years',
      specialization: 'ITF Patterns & Traditional Forms',
      icon: FaFistRaised
    },
    {
      name: 'Sabum Nim Deepa Rao',
      title: 'Senior Instructor',
      belt: '3rd Dan Black Belt ITF',
      experience: '12+ Years',
      specialization: 'Children Programs & Breaking Techniques',
      icon: FaUsers
    },
    {
      name: 'Boosabum Nim Arjun Shetty',
      title: 'Assistant Instructor',
      belt: '1st Dan Black Belt ITF',
      experience: '6+ Years',
      specialization: 'Sparring & Self-Defense',
      icon: FaShieldAlt
    }
  ];

  const achievements = [
    { year: '2024', title: 'Karnataka State ITF Championship', count: '8 Gold, 12 Silver' },
    { year: '2023', title: 'South India ITF Tournament', count: '5 Gold Medals' },
    { year: '2022', title: 'ITF India Grading Success', count: '95% Pass Rate' },
    { year: '2021', title: 'Best Dojang Award', count: 'ITF India Recognition' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-gray-100" style={{ perspective: '1000px' }}>
      {/* Hero Section */}
      <section 
        className="hero-section mobile-hero-fix relative py-16 sm:py-20 min-h-[60vh] flex items-center justify-center transform-gpu"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${photo1})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll',
          transform: 'rotateX(2deg)',
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-fade-in-up">
            <div className="transform hover:scale-105 transition-all duration-500">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
                About Combat <span className="text-white">Warrior</span> <span className="text-white">Taekwon-Do</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white max-w-3xl mx-auto font-medium leading-relaxed">
                Authentic ITF Taekwon-Do training in Karnataka, preserving the traditional 
                martial art founded by General Choi Hong Hi while building strong character 
                and physical fitness in our students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="transform hover:scale-105 transition-all duration-500 order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4 sm:mb-6 flex items-center flex-wrap">
                <FaFlag className="text-red-600 mr-2 sm:mr-3 animate-pulse" />
                <span>Our Dojang <span className="text-yellow-600 ml-1 sm:ml-2">Story</span></span>
              </h2>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
                <p className="leading-relaxed">
                  Established in 2010, Combat Warrior Taekwon-Do Association of Karnataka 
                  was founded with the vision of bringing authentic International Taekwon-Do 
                  Federation (ITF) training to Karnataka. Our dojang follows the original 
                  teachings of General Choi Hong Hi, the founder of Taekwon-Do.
                </p>
                <p className="leading-relaxed">
                  Starting with just 8 dedicated students in a small training hall in Bangalore, 
                  we have grown to serve over 300 active practitioners across Karnataka. 
                  Our commitment to traditional ITF curriculum includes all 24 patterns 
                  (Tul), fundamental movements, sparring, and breaking techniques.
                </p>
                <p className="leading-relaxed">
                  We are affiliated with ITF India and regularly participate in national 
                  and international seminars, gradings, and tournaments. Our students 
                  have successfully graded up to 3rd Dan Black Belt under certified 
                  ITF masters and international instructors.
                </p>
              </div>
            </div>
            <div className="relative transform hover:scale-105 hover:rotate-1 transition-all duration-500 order-1 lg:order-2">
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl border-2 sm:border-4 border-gradient-to-r from-yellow-500 to-red-500 transform transition-all duration-500 hover:scale-105 hover:rotate-1">
                <div className="relative overflow-hidden">
                  <img 
                    src={p1} 
                    alt="Combat Warrior Dojang Training Story" 
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover transition-all duration-700 group-hover:scale-110 filter group-hover:brightness-110 group-hover:contrast-110"
                  />
                  
                  {/* Multiple gradient overlays for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-red-500/10"></div>
                </div>
              </div>

              {/* Floating elements around the image - hidden on mobile */}
              <div className="hidden sm:block absolute -top-2 -left-2 w-4 sm:w-6 h-4 sm:h-6 bg-yellow-400 rounded-full opacity-60 animate-bounce" style={{animationDelay: '0s'}}></div>
              <div className="hidden sm:block absolute -top-4 right-10 w-3 sm:w-4 h-3 sm:h-4 bg-red-500 rounded-full opacity-60 animate-bounce" style={{animationDelay: '1s'}}></div>
              <div className="hidden sm:block absolute bottom-10 -right-2 w-4 sm:w-5 h-4 sm:h-5 bg-yellow-500 rounded-full opacity-60 animate-bounce" style={{animationDelay: '2s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-yellow-100 to-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border-l-4 border-yellow-500 transform hover:scale-105 hover:rotate-1 transition-all duration-500 group"
                 style={{
                   transform: 'rotateX(5deg)',
                   transformStyle: 'preserve-3d'
                 }}>
              <div className="flex items-center mb-3 sm:mb-4 flex-wrap">
                <FaBullseye className="text-2xl sm:text-3xl lg:text-4xl text-yellow-500 mr-2 sm:mr-3 lg:mr-4 group-hover:animate-spin flex-shrink-0" />
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">Our Mission</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                To preserve and teach authentic ITF Taekwon-Do as established by General Choi Hong Hi, 
                developing physical fitness, mental discipline, and moral character. We aim to create 
                confident martial artists who embody the tenets of Taekwon-Do: Courtesy, Integrity, 
                Perseverance, Self-Control, and Indomitable Spirit.
              </p>
            </div>
            
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border-l-4 border-red-600 transform hover:scale-105 hover:-rotate-1 transition-all duration-500 group"
                 style={{
                   transform: 'rotateX(-5deg)',
                   transformStyle: 'preserve-3d'
                 }}>
              <div className="flex items-center mb-3 sm:mb-4 flex-wrap">
                <FaTrophy className="text-2xl sm:text-3xl lg:text-4xl text-red-600 mr-2 sm:mr-3 lg:mr-4 group-hover:animate-bounce flex-shrink-0" />
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">Our Vision</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                To be Karnataka's leading ITF Taekwon-Do institution, recognized for excellence 
                in traditional martial arts education and character development. We strive to 
                produce skilled practitioners who can represent India in international ITF 
                competitions and seminars.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values - ITF Tenets */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16 transform hover:scale-105 transition-all duration-500">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-3 sm:mb-4 flex items-center justify-center flex-wrap">
              <FaStar className="text-yellow-500 mr-2 sm:mr-3 animate-pulse" />
              <span>The Five Tenets of <span className="text-red-600 ml-1 sm:ml-2">Taekwon-Do</span></span>
            </h2>
            <p className="text-sm sm:text-base text-gray-700">The fundamental principles that guide every ITF practitioner</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            {[
              { title: 'Courtesy', description: 'Respect and politeness towards others', icon: FaHandshake, color: 'bg-yellow-100 border-yellow-500' },
              { title: 'Integrity', description: 'Honesty and moral uprightness', icon: FaGem, color: 'bg-red-100 border-red-500' },
              { title: 'Perseverance', description: 'Persistence in achieving goals', icon: FaMountain, color: 'bg-yellow-100 border-yellow-500' },
              { title: 'Self-Control', description: 'Discipline over mind and body', icon: FaBrain, color: 'bg-red-100 border-red-500' },
              { title: 'Indomitable Spirit', description: 'Unbreakable will and courage', icon: FaFire, color: 'bg-yellow-100 border-yellow-500' }
            ].map((tenet, index) => (
              <div 
                key={index} 
                className={`text-center p-4 sm:p-6 rounded-lg sm:rounded-xl ${tenet.color} border-2 hover:shadow-lg transition-all duration-500 transform hover:scale-105 hover:rotate-1 group`}
                style={{
                  transform: `rotateX(${3 + index}deg) rotateY(${1 + index}deg)`,
                  transformStyle: 'preserve-3d',
                  animation: `float-${index % 3} 4s ease-in-out infinite`
                }}
              >
                <tenet.icon className="text-2xl sm:text-3xl lg:text-4xl mb-3 sm:mb-4 mx-auto text-amber-500 group-hover:animate-bounce" />
                <h3 className="text-base sm:text-lg font-bold text-black mb-2">{tenet.title}</h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{tenet.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-red-100 to-yellow-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16 transform hover:scale-105 transition-all duration-500">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-3 sm:mb-4 flex items-center justify-center flex-wrap">
              <FaGraduationCap className="text-red-600 mr-2 sm:mr-3 animate-bounce" />
              <span>Our ITF Certified <span className="text-yellow-600 ml-1 sm:ml-2">Instructors</span></span>
            </h2>
            <p className="text-sm sm:text-base text-gray-700">Learn from qualified masters trained in authentic ITF curriculum</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {instructors.map((instructor, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 text-center hover:shadow-xl transition-all duration-500 border-t-4 border-yellow-500 transform hover:scale-105 hover:rotate-1 group"
                style={{
                  transform: `rotateX(${5 + index * 2}deg) rotateY(${2 + index}deg)`,
                  transformStyle: 'preserve-3d',
                  animation: `float-${index % 3} 3s ease-in-out infinite`
                }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  <instructor.icon className="text-lg sm:text-xl lg:text-2xl text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-black mb-2">{instructor.name}</h3>
                <p className="text-red-600 font-bold mb-1 text-sm sm:text-base">{instructor.title}</p>
                <p className="text-yellow-600 font-semibold text-xs sm:text-sm mb-3 sm:mb-4">{instructor.belt}</p>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center group/item hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200 gap-1 sm:gap-0">
                    <div className="flex items-center justify-center sm:justify-start">
                      <FaClock className="text-amber-500 mr-2 group-hover/item:animate-spin" />
                      <span className="text-gray-700">Experience:</span>
                    </div>
                    <span className="font-semibold text-black text-center sm:text-right">{instructor.experience}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center group/item hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200 gap-1 sm:gap-0">
                    <div className="flex items-center justify-center sm:justify-start">
                      <FaStar className="text-amber-500 mr-2 group-hover/item:animate-pulse" />
                      <span className="text-gray-700">Specialization:</span>
                    </div>
                    <span className="font-semibold text-black text-xs text-center sm:text-right">{instructor.specialization}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16 transform hover:scale-105 transition-all duration-500">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-3 sm:mb-4 flex items-center justify-center flex-wrap">
              <FaMedal className="text-yellow-500 mr-2 sm:mr-3 animate-pulse" />
              <span>Tournament <span className="text-red-600 ml-1 sm:ml-2">Achievements</span></span>
            </h2>
            <p className="text-sm sm:text-base text-gray-700">Celebrating our students' success in ITF competitions</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className="text-center p-4 sm:p-6 rounded-lg sm:rounded-xl bg-gradient-to-br from-yellow-100 to-red-100 hover:from-yellow-200 hover:to-red-200 transition-all duration-500 border-2 border-yellow-500 transform hover:scale-105 hover:rotate-1 group"
                style={{
                  transform: `rotateX(${3 + index}deg) rotateY(${1 + index}deg)`,
                  transformStyle: 'preserve-3d',
                  animation: `float-${index % 3} 4s ease-in-out infinite`
                }}
              >
                <div className="flex items-center justify-center mb-2 flex-wrap">
                  <FaAward className="text-xl sm:text-2xl text-red-600 mr-2 group-hover:animate-bounce" />
                  <div className="text-xl sm:text-2xl font-bold text-red-600">{achievement.year}</div>
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-black mb-2 leading-tight">{achievement.title}</h3>
                <p className="text-red-700 font-semibold text-xs sm:text-sm">{achievement.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ITF Affiliation */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 transform hover:scale-105 transition-all duration-500">
          <div className="flex items-center justify-center mb-4 sm:mb-6 flex-wrap">
            <FaCheckCircle className="text-3xl sm:text-4xl text-green-600 mr-2 sm:mr-3 animate-pulse" />
            <h2 className="text-2xl sm:text-3xl font-bold text-black">ITF Certified Training</h2>
          </div>
          <p className="text-sm sm:text-base text-gray-700 mb-6 sm:mb-8 font-medium leading-relaxed">
            We are proud members of the International Taekwon-Do Federation (ITF), 
            ensuring authentic and standardized training according to General Choi Hong Hi's 
            original teachings and philosophy. Our curriculum includes all 24 ITF patterns, 
            fundamental movements, sparring techniques, and breaking methods.
          </p>
          <div className="rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 border-2 border-gray-300 transform hover:scale-105 hover:rotate-1 transition-all duration-500 mb-6 sm:mb-8"
               style={{
                 transform: 'rotateX(5deg)',
                 transformStyle: 'preserve-3d'
               }}>
            <FaQuoteLeft className="text-gray-600 text-xl sm:text-2xl mb-3 sm:mb-4 mx-auto animate-bounce" />
            <p className="text-gray-800 text-base sm:text-lg font-semibold mb-3 sm:mb-4 leading-relaxed">
              "The ultimate aim of Taekwon-Do lies not in winning or losing, 
              but in the perfection of the character of its participants."
            </p>
            <p className="text-gray-600 font-medium text-sm sm:text-base">- General Choi Hong Hi, Founder of ITF Taekwon-Do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border-2 border-yellow-500 shadow-lg transform hover:scale-105 hover:rotate-1 transition-all duration-500 group"
                 style={{
                   transform: 'rotateX(5deg)',
                   transformStyle: 'preserve-3d'
                 }}>
              <div className="flex items-center justify-center mb-2 sm:mb-3 flex-wrap">
                <FaBolt className="text-xl sm:text-2xl text-yellow-500 mr-2 group-hover:animate-bounce" />
                <h4 className="font-bold text-lg sm:text-xl text-black text-center">24 ITF Patterns</h4>
              </div>
              <p className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">Complete Tul curriculum from Chon-Ji to Tong-Il</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border-2 border-red-500 shadow-lg transform hover:scale-105 hover:-rotate-1 transition-all duration-500 group"
                 style={{
                   transform: 'rotateX(-5deg)',
                   transformStyle: 'preserve-3d'
                 }}>
              <div className="flex items-center justify-center mb-2 sm:mb-3 flex-wrap">
                <FaFistRaised className="text-xl sm:text-2xl text-red-500 mr-2 group-hover:animate-pulse" />
                <h4 className="font-bold text-lg sm:text-xl text-black text-center">Authentic Techniques</h4>
              </div>
              <p className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">Traditional ITF fundamental movements and applications</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border-2 border-yellow-500 shadow-lg transform hover:scale-105 hover:rotate-1 transition-all duration-500 group"
                 style={{
                   transform: 'rotateX(5deg)',
                   transformStyle: 'preserve-3d'
                 }}>
              <div className="flex items-center justify-center mb-2 sm:mb-3 flex-wrap">
                <FaFlag className="text-xl sm:text-2xl text-yellow-500 mr-2 group-hover:animate-spin" />
                <h4 className="font-bold text-lg sm:text-xl text-black text-center">International Standards</h4>
              </div>
              <p className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">Grading and competition rules as per ITF guidelines</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;

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