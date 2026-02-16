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

function About() {
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-gray-100" style={{ perspective: '1000px' }}>
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            About Combat <span className="text-white">Warrior</span> <span className="text-white">Taekwon-Do</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white max-w-4xl mx-auto leading-relaxed">
            Authentic ITF Taekwon-Do training in Karnataka, preserving the traditional 
            martial art founded by General Choi Hong Hi while building strong character 
            and physical fitness in our students.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="transform hover:scale-105 transition-all duration-500 order-2 lg:order-1">
              <h2 className="text-4xl font-bold mb-4 sm:mb-6 flex items-center flex-wrap" style={{ color: '#006CB5' }}>
                <FaFlag className="mr-2 sm:mr-3" style={{ color: '#006CB5' }} />
                <span>Our Dojang Story</span>
              </h2>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
                <p className="leading-relaxed">
                  Taekwon-Do is a South Korean form of martial arts. It is a combat sport characterised by punching and kicking techniques and was developed during 1940's and 1950's by Korean Martial artists. The main International Taekwon-Do Federation (ITF), founded by Choi Hong- hi in 1966 and Kukkiwon and World Taekwon-Do Federation (WTF).
                </p>
                <p className="leading-relaxed">
                  Taekwon-Do made it's Paralympic debut at Tokyo 2020 and is a sport governed by World Taekwon-Do (WT). The goal of this martial art is to give a sense of self-esteem, knowledge of self-defence heightened mental and physical well-being.
                </p>
                <p className="leading-relaxed">
                 It is necessary to learn as many fundamental movements as possible and fit them into complete profeciency so the student can meet any situation in any combat in confidence. Power and accuracy must be developed to such a high degree that only one single blow is needed to stop an opponent. Each pattern is different from the other in order to develop reaction against changing circumstances.
                </p>
                <p className="leading-relaxed">
                 Yeshwanth B R (Novice) is the President, Founder and the head instructor at Combat Warrior Taekwon-Do Association of Karnataka (CWTAK). Yeshwanth is an ITF certified 3rd degree Black Belt.
                </p>
                <p className="leading-relaxed">
                  There are more than 3000 students from different schools and over 500 students under private training.
                 </p>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-yellow-500">
                <img 
                  src={p1} 
                  alt="Combat Warrior Dojang Training Story" 
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CWTAK History Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-4xl font-bold mb-3 sm:mb-4 flex items-center justify-center flex-wrap" style={{ color: '#006CB5' }}>
              <FaFlag className="mr-2 sm:mr-3" style={{ color: '#006CB5' }} />
              <span>CWTAK History</span>
            </h2>
            <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: '#006CB5' }}></div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-50 to-yellow-50 rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 border-l-4 border-yellow-500">
              <div className="space-y-4 sm:space-y-5 text-sm sm:text-base text-gray-700 leading-relaxed">
                <p className="text-base sm:text-lg font-semibold text-black">
                  Combat Warrior Taekwon-Do Association of Karnataka (CWTAK) was formed in 2017. It is affiliated to All India Taekwon-Do Association and International Taekwon-DO Federation, UK.
                </p>
                
                <p>
                  Here, Taekwon-Do is more than just training for strength, confidence and self-esteem can only be improved by coaching each student.
                </p>
                
                <p>
                  When looking for a martial arts school, it can be difficult. We live in an age of commercialised, franchised martial arts and a market saturated with instructors.
                </p>
                
                <p>
                  Several athletes (martial artists) learned much about the roots of Taekwon-Do and gained a greater appreciation for the art by our <span className="font-semibold text-black">Master V. Maruthi Prasad, 8th Dan, President, All India Taekwon-Do Association.</span>
                </p>
                
                <p className="text-base sm:text-lg font-semibold text-red-600">
                  CWTAK is the perfect tool to unlocking your child's potential. It can be seen that the study of Taekwon-Do is recommended for men, women and children of all age groups.
                </p>
              </div>

              {/* Decorative elements */}
              <div className="mt-6 pt-6 border-t border-yellow-300">
                <div className="flex items-center justify-center space-x-4 text-yellow-600">
                  <FaStar className="text-xl animate-pulse" />
                  <span className="text-sm font-semibold text-gray-600">Established 2017</span>
                  <FaStar className="text-xl animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Class Process In CWTAK Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-4xl font-bold mb-3 sm:mb-4" style={{ color: '#006CB5' }}>
              <span>Class Process In CWTAK</span>
            </h2>
            <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: '#006CB5' }}></div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Process Item 1 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#FFFFFF', border: '2px solid #006CB5' }}>
                    <span style={{ color: '#006CB5', fontWeight: 'bold', fontSize: '1.125rem' }}>1</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Classes are conducted <span className="font-semibold text-black">twice in a week.</span>
                  </p>
                </div>
              </div>

              {/* Process Item 2 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#FFFFFF', border: '2px solid #006CB5' }}>
                    <span style={{ color: '#006CB5', fontWeight: 'bold', fontSize: '1.125rem' }}>2</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Group sessions for students to <span className="font-semibold text-black">promote social skills.</span>
                  </p>
                </div>
              </div>

              {/* Process Item 3 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#FFFFFF', border: '2px solid #006CB5' }}>
                    <span style={{ color: '#006CB5', fontWeight: 'bold', fontSize: '1.125rem' }}>3</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Advanced tests are conducted for the <span className="font-semibold text-black">promotion of students to the next level belt (Belt Exams)</span>
                  </p>
                </div>
              </div>

              {/* Process Item 4 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#FFFFFF', border: '2px solid #006CB5' }}>
                    <span style={{ color: '#006CB5', fontWeight: 'bold', fontSize: '1.125rem' }}>4</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Provided <span className="font-semibold text-black">one-on-one sessions to empower students.</span>
                  </p>
                </div>
              </div>

              {/* Process Item 5 - Full Width */}
              <div className="md:col-span-2 bg-gradient-to-r from-yellow-50 to-red-50 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#FFFFFF', border: '2px solid #006CB5' }}>
                    <span style={{ color: '#006CB5', fontWeight: 'bold', fontSize: '1.125rem' }}>5</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Involving students in various events like <span className="font-semibold text-black">internal level, club level, district level, state level, Nationals, Internationals, and Asian.</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative order-1 lg:order-1">
              <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-red-500">
                <img 
                  src="/choi-hong-hi.jpg" 
                  alt="General Choi Hong-Hi - Founder of Taekwon-Do" 
                  className="w-full h-80 sm:h-96 lg:h-[500px] object-cover"
                />
              </div>
            </div>
            
            <div className="transform hover:scale-105 transition-all duration-500 order-2 lg:order-2">
              <h2 className="text-4xl font-bold mb-4 sm:mb-6 flex items-center flex-wrap" style={{ color: '#006CB5' }}>
                <FaGraduationCap className="mr-2 sm:mr-3" style={{ color: '#006CB5', fontSize: '1.5rem' }} />
                <span>General Choi Hong-Hi Founder of Taekwon-Do</span>
              </h2>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
                <p className="leading-relaxed">
                  <strong className="text-black">General Choi Hong-Hi</strong> (November 9, 1918 – June 15, 2002) was a South Korean army general and martial artist who is widely recognized as the founder of Taekwon-Do. He dedicated his life to developing and promoting this martial art around the world.
                </p>
                <p className="leading-relaxed">
                  Born in what is now North Korea, General Choi began studying Taek Kyon (a traditional Korean martial art) and later Karate during the Japanese occupation. After Korea's liberation, he combined elements of Taek Kyon and Karate with his own innovations to create a new martial art.
                </p>
                <p className="leading-relaxed">
                  On April 11, 1955, the name <strong className="text-red-600">"Taekwon-Do"</strong> was officially adopted. General Choi founded the International Taekwon-Do Federation (ITF) on March 22, 1966, establishing the organizational structure that would spread Taekwon-Do across the globe.
                </p>
                <p className="leading-relaxed">
                  He developed the 24 patterns (Tul) representing 24 hours in a day, the fundamental movements, and the philosophical principles that form the foundation of ITF Taekwon-Do. His vision was not just to create a combat system, but to develop character and promote world peace through martial arts.
                </p>
                <p className="leading-relaxed font-semibold text-black">
                  "The ultimate aim of Taekwon-Do lies not in winning or losing, but in the perfection of the character of its participants."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values - ITF Tenets */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16 transform hover:scale-105 transition-all duration-500">
            <h2 className="text-4xl font-bold mb-3 sm:mb-4 flex items-center justify-center flex-wrap" style={{ color: '#006CB5' }}>
              <FaStar className="mr-2 sm:mr-3" style={{ color: '#006CB5' }} />
              <span>The Five Tenets of Taekwon-Do</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-700">The fundamental principles that guide every ITF practitioner</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { 
                title: 'Courtesy', 
                description: 'Refers to showing courtesy to all others inside and outside of the training academy.', 
                icon: FaHandshake
              },
              { 
                title: 'Integrity', 
                description: 'Students are expected to be honest and be willing to exhibit strong moral principles that will help them distinguish between right and wrong.', 
                icon: FaBalanceScale
              },
              { 
                title: 'Perseverance', 
                description: 'Perseverance simply refers to the willingness of the Taekwon-Do student to continue his/her training and struggle against all odds in order to reach the goal.', 
                icon: FaWalking
              },
              { 
                title: 'Self-control', 
                description: 'Students are expected to have control over your thoughts, emotions as well as your actions.', 
                icon: FaUserAlt
              },
              { 
                title: 'Indomitable Spirit', 
                description: 'Students will consistently exhibit a full 100% effort in all they do and must show courage to stand up for your principles and beliefs and to stay standing strong no matter who you go against and what hindrances are ahead of you.', 
                icon: FaDumbbell
              }
            ].map((tenet, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 text-center"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FFFFFF', borderWidth: '3px', borderStyle: 'solid', borderColor: '#006CB5' }}>
                  <tenet.icon style={{ color: '#006CB5', fontSize: '2rem' }} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">{tenet.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{tenet.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Training History Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-red-100 to-yellow-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-4xl font-bold mb-3 sm:mb-4 flex items-center justify-center flex-wrap" style={{ color: '#006CB5' }}>
              <FaGraduationCap className="mr-2 sm:mr-3" style={{ color: '#006CB5', fontSize: '1.5rem' }} />
              <span>Our Esteemed Mentors</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-700">In 2008, Yeshwanth B R began training under</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Mentor 1 */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-500 border-t-4 border-yellow-500">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4" style={{ backgroundColor: '#FFFFFF', border: '2px solid #006CB5' }}>
                <FaUser style={{ color: '#006CB5', fontSize: '2rem' }} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-black mb-2">Mr. Subbaray</h3>
              <p className="text-red-600 font-bold mb-1 text-sm sm:text-base">5th DAN Black Belt</p>
              <p className="text-gray-700 text-xs sm:text-sm mb-2">President of Amateur Taekwon-Do Association of Karnataka</p>
              <p className="text-yellow-600 font-semibold text-xs sm:text-sm">A passionate trainer and an amazing personality</p>
            </div>

            {/* Mentor 2 */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-500 border-t-4 border-yellow-500">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4" style={{ backgroundColor: '#FFFFFF', border: '2px solid #006CB5' }}>
                <FaUser style={{ color: '#006CB5', fontSize: '2rem' }} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-black mb-2">Mr. Lokesh Anjanappa</h3>
              <p className="text-red-600 font-bold mb-1 text-sm sm:text-base">5th DAN Black Belt</p>
              <p className="text-gray-700 text-xs sm:text-sm">Technical Director ATAK</p>
            </div>

            {/* Mentor 3 */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-500 border-t-4 border-yellow-500">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4" style={{ backgroundColor: '#FFFFFF', border: '2px solid #006CB5' }}>
                <FaUser style={{ color: '#006CB5', fontSize: '2rem' }} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-black mb-2">Mr. Vijay Kumar</h3>
              <p className="text-red-600 font-bold mb-1 text-sm sm:text-base">Chief Mentor</p>
              <p className="text-gray-700 text-xs sm:text-sm">ATAK & Pioneer of ITF in INDIA</p>
            </div>

            {/* Mentor 4 */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-500 border-t-4 border-yellow-500">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4" style={{ backgroundColor: '#FFFFFF', border: '2px solid #006CB5' }}>
                <FaUser style={{ color: '#006CB5', fontSize: '2rem' }} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-black mb-2">Mr. V. Maruthi Prasad</h3>
              <p className="text-red-600 font-bold mb-1 text-sm sm:text-base">8th DAN Black Belt</p>
              <p className="text-gray-700 text-xs sm:text-sm">International Mater and Examiner</p>
            </div>
          </div>

          {/* Closing Statement */}
          <div className="text-center mt-8">
            <p className="text-lg sm:text-xl text-gray-700 font-semibold">
              Yeshwanth B.R feels Grateful to be Trained Under Fabulous Mentors.
            </p>
          </div>
        </div>
      </section>

      {/* CWTAK Leadership Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-4xl font-bold mb-3 sm:mb-4 flex items-center justify-center flex-wrap" style={{ color: '#006CB5' }}>
              <FaUsers className="mr-2 sm:mr-3" style={{ color: '#006CB5', fontSize: '1.5rem' }} />
              <span>CWTAK Leadership</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-700">Combat Warrior Taekwon-Do Association of Karnataka</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* President */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-6 sm:p-8 text-center hover:shadow-2xl transition-all duration-500 border-t-4 border-yellow-500 transform hover:-translate-y-2">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg" style={{ border: '3px solid #006CB5' }}>
                <FaUser style={{ fontSize: '2rem', color: '#006CB5' }} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">Yeshwanth B R</h3>
              <div className="mb-3">
                <p className="text-red-600 font-bold text-base sm:text-lg">3rd DAN Black Belt</p>
                <p className="text-gray-700 font-semibold text-sm sm:text-base">President, CWTAK</p>
              </div>
              <div className="bg-white rounded-lg p-4 mt-4">
                <p className="text-gray-600 text-sm leading-relaxed">
                  Leading Combat Warrior Taekwon-Do Association with dedication to authentic ITF training and student development.
                </p>
              </div>
            </div>

            {/* Vice President */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-xl p-6 sm:p-8 text-center hover:shadow-2xl transition-all duration-500 border-t-4 border-red-500 transform hover:-translate-y-2">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg" style={{ border: '3px solid #006CB5' }}>
                <FaUser style={{ fontSize: '2rem', color: '#006CB5' }} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">Manjunath</h3>
              <div className="mb-3">
                <p className="text-red-600 font-bold text-base sm:text-lg">2nd DAN Black Belt</p>
                <p className="text-gray-700 font-semibold text-sm sm:text-base">Vice-President, CWTAK</p>
              </div>
              <div className="bg-white rounded-lg p-4 mt-4">
                <p className="text-gray-600 text-sm leading-relaxed">
                  Supporting the mission of CWTAK with commitment to excellence in martial arts training and student success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-4xl font-bold mb-3" style={{ color: '#006CB5' }}>
              Achievements
            </h2>
            <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: '#006CB5' }}></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Instructor Achievements */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300" style={{ borderTop: '4px solid #006CB5' }}>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4" style={{ border: '3px solid #006CB5' }}>
                  <FaMedal style={{ color: '#006CB5', fontSize: '1.5rem' }} />
                </div>
                <h3 className="text-2xl font-bold" style={{ color: '#006CB5' }}>Instructor Achievements</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ border: '2px solid #006CB5' }}>
                    <FaMedal style={{ color: '#006CB5', fontSize: '0.875rem' }} />
                  </div>
                  <span className="text-gray-700 leading-relaxed">Asian games Umpire June 2019.</span>
                </li>
                <li className="flex items-start group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ border: '2px solid #006CB5' }}>
                    <FaMedal style={{ color: '#006CB5', fontSize: '0.875rem' }} />
                  </div>
                  <span className="text-gray-700 leading-relaxed">Won Gold medal in 3rd International Taekwon-Do Championship- 2013.</span>
                </li>
                <li className="flex items-start group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ border: '2px solid #006CB5' }}>
                    <FaMedal style={{ color: '#006CB5', fontSize: '0.875rem' }} />
                  </div>
                  <span className="text-gray-700 leading-relaxed">Won Bronze in South Asian Taekwon-Do Championship.</span>
                </li>
                <li className="flex items-start group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ border: '2px solid #006CB5' }}>
                    <FaMedal style={{ color: '#006CB5', fontSize: '0.875rem' }} />
                  </div>
                  <span className="text-gray-700 leading-relaxed">National level 23 Gold, 15 Silver, 36 Bronze and Umpire Certification.</span>
                </li>
                <li className="flex items-start group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ border: '2px solid #006CB5' }}>
                    <FaMedal style={{ color: '#006CB5', fontSize: '0.875rem' }} />
                  </div>
                  <span className="text-gray-700 leading-relaxed">Won several medals as Taekwon-Do Student. (Club, State and National level).</span>
                </li>
                <li className="flex items-start group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ border: '2px solid #006CB5' }}>
                    <FaMedal style={{ color: '#006CB5', fontSize: '0.875rem' }} />
                  </div>
                  <span className="text-gray-700 leading-relaxed">There are 10 Black Belt students who have Trained Under him.</span>
                </li>
              </ul>
            </div>

            {/* Students Achievement */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300" style={{ borderTop: '4px solid #006CB5' }}>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4" style={{ border: '3px solid #006CB5' }}>
                  <FaAward style={{ color: '#006CB5', fontSize: '1.5rem' }} />
                </div>
                <h3 className="text-2xl font-bold" style={{ color: '#006CB5' }}>Students Achievement</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ border: '2px solid #006CB5' }}>
                    <FaAward style={{ color: '#006CB5', fontSize: '0.875rem' }} />
                  </div>
                  <span className="text-gray-700 leading-relaxed">Won 1 Silver and 2 Bronze in Asian Games.</span>
                </li>
                <li className="flex items-start group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ border: '2px solid #006CB5' }}>
                    <FaAward style={{ color: '#006CB5', fontSize: '0.875rem' }} />
                  </div>
                  <span className="text-gray-700 leading-relaxed">Several Gold and Silver in 8 National matches.</span>
                </li>
                <li className="flex items-start group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ border: '2px solid #006CB5' }}>
                    <FaAward style={{ color: '#006CB5', fontSize: '0.875rem' }} />
                  </div>
                  <span className="text-gray-700 leading-relaxed">Several Gold, Silver and Bronze at State level, District level and Club level.</span>
                </li>
                <li className="flex items-start group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ border: '2px solid #006CB5' }}>
                    <FaAward style={{ color: '#006CB5', fontSize: '0.875rem' }} />
                  </div>
                  <span className="text-gray-700 leading-relaxed">Gold at Hyderabad Nationals.</span>
                </li>
                <li className="flex items-start group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ border: '2px solid #006CB5' }}>
                    <FaAward style={{ color: '#006CB5', fontSize: '0.875rem' }} />
                  </div>
                  <span className="text-gray-700 leading-relaxed">80 Gold, 50 Silver and 5 Bronze at I Tiger Dojong State level and South Zone Vifa.</span>
                </li>
              </ul>
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