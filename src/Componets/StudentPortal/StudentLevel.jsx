import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { FaMedal, FaCheckCircle, FaAward, FaCalendarAlt } from "react-icons/fa";

const StudentLevel = () => {
  const navigate = useNavigate();
  const [currentBelt, setCurrentBelt] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [beltLevels, setBeltLevels] = useState([]);
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("belt-levels"); // belt-levels, promotions, upcoming
  const [expandedBelt, setExpandedBelt] = useState(null); // Track which belt is expanded
  const [viewingCertificate, setViewingCertificate] = useState(null); // Track certificate being viewed

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/api";

  // Debug log for upcomingTests
  useEffect(() => {
    console.log("🎯 upcomingTests state updated:", upcomingTests);
    console.log("🎯 upcomingTests length:", upcomingTests.length);
  }, [upcomingTests]);

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      navigate("/verify-certificate");
      return;
    }
    loadLevelData();
  }, []);

  const loadLevelData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("studentToken");

      // Get current belt from profile
      const profileResponse = await fetch(`${API_BASE_URL}/students/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.status === "success") {
          setCurrentBelt(profileData.data.currentBeltLevel);
        }
      }

      // Get promotion history
      const promotionsResponse = await fetch(
        `${API_BASE_URL}/student-portal/promotions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (promotionsResponse.ok) {
        const promotionsData = await promotionsResponse.json();
        if (promotionsData.status === "success") {
          setPromotions(promotionsData.data?.promotions || []);
        }
      }

      // Get all belt levels
      try {
        const beltsResponse = await fetch(`${API_BASE_URL}/belts-public`);
        if (beltsResponse.ok) {
          const beltsData = await beltsResponse.json();
          if (beltsData.status === "success") {
            setBeltLevels(beltsData.data?.belts || []);
          }
        }
      } catch (error) {
        console.log("Could not load belt levels:", error);
      }

      // Get upcoming tests for logged-in student only
      try {
        console.log(
          "🔄 Fetching upcoming tests for logged-in student from:",
          `${API_BASE_URL}/student-portal/upcoming-tests`,
        );
        const testsResponse = await fetch(
          `${API_BASE_URL}/student-portal/upcoming-tests`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        console.log("📊 Tests response status:", testsResponse.status);

        if (testsResponse.ok) {
          const testsData = await testsResponse.json();
          console.log("📊 Tests data received:", testsData);
          console.log("📊 Tests array:", testsData.data?.tests);
          console.log("📊 Tests count:", testsData.data?.tests?.length);

          if (testsData.status === "success") {
            const tests = testsData.data?.tests || [];
            console.log("✅ Setting upcoming tests from database:", tests);
            setUpcomingTests(tests);
          } else {
            console.error("❌ Tests response not successful:", testsData);
          }
        } else {
          console.error("❌ Tests response not OK:", testsResponse.status);
          const errorData = await testsResponse.json();
          console.error("❌ Error data:", errorData);
        }
      } catch (error) {
        console.error("❌ Error loading upcoming tests:", error);
      }
    } catch (error) {
      console.error("Error loading level data:", error);
    } finally {
      setLoading(false);
    }
  };

  const isStripeBelt = (beltName) => {
    return beltName?.toLowerCase().includes("stripe");
  };

  const getStripeColors = (beltName) => {
    const name = beltName?.toLowerCase() || "";
    if (name.includes("white") && name.includes("yellow")) {
      return { color1: "#FFFFFF", color2: "#FFD700" };
    }
    if (name.includes("yellow") && name.includes("green")) {
      return { color1: "#FFD700", color2: "#22C55E" };
    }
    if (name.includes("green") && name.includes("blue")) {
      return { color1: "#22C55E", color2: "#3B82F6" };
    }
    if (name.includes("blue") && name.includes("red")) {
      return { color1: "#3B82F6", color2: "#EF4444" };
    }
    if (name.includes("red") && name.includes("black")) {
      return { color1: "#EF4444", color2: "#000000" };
    }
    return null;
  };

  const getBeltColor = (beltName) => {
    const belt = beltName?.toLowerCase() || "";
    if (belt.includes("white")) return "bg-white border-gray-400 text-gray-800";
    if (belt.includes("yellow"))
      return "bg-yellow-400 border-yellow-600 text-gray-800";
    if (belt.includes("green"))
      return "bg-green-500 border-green-700 text-white";
    if (belt.includes("blue")) return "bg-blue-500 border-blue-700 text-white";
    if (belt.includes("purple"))
      return "bg-purple-500 border-purple-700 text-white";
    if (belt.includes("black")) return "bg-black border-gray-800 text-white";
    return "bg-gray-300 border-gray-500 text-gray-800";
  };

  const getBeltTextColor = (hexColor) => {
    if (!hexColor) return "text-gray-800";

    // Remove # if present
    const hex = hexColor.replace("#", "");

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return dark text for light colors, white text for dark colors
    return luminance > 0.5 ? "text-gray-800" : "text-white";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#006CB5]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-b-3xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/student/dashboard")}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
            >
              <IoMdArrowBack className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">My Belt Level</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Mode Tabs */}
        <div className="bg-white rounded-xl shadow-md p-2 mb-6 grid grid-cols-3 gap-2">
          <button
            onClick={() => setViewMode("belt-levels")}
            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
              viewMode === "belt-levels"
                ? "bg-[#006CB5] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Belt Levels
          </button>
          <button
            onClick={() => setViewMode("promotions")}
            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
              viewMode === "promotions"
                ? "bg-[#006CB5] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Promotions
          </button>
          <button
            onClick={() => setViewMode("upcoming")}
            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
              viewMode === "upcoming"
                ? "bg-[#006CB5] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Upcoming
          </button>
        </div>

        {/* Content */}
        {viewMode === "belt-levels" ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                All Belt Levels
              </h3>
            </div>

            {beltLevels.length === 0 ? (
              <div className="p-12 text-center">
                <FaMedal className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">
                  No belt levels available
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {beltLevels.map((belt, index) => (
                  <div key={index} className="transition-colors">
                    <div
                      className="p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        setExpandedBelt(expandedBelt === index ? null : index)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {isStripeBelt(belt.name) ? (
                            // Stripe belt - show 70% main color, 30% stripe color
                            <div className="w-16 h-16 rounded-full border-2 border-gray-800 flex overflow-hidden">
                              <div
                                className="flex items-center justify-center"
                                style={{
                                  backgroundColor: getStripeColors(belt.name)
                                    ?.color1,
                                  width: "70%",
                                }}
                              ></div>
                              <div
                                className="flex items-center justify-center"
                                style={{
                                  backgroundColor: getStripeColors(belt.name)
                                    ?.color2,
                                  width: "30%",
                                }}
                              ></div>
                            </div>
                          ) : (
                            // Solid color belt in circle
                            <div
                              className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${!belt.hex ? getBeltColor(belt.name) : ""}`}
                              style={{
                                backgroundColor: belt.hex || undefined,
                                borderColor: belt.hex || undefined,
                              }}
                            >
                              <span
                                className={`text-xs font-bold drop-shadow ${belt.hex ? getBeltTextColor(belt.hex) : ""}`}
                              >
                                {belt.name?.split(" ")[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {belt.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Level {belt.level}
                            </p>
                            {belt.requirements &&
                              belt.requirements.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {belt.requirements.length} requirements
                                </p>
                              )}
                          </div>
                        </div>
                        <div className="text-gray-400">
                          {expandedBelt === index ? "▼" : "▶"}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Requirements Section */}
                    {expandedBelt === index &&
                      belt.requirements &&
                      belt.requirements.length > 0 && (
                        <div className="px-4 pb-4 bg-gray-50">
                          <div className="border-t border-gray-200 pt-3">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              Requirements:
                            </h4>
                            <ul className="space-y-2">
                              {belt.requirements.map((req, reqIndex) => (
                                <li
                                  key={reqIndex}
                                  className="flex items-start space-x-2"
                                >
                                  <FaCheckCircle className="w-4 h-4 text-[#006CB5] mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-600">
                                    {req}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : viewMode === "upcoming" ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                Upcoming Belt Tests
              </h3>
            </div>

            {upcomingTests.length === 0 ? (
              <div className="p-12 text-center">
                <FaCalendarAlt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">
                  No upcoming tests scheduled
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {upcomingTests.map((test, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {test.studentName}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-600">
                            {test.currentBelt}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm font-semibold text-[#006CB5]">
                            {test.testingFor}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(test.testDate)}
                        </p>
                        {test.certificateCode && (
                          <p className="text-xs text-gray-500 mt-1">
                            Certificate: {test.certificateCode}
                          </p>
                        )}
                      </div>
                      {test.certificateFile && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const baseUrl = API_BASE_URL.replace("/api", "");
                              const filePath = test.certificateFile.startsWith(
                                "/",
                              )
                                ? test.certificateFile
                                : `/${test.certificateFile}`;
                              setViewingCertificate({
                                url: `${baseUrl}${filePath}`,
                                code: test.certificateCode,
                                studentName: test.studentName,
                              });
                            }}
                            className="px-3 py-2 bg-[#006CB5] hover:bg-[#005a9c] rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                            style={{ color: "#ffffff" }}
                          >
                            <FaCheckCircle
                              className="w-4 h-4"
                              style={{ color: "#ffffff" }}
                            />
                            <span style={{ color: "#ffffff" }}>View</span>
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const baseUrl = API_BASE_URL.replace(
                                  "/api",
                                  "",
                                );
                                const filePath =
                                  test.certificateFile.startsWith("/")
                                    ? test.certificateFile
                                    : `/${test.certificateFile}`;
                                const fileUrl = `${baseUrl}${filePath}`;

                                // Fetch the file
                                const response = await fetch(fileUrl);
                                const blob = await response.blob();

                                // Create download link
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `certificate-${test.certificateCode || "download"}.${test.certificateFile.split(".").pop()}`;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                              } catch (error) {
                                console.error("Download failed:", error);
                                alert(
                                  "Failed to download certificate. Please try again.",
                                );
                              }
                            }}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                          >
                            <FaAward className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                Promotion History
              </h3>
            </div>

            {promotions.length === 0 ? (
              <div className="p-12 text-center">
                <FaAward className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">
                  No promotion history yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {promotions.map((promo, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {isStripeBelt(promo.toBelt) ? (
                          // Stripe belt - show 70% main color, 30% stripe color
                          <div className="w-16 h-16 rounded-full border-2 border-gray-800 flex overflow-hidden">
                            <div
                              className="flex items-center justify-center"
                              style={{
                                backgroundColor: getStripeColors(promo.toBelt)
                                  ?.color1,
                                width: "70%",
                              }}
                            ></div>
                            <div
                              className="flex items-center justify-center"
                              style={{
                                backgroundColor: getStripeColors(promo.toBelt)
                                  ?.color2,
                                width: "30%",
                              }}
                            ></div>
                          </div>
                        ) : (
                          // Solid color belt
                          <div
                            className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${getBeltColor(promo.toBelt)}`}
                          >
                            <span className="text-xs font-bold drop-shadow">
                              {promo.toBelt?.split(" ")[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {promo.fromBelt} → {promo.toBelt}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(promo.promotionDate)}
                          </p>
                        </div>
                      </div>
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        Promoted
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Certificate Viewer Modal */}
      {viewingCertificate && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingCertificate(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setViewingCertificate(null)}
              className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 text-gray-800 p-2 rounded-full shadow-lg transition-all border border-gray-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Certificate Image */}
            <div className="overflow-auto max-h-[90vh] bg-white rounded-lg">
              <img
                src={viewingCertificate.url}
                alt="Certificate"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLevel;
