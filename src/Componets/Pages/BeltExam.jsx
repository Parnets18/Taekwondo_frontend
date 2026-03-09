import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import image from '../../assets/belt.jpg';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaPaperPlane,
  FaSpinner,
  FaHome,
  FaStar,
  FaMedal
} from 'react-icons/fa';

function BeltExam() {
  const navigate = useNavigate();
  const [showThankYou, setShowThankYou] = useState(false);
  const [formData, setFormData] = useState({
    candidateName: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    parentGuardianName: '',
    address: '',
    phoneNumber: '',
    district: '',
    state: '',
    gmail: '',
    appearingForGrade: '',
    presentBelt: '',
    schoolName: '',
    academicQualification: '',
    instructorName: '',
    photo: null,
    agreeToTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else if (name === 'dateOfBirth') {
      // Auto-calculate age
      const birthDate = new Date(value);
      const today = new Date();
      const calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
        ? calculatedAge - 1 
        : calculatedAge;
      
      setFormData(prev => ({
        ...prev,
        dateOfBirth: value,
        age: finalAge > 0 ? finalAge.toString() : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.candidateName || !formData.dateOfBirth || !formData.gender || 
        !formData.parentGuardianName || !formData.address || !formData.phoneNumber || 
        !formData.gmail || !formData.appearingForGrade || !formData.presentBelt || 
        !formData.agreeToTerms) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all required fields and agree to terms.'
      });
      return;
    }

    // Age validation - must be at least 3 years old
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 3) {
      setSubmitStatus({
        type: 'error',
        message: `Candidate must be at least 3 years old. Current age: ${age} years. Please check the date of birth.`
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://taekwondo-backend-j8w4.onrender.com/api/api';
      const response = await fetch(`${API_BASE_URL}/belt-exams`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application');
      }

      setShowThankYou(true);
      
      // Reset form
      setFormData({
        candidateName: '',
        dateOfBirth: '',
        age: '',
        gender: '',
        parentGuardianName: '',
        address: '',
        phoneNumber: '',
        district: '',
        state: '',
        gmail: '',
        appearingForGrade: '',
        presentBelt: '',
        schoolName: '',
        academicQualification: '',
        instructorName: '',
        photo: null,
        agreeToTerms: false
      });

      setTimeout(() => {
        navigate('/');
      }, 300000);
    } catch (error) {
      console.error('Belt exam form submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Error submitting application. Please try again.'
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
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce">
              <FaCheckCircle className="text-white text-5xl" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Thank You! 🎉
          </h1>
          
          <p className="text-xl text-gray-700 mb-6">
            Your belt exam application has been successfully submitted!
          </p>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-8">
            <p className="text-gray-800 text-lg leading-relaxed">
              Good luck with your <span className="font-bold text-red-600">belt examination</span>! 
              We'll contact you with the exam date and venue details within <span className="font-semibold">48 hours</span>.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FaHome className="mr-2" />
            Go to Home Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section 
        className="hero-section mobile-hero-fix relative py-20 sm:py-24 min-h-[60vh] flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url(${image})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
         
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white">
            Belt <span className="text-white">Examination</span> <span className="text-white">Form</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white max-w-4xl mx-auto leading-relaxed">
            Register for your next belt level examination. Complete the form below to secure your spot.
          </p>
        </div>
      </section>

      <div className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Form Header */}
            <div className="p-8 text-center" style={{ backgroundColor: '#006CB5' }}>
              <div className="flex items-center justify-center mb-2">
                <FaMedal className="text-4xl mr-3 text-white" />
                <h2 style={{ color: 'white', fontSize: '1.875rem', fontWeight: 'bold' }}>Individual Colour Belt Exam Form</h2>
              </div>
              <p className="text-white text-opacity-90">All fields marked with * are required</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-6">
              {/* Status Message */}
              {submitStatus && (
                <div className={`p-4 rounded-xl mb-6 ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {submitStatus.message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name of Candidate */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Name of Candidate (In Capital Letters) *
                  </label>
                  <input
                    type="text"
                    name="candidateName"
                    value={formData.candidateName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 uppercase"
                    placeholder="ENTER CANDIDATE NAME"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Date of Birth *
                    {formData.age && (
                      <span className={`ml-2 text-sm ${parseInt(formData.age) >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                        (Age: {formData.age} years {parseInt(formData.age) < 3 ? '- Too young!' : '- Valid'})
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 ${
                      formData.age && parseInt(formData.age) < 3
                        ? 'border-red-300 bg-red-50'
                        : 'border-slate-200'
                    }`}
                  />
                  {formData.age && parseInt(formData.age) < 3 && (
                    <p className="text-red-600 text-sm mt-1">
                      ⚠️ Candidate must be at least 3 years old for belt exam
                    </p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Age
                  </label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    readOnly
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 ${
                      formData.age && parseInt(formData.age) < 3
                        ? 'bg-red-50 border-red-300'
                        : 'bg-gray-50 border-slate-200'
                    }`}
                    placeholder="Auto-calculated"
                  />
                </div>

                {/* Gender */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Gender *
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={formData.gender === 'Male'}
                        onChange={handleInputChange}
                        required
                        className="w-5 h-5 text-amber-500 border-2 border-slate-300 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-slate-700">Male</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={formData.gender === 'Female'}
                        onChange={handleInputChange}
                        required
                        className="w-5 h-5 text-amber-500 border-2 border-slate-300 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-slate-700">Female</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Other"
                        checked={formData.gender === 'Other'}
                        onChange={handleInputChange}
                        required
                        className="w-5 h-5 text-amber-500 border-2 border-slate-300 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-slate-700">Other</span>
                    </label>
                  </div>
                </div>

                {/* Parent/Guardian Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Parent / Guardian name *
                  </label>
                  <input
                    type="text"
                    name="parentGuardianName"
                    value={formData.parentGuardianName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter parent/guardian name"
                  />
                </div>

                {/* Address & Phone No */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Address: *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Enter complete address"
                  ></textarea>
                </div>

{/* District */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Dist:
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter district"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    State:
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter state"
                  />
                </div>
                
                {/* Phone Number */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                {/* Gmail */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Gmail: *
                  </label>
                  <input
                    type="email"
                    name="gmail"
                    value={formData.gmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="your.email@gmail.com"
                  />
                </div>

                {/* Appearing for grade/Kup */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Appearing for grade/ Kup: *
                  </label>
                  <input
                    type="text"
                    name="appearingForGrade"
                    value={formData.appearingForGrade}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter grade/kup appearing for"
                  />
                </div>

                {/* Present Belt/Grade */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Present Belt /Grade: *
                  </label>
                  <input
                    type="text"
                    name="presentBelt"
                    value={formData.presentBelt}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter current belt/grade"
                  />
                </div>

                {/* Name of School/College/University */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Name of the School/College/University:
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter school/college/university name"
                  />
                </div>

                {/* Academic Qualification */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Academic Qualification:
                  </label>
                  <input
                    type="text"
                    name="academicQualification"
                    value={formData.academicQualification}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter academic qualification"
                  />
                </div>

                {/* Instructor's Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Instructor's Name:
                  </label>
                  <input
                    type="text"
                    name="instructorName"
                    value={formData.instructorName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter instructor's name"
                  />
                </div>

                {/* Photo Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Upload Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-amber-500 transition-all duration-300 bg-slate-50 hover:bg-amber-50">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                            <FaUser className="text-amber-600 text-2xl" />
                          </div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">
                            {formData.photo ? formData.photo.name : 'Click to upload photo'}
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        name="photo"
                        onChange={handleInputChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                    {formData.photo && (
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 border-2 border-slate-200 rounded-lg overflow-hidden">
                          <img 
                            src={URL.createObjectURL(formData.photo)} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms and Agreements */}
              <div className="border-t-2 border-slate-200 pt-6 mt-8">
                <div className="flex items-start space-x-3 mb-6">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    required
                    className="w-5 h-5 text-amber-500 border-2 border-slate-300 rounded focus:ring-amber-500 mt-1"
                  />
                  <label className="text-sm text-slate-600 leading-relaxed">
                    <strong>I agree to the terms and conditions *</strong> - I Undersigned do hereby solemnly affirm, declare and confirm for myself, executors and administrators, that I indemnify the organiser, officials, participants, etc., holding myself personally responsible for damages, injuries, accidents, claims, demand etc., waving all prerogative rights, whatever related to the above set forth events.
                  </label>
                </div>
                
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg text-white ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'hover:shadow-xl hover:scale-105 hover:opacity-90'
                    }`}
                    style={{
                      backgroundColor: isSubmitting ? '' : '#006CB5',
                      color: 'white'
                    }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center text-white">
                        <FaSpinner className="mr-2 animate-spin text-white" />
                        Submitting Application...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center text-white">
                        <FaPaperPlane className="mr-2 text-white" />
                        Submit Application
                      </span>
                    )}
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    We'll contact you with exam details within 48 hours
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

export default BeltExam;
