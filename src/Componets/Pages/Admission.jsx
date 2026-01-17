import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import image from '../../assets/image.png';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaGraduationCap, 
  FaClock, 
  FaHeartbeat, 
  FaCheckCircle, 
  FaPaperPlane,
  FaBolt,
  FaShieldAlt,
  FaUsers,
  FaStar,
  FaSpinner,
  FaHome
} from 'react-icons/fa';

function Admission() {
  const navigate = useNavigate();
  const [showThankYou, setShowThankYou] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    nationality: 'Indian',
    
    // Course Information
    courseLevel: '',
    preferredSchedule: '',
    trainingGoals: '',
    previousMartialArts: '',
    fitnessLevel: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    relationshipToStudent: '',
    emergencyContactAddress: '',
    
    // Medical & Health Information
    medicalConditions: '',
    
    // Additional Information
    howDidYouHear: '',
    specialRequests: '',
    parentGuardianName: '', // For minors
    parentGuardianPhone: '', // For minors
    
    // Agreement
    agreeToTerms: false,
    agreeToPhotos: false,
    agreeToEmails: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.dateOfBirth || !formData.gender || 
        !formData.phone || !formData.email || !formData.address || 
        !formData.city || !formData.state || !formData.pincode ||
        !formData.courseLevel || !formData.emergencyContactName || 
        !formData.emergencyContactPhone || !formData.relationshipToStudent || 
        !formData.agreeToTerms) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all required fields and agree to terms.'
      });
      return;
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter a valid email address.'
      });
      return;
    }

    // Phone validation
    const phoneRegex = /^[+]?[1-9][\d]{9,14}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter a valid phone number.'
      });
      return;
    }

    // Age validation (minimum 5 years old)
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 5) {
      setSubmitStatus({
        type: 'error',
        message: 'Applicant must be at least 5 years old.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      console.log('Submitting form data:', formData);
      
      // Send admission data to backend API
      const response = await fetch('http://localhost:5000/api/admissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Backend error response:', data);
        // Show specific validation errors if available
        if (data.errors && Array.isArray(data.errors)) {
          // Extract error messages from the errors array
          const errorMessages = data.errors.map(err => err.msg || err.message || JSON.stringify(err));
          throw new Error(errorMessages.join(', '));
        }
        throw new Error(data.message || 'Failed to submit application');
      }

      console.log('Admission application submitted successfully:', data);

      // Show thank you card
      setShowThankYou(true);
      
      // Reset form
      setFormData({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        nationality: 'Indian',
        courseLevel: '',
        preferredSchedule: '',
        trainingGoals: '',
        previousMartialArts: '',
        fitnessLevel: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        relationshipToStudent: '',
        emergencyContactAddress: '',
        medicalConditions: '',
        howDidYouHear: '',
        specialRequests: '',
        parentGuardianName: '',
        parentGuardianPhone: '',
        agreeToTerms: false,
        agreeToPhotos: false,
        agreeToEmails: false
      });

      // Redirect to home page after 5 minutes (300 seconds)
      setTimeout(() => {
        navigate('/');
      }, 300000);
    } catch (error) {
      console.error('Admission form submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Error submitting application. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thank You Card Component
  if (showThankYou) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center animate-fadeIn">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce">
              <FaCheckCircle className="text-white text-5xl" />
            </div>
          </div>

          {/* Thank You Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Thank You! 🎉
          </h1>
          
          <p className="text-xl text-gray-700 mb-6">
            Your admission application has been successfully submitted!
          </p>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-8">
            <p className="text-gray-800 text-lg leading-relaxed">
              We're excited to have you join our <span className="font-bold text-red-600">Taekwon-Do family</span>! 
              Our team will carefully review your application and contact you within <span className="font-semibold">24-48 hours</span>.
            </p>
          </div>

          {/* Additional Info */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center text-gray-600">
              <FaEnvelope className="mr-2 text-amber-500" />
              <span>Check your email for confirmation</span>
            </div>
            <div className="flex items-center justify-center text-gray-600">
              <FaPhone className="mr-2 text-amber-500" />
              <span>We'll call you soon to discuss next steps</span>
            </div>
          </div>

          {/* Redirect Message */}
          <div className="text-gray-500 text-sm mb-6">
            Redirecting to home page in 5 minutes...
          </div>

          {/* Home Button */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FaHome className="mr-2" />
            Go to Home Page
          </button>

          {/* Decorative Elements */}
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ perspective: '1000px' }}>
      {/* Hero Section */}
      <section 
        className="hero-section mobile-hero-fix relative py-20 sm:py-24 min-h-[60vh] flex items-center justify-center transform-gpu"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url(${image})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll',
          transform: 'rotateX(2deg)',
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10 animate-fade-in-up">
          <div className="inline-flex items-center bg-black border border-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold mb-6 sm:mb-8 transform hover:scale-105 hover:rotate-1 transition-all duration-500"
               style={{
                 transform: 'rotateX(5deg)',
                 transformStyle: 'preserve-3d'
               }}>
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 sm:mr-3 animate-pulse"></span>
            <FaStar className="mr-1 sm:mr-2 animate-spin" />
            Admissions Now Open - Limited Seats Available
          </div>
          <div className="transform hover:scale-105 transition-all duration-500">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white">
              Join <span className="text-white">Combat</span> <span className="text-white">Warrior</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white max-w-4xl mx-auto leading-relaxed">
              Begin your martial arts journey with Karnataka's premier Taekwon-do academy. 
              Complete the application below to secure your spot.
            </p>
          </div>
        </div>
      </section>

      <div className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white text-center">
              <div className="flex items-center justify-center mb-2">
                <FaGraduationCap className="text-4xl mr-3" />
                <h2 className="text-3xl font-bold text-white">Student Admission Application</h2>
              </div>
              <p className="text-slate-300">All fields marked with * are required</p>
            </div>

            <form onSubmit={handleSubmit} className="p-12 space-y-10">
              {/* Status Message */}
              {submitStatus && (
                <div className={`p-4 rounded-xl mb-6 ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  <div className="flex items-center">
                    {submitStatus.type === 'success' ? (
                      <FaCheckCircle className="mr-2" />
                    ) : (
                      <FaUser className="mr-2" />
                    )}
                    {submitStatus.message}
                  </div>
                </div>
              )}
              {/* Personal Information */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <h3 className="text-3xl font-bold text-black">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <FaUser className="text-amber-500 mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your complete name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <FaCalendarAlt className="text-amber-500 mr-2" />
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <FaUsers className="text-amber-500 mr-2" />
                      Gender *
                    </label>
                    <select 
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300">
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <FaPhone className="text-amber-500 mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <FaEnvelope className="text-amber-500 mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <FaMapMarkerAlt className="text-amber-500 mr-2" />
                      Nationality
                    </label>
                    <select 
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300">
                      <option value="Indian">Indian</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                    <FaMapMarkerAlt className="text-white text-sm" />
                  </div>
                  <h3 className="text-3xl font-bold text-black">Address Information</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <FaMapMarkerAlt className="text-amber-500 mr-2" />
                      Street Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 resize-none"
                      placeholder="Enter your complete street address"
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">PIN Code *</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{6}"
                        className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                        placeholder="PIN Code"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Selection & Training Information */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                    <FaGraduationCap className="text-white text-sm" />
                  </div>
                  <h3 className="text-3xl font-bold text-black">Training Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <FaShieldAlt className="text-amber-500 mr-2" />
                      Training Level *
                    </label>
                    <select 
                      name="courseLevel"
                      value={formData.courseLevel}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300">
                      <option value="">Select Your Level</option>
                      <option value="beginner">Foundation Level (Beginner)</option>
                      <option value="intermediate">Advanced Skills (Intermediate)</option>
                      <option value="advanced">Master Level (Advanced)</option>
                      <option value="black-belt">Black Belt Training</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <FaClock className="text-amber-500 mr-2" />
                      Preferred Schedule
                    </label>
                    <select 
                      name="preferredSchedule"
                      value={formData.preferredSchedule}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300">
                      <option value="">Select Schedule</option>
                      <option value="morning">Morning Sessions (6:00 AM - 8:00 AM)</option>
                      <option value="evening">Evening Sessions (6:00 PM - 8:00 PM)</option>
                      <option value="weekend">Weekend Only (Sat-Sun)</option>
                      <option value="flexible">Flexible (Any available time)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <FaStar className="text-amber-500 mr-2" />
                      Training Goals
                    </label>
                    <select 
                      name="trainingGoals"
                      value={formData.trainingGoals}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300">
                      <option value="">Select Primary Goal</option>
                      <option value="fitness">Physical Fitness & Health</option>
                      <option value="self-defense">Self Defense</option>
                      <option value="discipline">Discipline & Character Building</option>
                      <option value="competition">Competition Training</option>
                      <option value="recreation">Recreation & Fun</option>
                      <option value="belt-advancement">Belt Advancement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <FaShieldAlt className="text-amber-500 mr-2" />
                      Previous Martial Arts Experience
                    </label>
                    <select 
                      name="previousMartialArts"
                      value={formData.previousMartialArts}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300">
                      <option value="">Select Experience Level</option>
                      <option value="none">No Previous Experience</option>
                      <option value="taekwondo">Previous Taekwon-Do Training</option>
                      <option value="karate">Karate Experience</option>
                      <option value="other-martial-arts">Other Martial Arts</option>
                      <option value="multiple">Multiple Martial Arts</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <FaHeartbeat className="text-amber-500 mr-2" />
                      Current Fitness Level
                    </label>
                    <select 
                      name="fitnessLevel"
                      value={formData.fitnessLevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300">
                      <option value="">Select Fitness Level</option>
                      <option value="excellent">Excellent - Very Active, Regular Exercise</option>
                      <option value="good">Good - Moderately Active</option>
                      <option value="average">Average - Some Physical Activity</option>
                      <option value="below-average">Below Average - Limited Physical Activity</option>
                      <option value="poor">Poor - Sedentary Lifestyle</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Emergency Contact & Guardian Information */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                    <FaPhone className="text-white text-sm" />
                  </div>
                  <h3 className="text-3xl font-bold text-black">Emergency Contact & Guardian Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <FaUser className="text-amber-500 mr-2" />
                      Emergency Contact Name *
                    </label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                      placeholder="Emergency contact full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <FaPhone className="text-amber-500 mr-2" />
                      Emergency Contact Phone *
                    </label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <FaUsers className="text-amber-500 mr-2" />
                      Relationship to Student *
                    </label>
                    <select 
                      name="relationshipToStudent"
                      value={formData.relationshipToStudent}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300">
                      <option value="">Select Relationship</option>
                      <option value="parent">Parent</option>
                      <option value="guardian">Legal Guardian</option>
                      <option value="sibling">Sibling</option>
                      <option value="spouse">Spouse</option>
                      <option value="grandparent">Grandparent</option>
                      <option value="other">Other Family Member</option>
                      <option value="friend">Friend</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <FaMapMarkerAlt className="text-amber-500 mr-2" />
                      Emergency Contact Address
                    </label>
                    <input
                      type="text"
                      name="emergencyContactAddress"
                      value={formData.emergencyContactAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                      placeholder="Emergency contact address (if different)"
                    />
                  </div>
                  
                  {/* Parent/Guardian Information for Minors */}
                  <div className="md:col-span-2">
                    <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500 mb-4">
                      <p className="text-sm text-blue-700 font-medium">
                        <FaUser className="inline mr-2" />
                        For applicants under 18 years: Parent/Guardian information is required
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                          Parent/Guardian Name
                        </label>
                        <input
                          type="text"
                          name="parentGuardianName"
                          value={formData.parentGuardianName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                          placeholder="Parent or guardian full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                          Parent/Guardian Phone
                        </label>
                        <input
                          type="tel"
                          name="parentGuardianPhone"
                          value={formData.parentGuardianPhone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical & Health Information */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                    <FaHeartbeat className="text-white text-sm" />
                  </div>
                  <h3 className="text-3xl font-bold text-black">Medical & Health Information</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-500 mb-6">
                    <p className="text-sm text-yellow-700 font-medium">
                      <FaHeartbeat className="inline mr-2" />
                      Please provide any relevant medical information to ensure your safety during training
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <FaHeartbeat className="text-amber-500 mr-2" />
                      Medical Information
                    </label>
                    <textarea
                      name="medicalConditions"
                      value={formData.medicalConditions}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 resize-none"
                      placeholder="Please list any medical conditions, allergies, current medications, physical limitations, or other health information relevant to martial arts training (e.g., heart conditions, joint problems, previous injuries, medications, allergies, etc.)"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                    <FaStar className="text-white text-sm" />
                  </div>
                  <h3 className="text-3xl font-bold text-black">Additional Information</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                        <FaStar className="text-amber-500 mr-2" />
                        How did you hear about us?
                      </label>
                      <select 
                        name="howDidYouHear"
                        value={formData.howDidYouHear}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300">
                        <option value="">Select Source</option>
                        <option value="google">Google Search</option>
                        <option value="social-media">Social Media (Facebook, Instagram)</option>
                        <option value="friend-referral">Friend/Family Referral</option>
                        <option value="website">Academy Website</option>
                        <option value="flyer">Flyer/Brochure</option>
                        <option value="event">Community Event/Demo</option>
                        <option value="school">School Program</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                        <FaCheckCircle className="text-amber-500 mr-2" />
                        Special Requests or Notes
                      </label>
                      <textarea
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 resize-none"
                        placeholder="Any special accommodations, questions, or additional information you'd like us to know"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Agreements */}
              <div className="border-t-2 border-slate-200 pt-8">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                    <FaCheckCircle className="text-white text-sm" />
                  </div>
                  <h3 className="text-3xl font-bold text-black">Terms & Agreements</h3>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      required
                      className="w-5 h-5 text-amber-500 border-2 border-slate-300 rounded focus:ring-amber-500 mt-1"
                    />
                    <label className="text-sm text-slate-600 leading-relaxed flex items-start">
                      <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>
                        <strong>Terms & Conditions (Required):</strong> I agree to the terms and conditions, understand the training requirements, 
                        and acknowledge that martial arts training involves physical activity and inherent risks. 
                        I consent to emergency medical treatment if necessary and understand the academy's policies regarding fees, attendance, and conduct.
                      </span>
                    </label>
                  </div>


                 
                </div>
                
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg touch-manipulation cursor-pointer relative z-10 active:scale-95 ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 hover:shadow-xl'
                    }`}
                    style={{
                      minHeight: '56px',
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                  >
                    <span className="flex items-center justify-center">
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="mr-2 animate-spin" />
                          Submitting Application...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="mr-2" />
                          <FaBolt className="mr-2" />
                          Submit Application
                        </>
                      )}
                    </span>
                  </button>
                  <p className="text-sm text-slate-500 mt-4 flex items-center justify-center">
                    <FaClock className="mr-2 text-amber-500" />
                    We'll review your application and contact you within 24-48 hours
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    By submitting this form, you confirm that all information provided is accurate and complete.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admission;

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
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