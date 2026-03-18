import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaSignOutAlt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaCheckCircle,
  FaMedal,
  FaCertificate,
} from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("Student");
  const [currentBeltLevel, setCurrentBeltLevel] = useState("Loading...");
  const [pendingFees, setPendingFees] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://taekwondo-backend-j8w4.onrender.com/api";

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("studentToken");
    if (!token) {
      navigate("/verify-certificate");
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("studentToken");

      // Fetch profile data
      const profileResponse = await fetch(`${API_BASE_URL}/students/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.status === "success") {
          setStudentName(
            profileData.data.fullName || profileData.data.name || "Student",
          );
          setCurrentBeltLevel(profileData.data.currentBeltLevel || "N/A");
        }
      }

      // Fetch attendance data
      const attendanceResponse = await fetch(
        `${API_BASE_URL}/student-portal/attendance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        if (attendanceData.status === "success") {
          const records = attendanceData.data?.attendance || [];
          if (records.length > 0) {
            const presentCount = records.filter(
              (r) =>
                r.status &&
                (r.status.toLowerCase() === "present" ||
                  r.status.toLowerCase() === "late"),
            ).length;
            const percentage = Math.round(
              (presentCount / records.length) * 100,
            );
            setAttendancePercentage(percentage);
          }
        }
      }

      // Fetch fees data
      const feesResponse = await fetch(`${API_BASE_URL}/student-portal/fees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (feesResponse.ok) {
        const feesData = await feesResponse.json();
        if (feesData.status === "success") {
          const fees = feesData.data?.fees || feesData.fees || [];
          const pending = fees.filter(
            (f) =>
              f.status &&
              (f.status.toLowerCase() === "pending" ||
                f.status.toLowerCase() === "overdue"),
          ).length;
          setPendingFees(pending);
        }
      }

      // Fetch events data
      const eventsResponse = await fetch(
        `${API_BASE_URL}/student-portal/events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        if (eventsData.status === "success") {
          const events = eventsData.data?.events || [];
          setTotalEvents(events.length);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickOverview = [
    {
      title: `${pendingFees}`,
      subtitle: "Pending Fees",
      Icon: FaMoneyBillWave,
      color: pendingFees > 0 ? "#f39c12" : "#27ae60",
      bgColor: pendingFees > 0 ? "#fef9e7" : "#eafaf1",
      route: "/student/fees",
    },
    {
      title: `${totalEvents}`,
      subtitle: "Total Events",
      Icon: FaCalendarAlt,
      color: "#e74c3c",
      bgColor: "#ffeaea",
      route: "/student/events",
    },
    {
      title: `${attendancePercentage}%`,
      subtitle: "My Attendance",
      Icon: FaCheckCircle,
      color: attendancePercentage >= 75 ? "#27ae60" : "#f39c12",
      bgColor: attendancePercentage >= 75 ? "#eafaf1" : "#fef9e7",
      route: "/student/attendance",
    },
    {
      title: currentBeltLevel,
      subtitle: "My Belt Level",
      Icon: FaMedal,
      color: "#8e44ad",
      bgColor: "#f4ecf7",
      route: "/student/level",
    },
  ];

  const quickAccess = [
    {
      title: "Attendance",
      Icon: FaCheckCircle,
      color: "#e74c3c",
      route: "/student/attendance",
    },
    {
      title: "Level/Belt",
      Icon: FaMedal,
      color: "#e74c3c",
      route: "/student/level",
    },
    {
      title: "Events",
      Icon: FaCalendarAlt,
      color: "#e74c3c",
      route: "/student/events",
    },
    {
      title: "Certificates",
      Icon: FaCertificate,
      color: "#e74c3c",
      route: "/student/certificates",
    },
    {
      title: "Fees",
      Icon: FaMoneyBillWave,
      color: "#e74c3c",
      route: "/student/fees",
    },
  ];

  const handleLogout = () => {
    // Clear session and redirect to home
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentData");
    navigate("/");
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
      {/* Custom Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-b-3xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-yellow-400 shadow-md">
                <FaUser className="text-2xl text-[#006CB5]" />
              </div>
              <div>
                <p className="text-sm text-[#006CB5] font-semibold">Hello!</p>
                <h2 className="text-xl font-bold text-white">{studentName}</h2>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/student/profile")}
                className="flex flex-col items-center space-y-1 hover:opacity-80 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all">
                  <FaUser className="text-white text-lg" />
                </div>
                <span className="text-xs text-[#006CB5] font-semibold">
                  Profile
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="flex flex-col items-center space-y-1 hover:opacity-80 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all">
                  <FaSignOutAlt className="text-white text-lg" />
                </div>
                <span className="text-xs text-[#006CB5] font-semibold">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Overview Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickOverview.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.route)}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                style={{ borderLeft: `4px solid ${item.color}` }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto"
                  style={{ backgroundColor: item.bgColor }}
                >
                  <item.Icon
                    className="text-2xl"
                    style={{ color: item.color }}
                  />
                </div>
                <p className="text-3xl font-bold text-gray-900 text-center mb-1">
                  {item.title}
                </p>
                <p className="text-sm text-gray-600 font-semibold text-center">
                  {item.subtitle}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Access Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Access
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickAccess.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.route)}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: "#ffeaea" }}
                >
                  <item.Icon className="text-3xl text-[#006CB5]" />
                </div>
                <p className="text-sm text-gray-900 font-semibold text-center">
                  {item.title}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
