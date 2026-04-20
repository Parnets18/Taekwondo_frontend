import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import img1 from "../../assets/img1.jpg";
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
  FaSpinner,
} from "react-icons/fa";

function Courses() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://cwtakarnataka.com/api";

  // Fetch courses from backend
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/courses?isActive=true`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();

      if (data.status === "success") {
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
          status: course.status,
        }));

        setPrograms(transformedCourses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses. Please try again later.");
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  // Get color gradient for course cards based on index
  const getColorForIndex = (index) => {
    const colors = [
      "from-sky-400 to-blue-500",
      "from-blue-400 to-blue-600",
      "from-green-400 to-green-600",
      "from-cyan-400 to-cyan-600",
      "from-indigo-400 to-indigo-600",
      "from-teal-400 to-teal-500",
    ];
    return colors[index % colors.length];
  };

  // Load courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const belts = [
    {
      name: "White Belt",
      requirements: "Basic stances, blocks, and kicks",
      duration: "2-3 months",
      bgColor: "#FFFFFF",
      borderColor: "#9CA3AF",
    },
    {
      name: "White Belt / Yellow Stripe",
      requirements: "Chon-Ji pattern introduction",
      duration: "2-3 months",
      bgColor: "linear-gradient(to right, #FFFFFF 70%, #FACC15 70%)",
      borderColor: "#D1D5DB",
    },
    {
      name: "Yellow Belt",
      requirements: "Chon-Ji pattern, basic combinations",
      duration: "3-4 months",
      bgColor: "#FACC15",
      borderColor: "#EAB308",
    },
    {
      name: "Yellow Belt / Green Stripe",
      requirements: "Dan-Gun pattern introduction",
      duration: "3-4 months",
      bgColor: "linear-gradient(to right, #FACC15 70%, #16A34A 70%)",
      borderColor: "#16A34A",
    },
    {
      name: "Green Belt",
      requirements: "Dan-Gun pattern, intermediate techniques",
      duration: "4-5 months",
      bgColor: "#16A34A",
      borderColor: "#15803D",
    },
    {
      name: "Green Belt / Blue Stripe",
      requirements: "Do-San pattern introduction",
      duration: "4-5 months",
      bgColor: "linear-gradient(to right, #16A34A 70%, #1D4ED8 70%)",
      borderColor: "#1D4ED8",
    },
    {
      name: "Blue Belt",
      requirements: "Do-San pattern, advanced kicks",
      duration: "5-6 months",
      bgColor: "#1D4ED8",
      borderColor: "#1E40AF",
    },
    {
      name: "Blue Belt / Red Stripe",
      requirements: "Won-Hyo pattern introduction",
      duration: "5-6 months",
      bgColor: "linear-gradient(to right, #1D4ED8 70%, #DC2626 70%)",
      borderColor: "#DC2626",
    },
    {
      name: "Red Belt",
      requirements: "Won-Hyo pattern, sparring techniques",
      duration: "6-8 months",
      bgColor: "#DC2626",
      borderColor: "#B91C1C",
    },
    {
      name: "Red Belt / Black Stripe",
      requirements: "Yul-Gok pattern, black belt preparation",
      duration: "8-10 months",
      bgColor: "linear-gradient(to right, #DC2626 70%, #000000 70%)",
      borderColor: "#000000",
    },
    {
      name: "Black Belt 1st Dan",
      requirements: "All color belt patterns, breaking",
      duration: "12+ months",
      bgColor: "#000000",
      borderColor: "#4B5563",
    },
    {
      name: "Black Belt 2nd Dan",
      requirements: "Advanced patterns, teaching fundamentals",
      duration: "2 years min",
      bgColor: "#000000",
      borderColor: "#4B5563",
    },
    {
      name: "Black Belt 3rd Dan",
      requirements: "Instructor level, advanced sparring",
      duration: "3 years min",
      bgColor: "#000000",
      borderColor: "#4B5563",
    },
    {
      name: "Black Belt 4th Dan",
      requirements: "Senior instructor, pattern mastery",
      duration: "4 years min",
      bgColor: "#000000",
      borderColor: "#4B5563",
    },
    {
      name: "Black Belt 5th Dan",
      requirements: "Master level, advanced theory & teaching",
      duration: "5 years min",
      bgColor: "#000000",
      borderColor: "#4B5563",
    },
    {
      name: "Black Belt 6th Dan",
      requirements: "Senior Master, national contribution",
      duration: "6 years min",
      bgColor: "#000000",
      borderColor: "#4B5563",
    },
    {
      name: "Black Belt 7th Dan",
      requirements: "Grand Master candidate, international recognition",
      duration: "7 years min",
      bgColor: "#000000",
      borderColor: "#4B5563",
    },
    {
      name: "Black Belt 8th Dan",
      requirements: "Grand Master, lifetime achievement",
      duration: "8 years min",
      bgColor: "#000000",
      borderColor: "#4B5563",
    },
    {
      name: "Black Belt 9th Dan",
      requirements: "Supreme Grand Master, highest honor",
      duration: "Lifetime",
      bgColor: "#000000",
      borderColor: "#4B5563",
    },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-yellow-50 to-white"
      style={{ perspective: "1000px" }}
    >
      {/* Hero Section */}
      <section
        className="hero-section mobile-hero-fix relative py-20 sm:py-24 min-h-[60vh] flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${img1})`,
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "scroll",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white">
            Training <span className="text-white">Programs</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white max-w-4xl mx-auto leading-relaxed">
            Discover our comprehensive Taekwon-Do programs designed for every
            age and skill level. From beginners to black belts, we have the
            perfect program for your martial arts journey.
          </p>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mr-4" />
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
              <div className="text-blue-600 text-xl mb-4">{error}</div>
              <button
                onClick={fetchCourses}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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
                <span style={{ color: "#006CB5" }}>Our</span>{" "}
                <span style={{ color: "#006CB5" }}>Programs</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Choose from our comprehensive range of Taekwon-Do programs
                designed for all ages and skill levels. Each program is
                carefully structured to provide the best learning experience.
              </p>
            </div>

            {programs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                  No courses available at the moment
                </div>
                <p className="text-gray-400 mt-2">
                  Please check back later or contact us for more information
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {programs.map((program, index) => (
                  <div
                    key={program.id || index}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6">
                      <h3
                        className="text-2xl font-bold mb-3"
                        style={{ color: "#006CB5" }}
                      >
                        {program.title}
                      </h3>
                      <div className="mb-3">
                        <span
                          className="bg-white px-4 py-2 rounded-full text-sm font-bold shadow-md inline-block"
                          style={{ color: "#006CB5" }}
                        >
                          {program.ageGroup}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {program.description}
                      </p>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <span className="text-gray-700 font-medium">
                              Duration:
                            </span>
                          </div>
                          <span className="font-bold text-gray-900">
                            {program.duration}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <span className="text-gray-700 font-medium">
                              Schedule:
                            </span>
                          </div>
                          <span className="font-bold text-gray-900 text-sm">
                            {program.schedule}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                          <div className="flex items-center">
                            <span className="text-gray-700 font-medium">
                              Price:
                            </span>
                          </div>
                          <span className="font-bold text-gray-900">
                            {program.price}
                          </span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-bold text-gray-900 mb-3">
                          What You'll Learn:
                        </h4>
                        <ul className="space-y-2">
                          {program.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start text-sm text-gray-700"
                            >
                              <span className="mr-2">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Link
                        to="/admission"
                        className="block w-full text-center text-white py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        style={{ backgroundColor: "#006CB5" }}
                      >
                        <span className="flex items-center justify-center text-white">
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
      <section className="py-12 bg-gradient-to-r from-blue-50 to-sky-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 transform hover:scale-105 transition-all duration-500">
            <h2 className="text-4xl font-bold mb-3 flex items-center justify-center">
              <span style={{ color: "#006CB5" }}>ITF Belt System</span>
            </h2>
            <p className="text-lg text-gray-700">
              Progress through the traditional ranking system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {belts.map((belt, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-4 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
              >
                <div className="flex items-center mb-3">
                  <div
                    className="w-12 h-12 rounded-full mr-3 shadow-lg flex-shrink-0"
                    style={{
                      background: belt.bgColor,
                      border: `3px solid ${belt.borderColor}`,
                    }}
                  ></div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {belt.name}
                  </h3>
                </div>
                <p className="text-gray-600 mb-3 leading-relaxed text-sm">
                  {belt.requirements}
                </p>
                <div className="flex items-center p-2 bg-blue-50 rounded-lg">
                  <span className="text-gray-700 font-medium text-xs">
                    Duration:
                  </span>
                  <span className="ml-auto font-bold text-gray-900 text-xs">
                    {belt.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-2xl font-bold text-black">
                Ready to Start Your Training?
              </h2>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              Choose the program that's right for you and begin your martial
              arts journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/admission"
                className="text-white px-8 py-3 rounded-xl text-base font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                style={{ backgroundColor: "#006CB5" }}
              >
                <FaBolt className="mr-2 text-white" />
                <span className="text-white">Enroll Now</span>
              </Link>
              <Link
                to="/contact"
                className="border-2 px-8 py-3 rounded-xl text-base font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                style={{ borderColor: "#006CB5", color: "#006CB5" }}
              >
                <FaCalendarAlt className="mr-2" style={{ color: "#006CB5" }} />
                <span style={{ color: "#006CB5" }}>Schedule a Visit</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Courses;
