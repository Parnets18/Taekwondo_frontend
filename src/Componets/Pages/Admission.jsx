import { useState } from "react";
import { useNavigate } from "react-router-dom";
import image from "../../assets/admission.jpg";
import {
  FaUser,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaHeartbeat,
  FaCheckCircle,
  FaPaperPlane,
  FaSpinner,
  FaHome,
  FaStar,
} from "react-icons/fa";

function Admission() {
  const navigate = useNavigate();
  const [showThankYou, setShowThankYou] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    fatherName: "",
    motherName: "",
    residentialAddress: "",
    mobileNumber: "",
    emergencyContact: "",
    email: "",
    aadhaarNumber: "",
    bloodGroup: "",
    height: "",
    weight: "",
    physicalDisorder: "",
    photo: null,
    agreeToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else if (name === "dateOfBirth") {
      // Auto-calculate age when date of birth changes
      const birthDate = new Date(value);
      const today = new Date();
      const calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      const finalAge =
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ? calculatedAge - 1
          : calculatedAge;

      setFormData((prev) => ({
        ...prev,
        dateOfBirth: value,
        age: finalAge > 0 ? finalAge.toString() : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name ||
      !formData.dateOfBirth ||
      !formData.gender ||
      !formData.fatherName ||
      !formData.motherName ||
      !formData.residentialAddress ||
      !formData.mobileNumber ||
      !formData.email ||
      !formData.agreeToTerms
    ) {
      setSubmitStatus({
        type: "error",
        message: "Please fill in all required fields and agree to terms.",
      });
      return;
    }

    // Age validation - must be at least 3 years old
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 3) {
      setSubmitStatus({
        type: "error",
        message: `Student must be at least 3 years old. Current age: ${age} years. Please check the date of birth.`,
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          formDataToSend.append(key, formData[key]);
        }
      });

      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "https://cwtakarnataka.com/api/api";
      const response = await fetch(`${API_BASE_URL}/admissions`, {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(
            (err) => err.msg || err.message || JSON.stringify(err),
          );
          throw new Error(errorMessages.join(", "));
        }
        throw new Error(data.message || "Failed to submit application");
      }

      setShowThankYou(true);

      // Reset form
      setFormData({
        name: "",
        dateOfBirth: "",
        age: "",
        gender: "",
        fatherName: "",
        motherName: "",
        residentialAddress: "",
        mobileNumber: "",
        emergencyContact: "",
        email: "",
        aadhaarNumber: "",
        bloodGroup: "",
        height: "",
        weight: "",
        physicalDisorder: "",
        photo: null,
        agreeToTerms: false,
      });

      setTimeout(() => {
        navigate("/");
      }, 300000);
    } catch (error) {
      console.error("Admission form submission error:", error);
      setSubmitStatus({
        type: "error",
        message:
          error.message || "Error submitting application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thank You Card Component
  if (showThankYou) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 p-4">
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
            Your admission application has been successfully submitted!
          </p>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-8">
            <p className="text-gray-800 text-lg leading-relaxed">
              We're excited to have you join our{" "}
              <span className="font-bold text-red-600">Taekwon-Do family</span>!
              Our team will carefully review your application and contact you
              within <span className="font-semibold">24-48 hours</span>.
            </p>
          </div>

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

          <div className="text-gray-500 text-sm mb-6">
            Redirecting to home page in 5 minutes...
          </div>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FaHome className="mr-2" />
            Go to Home Page
          </button>

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
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url(${image})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "scroll",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white">
            Join <span className="text-white">Combat</span>{" "}
            <span className="text-white">Warrior</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white max-w-4xl mx-auto leading-relaxed">
            Begin your martial arts journey with Karnataka's premier Taekwon-do
            academy. Complete the application below to secure your spot.
          </p>
        </div>
      </section>

      <div className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Form Header */}
            <div
              className="p-8 text-white text-center"
              style={{ backgroundColor: "#006CB5" }}
            >
              <div className="flex items-center justify-center mb-2">
                <FaGraduationCap className="text-4xl mr-3 text-white" />
                <h2
                  style={{
                    color: "white",
                    fontSize: "1.875rem",
                    fontWeight: "bold",
                  }}
                >
                  Student Admission Application
                </h2>
              </div>
              <p className="text-white text-opacity-90">
                All fields marked with * are required
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-6">
              {/* Status Message */}
              {submitStatus && (
                <div
                  className={`p-4 rounded-xl mb-6 ${
                    submitStatus.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  <div className="flex items-center">
                    {submitStatus.type === "success" ? (
                      <FaCheckCircle className="mr-2" />
                    ) : (
                      <FaUser className="mr-2" />
                    )}
                    {submitStatus.message}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    1. Name (in capital letters) *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 uppercase"
                    placeholder="ENTER YOUR FULL NAME"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    2. Date of Birth (dd/mm/yyyy) *
                    {formData.age && (
                      <span
                        className={`ml-2 text-sm ${parseInt(formData.age) >= 3 ? "text-green-600" : "text-red-600"}`}
                      >
                        (Age: {formData.age} years{" "}
                        {parseInt(formData.age) < 3
                          ? "- Too young!"
                          : "- Valid"}
                        )
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
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200"
                    }`}
                  />
                  {formData.age && parseInt(formData.age) < 3 && (
                    <p className="text-red-600 text-sm mt-1">
                      ⚠️ Student must be at least 3 years old for admission
                    </p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Age (yy/mm)
                  </label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    readOnly
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 ${
                      formData.age && parseInt(formData.age) < 3
                        ? "bg-red-50 border-red-300"
                        : "bg-gray-50 border-slate-200"
                    }`}
                    placeholder="Auto-calculated"
                  />
                </div>

                {/* Gender */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    3. Gender *
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={formData.gender === "Male"}
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
                        checked={formData.gender === "Female"}
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
                        checked={formData.gender === "Other"}
                        onChange={handleInputChange}
                        required
                        className="w-5 h-5 text-amber-500 border-2 border-slate-300 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-slate-700">Other</span>
                    </label>
                  </div>
                </div>

                {/* Father's Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    4. Father's Name *
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter father's name"
                  />
                </div>

                {/* Mother's Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    5. Mother's Name *
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter mother's name"
                  />
                </div>

                {/* Residential Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    6. Res. Address *
                  </label>
                  <textarea
                    name="residentialAddress"
                    value={formData.residentialAddress}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Enter complete residential address"
                  ></textarea>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    7. Contact No.(s) - Mob *
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                {/* Email ID */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    8. E-mail ID *
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

                {/* Aadhaar Card No */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    9. Aadhaar Card No
                  </label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleInputChange}
                    maxLength="12"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="XXXX XXXX XXXX"
                  />
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    10. Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                {/* Height */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    11. Height (Cms)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter height in cm"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Weight (Kgs)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter weight in kg"
                  />
                </div>

                {/* Physical Disorder */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    12. Physical disorder (if any)
                  </label>
                  <textarea
                    name="physicalDisorder"
                    value={formData.physicalDisorder}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Please mention any physical disorder or health condition"
                  ></textarea>
                </div>

                {/* Photo Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Upload Photo (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-amber-500 transition-all duration-300 bg-slate-50 hover:bg-amber-50">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-3">
                            <svg
                              className="w-8 h-8 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">
                            {formData.photo
                              ? formData.photo.name
                              : "Click to upload photo (optional)"}
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
                    {formData.photo ? (
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 border-2 border-slate-200 rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(formData.photo)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 border-2 border-slate-200 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
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
                    <strong>I agree to the terms and conditions *</strong> - I
                    understand that martial arts training involves physical
                    activity and inherent risks. I consent to emergency medical
                    treatment if necessary and agree to the academy's policies.
                  </label>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg text-white ${
                      isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "hover:shadow-xl hover:scale-105 hover:opacity-90"
                    }`}
                    style={{
                      backgroundColor: isSubmitting ? "" : "#006CB5",
                      color: "white",
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
                    We'll review your application and contact you within 24-48
                    hours
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
