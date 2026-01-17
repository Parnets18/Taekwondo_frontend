import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import img from '../../assets/img.jpg';
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaClock, 
  FaPaperPlane,
  FaUser,
  FaQuestionCircle,
  FaCheckCircle,
  FaSpinner,
  FaHome
} from 'react-icons/fa';

function Contact() {
  const navigate = useNavigate();
  const [showThankYou, setShowThankYou] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: ''
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
    if (!formData.name || !formData.email || !formData.inquiryType || !formData.message) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all required fields.'
      });
      return;
    }

    // Message length validation
    if (formData.message.trim().length < 10) {
      setSubmitStatus({
        type: 'error',
        message: 'Message must be at least 10 characters long.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Send to backend API
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        // Try to parse error response
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.errors && errorData.errors.length > 0) {
          // Show first validation error
          throw new Error(errorData.errors[0].msg || 'Validation failed');
        }
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        // Show thank you card
        setShowThankYou(true);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          inquiryType: '',
          message: ''
        });

        // Redirect to home page after 5 minutes (300 seconds)
        setTimeout(() => {
          navigate('/');
        }, 300000);
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      
      // Try to get specific error message from response
      let errorMessage = 'Error sending message. Please try again.';
      
      if (error.message && error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check your connection and try again.';
      }
      
      setSubmitStatus({
        type: 'error',
        message: errorMessage
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
            Your message has been successfully sent!
          </p>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-8">
            <p className="text-gray-800 text-lg leading-relaxed">
              We appreciate you reaching out to us! Our team will carefully review your message and 
              get back to you within <span className="font-semibold">24 hours</span>. 
              Thank you for your interest in our <span className="font-bold text-red-600">Taekwon-Do programs</span>!
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
              <span>We'll respond to your inquiry soon</span>
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
    <div>
      {/* Hero Section */}
      <section 
        className="hero-section mobile-hero-fix relative py-20 sm:py-24 min-h-[60vh] flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url(${img})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white">
            Get In <span className="text-white">Touch</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white max-w-4xl mx-auto leading-relaxed">
            Ready to start your martial arts journey? Have questions about our programs? 
            We're here to help you every step of the way.
          </p>
        </div>
      </section>

      <div className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Information */}
            <div>
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-6">Contact Information</h2>
                
                <div className="space-y-5">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FaMapMarkerAlt className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-black mb-1">Academy Location</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Combat Warrior Taekwon-do Association<br />
                        Karnataka, India
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FaPhone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-black mb-1">Phone Number</h3>
                      <p className="text-sm text-gray-700 font-semibold">+91 9019157225</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FaEnvelope className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-black mb-1">Email Address</h3>
                      <p className="text-sm text-gray-700">hello@parnetsgroup.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FaClock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-black mb-1">Training Schedule</h3>
                      <div className="text-sm text-gray-700">
                        <p className="mb-1"><strong>Mon-Fri:</strong> 6:00 AM - 8:00 PM</p>
                        <p><strong>Sat-Sun:</strong> 8:00 AM - 6:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2 text-white">Send us a Message</h2>
                <p className="text-base text-slate-300">We'll get back to you soon</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Status Message */}
                {submitStatus && (
                  <div className={`p-4 rounded-lg mb-4 ${
                    submitStatus.type === 'success' 
                      ? 'bg-green-50 border border-green-200 text-green-700' 
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    <div className="flex items-center">
                      {submitStatus.type === 'success' ? (
                        <FaCheckCircle className="mr-2" />
                      ) : (
                        <FaQuestionCircle className="mr-2" />
                      )}
                      <span className="text-sm">{submitStatus.message}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Inquiry Type *
                  </label>
                  <select 
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Select inquiry type</option>
                    <option value="admission">Admission Information</option>
                    <option value="courses">Course Details</option>
                    <option value="trial">Trial Class</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Message * (minimum 10 characters)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Tell us about your interest in Taekwon-do... (minimum 10 characters)"
                  ></textarea>
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.message.length}/2000 characters {formData.message.length < 10 && formData.message.length > 0 && '(minimum 10 required)'}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-lg font-bold text-base transition-all duration-300 shadow-lg touch-manipulation cursor-pointer relative z-10 active:scale-95 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700'
                  }`}
                  style={{
                    minHeight: '52px',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  <span className="flex items-center justify-center">
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-2" />
                        Send Message
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* Google Map Section */}
          <div className="mt-24 flex justify-center">
            <div className="w-full max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-black mb-6">
                  Find <span className="text-red-600">Our</span> <span className="text-yellow-600">Location</span>
                </h2>
                <p className="text-base text-gray-700">Visit our dojang and experience authentic Taekwon-Do training</p>
              </div>
              
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="h-80 bg-gray-200 flex items-center justify-center">
                  {/* Google Map Embed - Replace with actual Google Maps embed code */}
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.886539092!2d77.49085452148641!3d12.953945614117967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1703123456789!5m2!1sen!2sin"
                    width="100%"
                    height="320"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-80"
                    title="Combat Warrior Taekwon-Do Location"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-24 bg-white rounded-3xl p-12 shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-6">
                Frequently Asked <span className="text-red-600">Questions</span>
              </h2>
              <p className="text-base text-gray-700">Quick answers to common questions about our academy</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-6 rounded-2xl transform hover:scale-105 hover:rotate-1 transition-all duration-500 group"
                   style={{
                     transform: 'rotateX(5deg)',
                     transformStyle: 'preserve-3d'
                   }}>
                <div className="flex items-center mb-3">
                  <FaUser className="text-amber-500 mr-2 group-hover:animate-bounce" />
                  <h4 className="font-bold text-black">What age groups do you accept?</h4>
                </div>
                <p className="text-base text-gray-700">We welcome students from 6 years old to adults. Our programs are designed for all age groups and fitness levels.</p>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl transform hover:scale-105 hover:-rotate-1 transition-all duration-500 group"
                   style={{
                     transform: 'rotateX(-5deg)',
                     transformStyle: 'preserve-3d'
                   }}>
                <div className="flex items-center mb-3">
                  <FaQuestionCircle className="text-amber-500 mr-2 group-hover:animate-pulse" />
                  <h4 className="font-bold text-black">Do I need prior experience?</h4>
                </div>
                <p className="text-base text-gray-700">No prior experience is required. Our Foundation Level program is perfect for complete beginners.</p>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl transform hover:scale-105 hover:rotate-1 transition-all duration-500 group"
                   style={{
                     transform: 'rotateX(5deg)',
                     transformStyle: 'preserve-3d'
                   }}>
                <div className="flex items-center mb-3">
                  <FaCheckCircle className="text-amber-500 mr-2 group-hover:animate-spin" />
                  <h4 className="font-bold text-black">What should I bring to class?</h4>
                </div>
                <p className="text-base text-gray-700">Just comfortable workout clothes and a water bottle. We provide all necessary equipment for beginners.</p>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl transform hover:scale-105 hover:-rotate-1 transition-all duration-500 group"
                   style={{
                     transform: 'rotateX(-5deg)',
                     transformStyle: 'preserve-3d'
                   }}>
                <div className="flex items-center mb-3">
                  <FaCheckCircle className="text-amber-500 mr-2 group-hover:animate-bounce" />
                  <h4 className="font-bold text-black">Can I try a class before enrolling?</h4>
                </div>
                <p className="text-base text-gray-700">Yes! We offer free trial classes so you can experience our training before making a commitment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;