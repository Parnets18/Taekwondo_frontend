import { useState, useEffect } from "react";

function BeltExamManagement() {
  const [beltExams, setBeltExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    examStatus: "",
    search: "",
  });
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    scheduledApplications: 0,
    completedApplications: 0,
  });

  // Load belt exams from backend API
  useEffect(() => {
    const loadBeltExams = async () => {
      try {
        const token = localStorage.getItem("token");

        const API_BASE_URL =
          import.meta.env.VITE_API_BASE_URL || "https://cwtakarnataka.com/api/api";
        const response = await fetch(`${API_BASE_URL}/admin/belt-exams`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch belt exams");
        }

        const data = await response.json();
        const fetchedExams = data.data.beltExams || [];
        setBeltExams(fetchedExams);

        // Calculate stats
        const totalApplications = fetchedExams.length;
        const pendingApplications = fetchedExams.filter(
          (exam) => exam.examStatus === "pending",
        ).length;
        const scheduledApplications = fetchedExams.filter(
          (exam) => exam.examStatus === "scheduled",
        ).length;
        const completedApplications = fetchedExams.filter(
          (exam) =>
            exam.examStatus === "completed" ||
            exam.examStatus === "passed" ||
            exam.examStatus === "failed",
        ).length;

        setStats({
          totalApplications,
          pendingApplications,
          scheduledApplications,
          completedApplications,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error loading belt exams:", error);
        setBeltExams([]);
        setStats({
          totalApplications: 0,
          pendingApplications: 0,
          scheduledApplications: 0,
          completedApplications: 0,
        });
        setLoading(false);
      }
    };

    loadBeltExams();
  }, []);

  // Filter belt exams
  const filteredExams = beltExams.filter((exam) => {
    const matchesStatus =
      !filters.examStatus || exam.examStatus === filters.examStatus;
    const matchesSearch =
      !filters.search ||
      (exam.candidateName &&
        exam.candidateName
          .toLowerCase()
          .includes(filters.search.toLowerCase())) ||
      (exam.gmail &&
        exam.gmail.toLowerCase().includes(filters.search.toLowerCase())) ||
      (exam.phoneNumber &&
        exam.phoneNumber.toLowerCase().includes(filters.search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const viewExamDetails = (examId) => {
    const exam = beltExams.find((exam) => exam._id === examId);
    if (exam) {
      setSelectedExam(exam);
      setShowModal(true);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this belt exam application?",
      )
    ) {
      try {
        const token = localStorage.getItem("token");

        const API_BASE_URL =
          import.meta.env.VITE_API_BASE_URL || "https://cwtakarnataka.com/api/api";
        const response = await fetch(
          `${API_BASE_URL}/admin/belt-exams/${examId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const updatedExams = beltExams.filter((exam) => exam._id !== examId);
          setBeltExams(updatedExams);

          // Update stats
          const totalApplications = updatedExams.length;
          const pendingApplications = updatedExams.filter(
            (exam) => exam.examStatus === "pending",
          ).length;
          const scheduledApplications = updatedExams.filter(
            (exam) => exam.examStatus === "scheduled",
          ).length;
          const completedApplications = updatedExams.filter(
            (exam) =>
              exam.examStatus === "completed" ||
              exam.examStatus === "passed" ||
              exam.examStatus === "failed",
          ).length;

          setStats({
            totalApplications,
            pendingApplications,
            scheduledApplications,
            completedApplications,
          });

          alert("Belt exam application deleted successfully!");
        } else {
          throw new Error("Failed to delete belt exam");
        }
      } catch (err) {
        console.error("Error deleting belt exam:", err);
        alert("Error deleting belt exam. Please try again.");
      }
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-800 mb-2">
            Belt Exam Management
          </h1>
          <p className="text-slate-600">
            Review and manage belt examination applications
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Applications
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalApplications}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingApplications}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.scheduledApplications}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedApplications}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Exam Status
              </label>
              <select
                value={filters.examStatus}
                onChange={(e) =>
                  setFilters({ ...filters, examStatus: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Search by name, email, or phone..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Belt Exams Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading belt exams...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b-2 border-slate-300">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                        Photo
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                        Candidate Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                        Age
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                        Present Belt
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                        Appearing For
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                        Applied Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredExams.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No belt exam applications found
                        </td>
                      </tr>
                    ) : (
                      filteredExams.map((exam) => (
                        <tr
                          key={exam._id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            {exam.photo ? (
                              <img
                                src={`https://cwtakarnataka.com/${exam.photo.replace(/\\/g, "/").replace(/^.*uploads/, "uploads")}`}
                                alt={exam.candidateName}
                                className="w-12 h-12 rounded-full object-cover border-2 border-slate-300"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                {(exam.candidateName || "U").charAt(0)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 uppercase">
                              {exam.candidateName}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-700">
                              {exam.phoneNumber}
                            </div>
                            <div className="text-xs text-slate-500">
                              {exam.gmail}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-800 font-semibold">
                              {exam.age || calculateAge(exam.dateOfBirth)} yrs
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-700 font-medium">
                              {exam.presentBelt}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-700 font-medium">
                              {exam.appearingForGrade}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm">
                            {new Date(exam.submittedAt).toLocaleDateString(
                              "en-GB",
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-3">
                              <button
                                onClick={() => viewExamDetails(exam._id)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                title="View Details"
                                style={{ color: "#006CB5" }}
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteExam(exam._id)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Delete"
                                style={{ color: "#dc2626" }}
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Belt Exam Details Modal */}
        {showModal && selectedExam && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          >
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-white border-b-2 border-slate-200 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Belt Exam Details
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-slate-600 hover:text-slate-900 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Application Form Data */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Candidate Name
                      </label>
                      <p className="text-slate-900 font-bold text-lg uppercase">
                        {selectedExam.candidateName}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Date of Birth
                      </label>
                      <p className="text-slate-900">
                        {new Date(selectedExam.dateOfBirth).toLocaleDateString(
                          "en-GB",
                        )}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Age
                      </label>
                      <p className="text-slate-900">
                        {selectedExam.age ||
                          calculateAge(selectedExam.dateOfBirth)}{" "}
                        years
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Gender
                      </label>
                      <p className="text-slate-900">{selectedExam.gender}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Parent/Guardian Name
                      </label>
                      <p className="text-slate-900">
                        {selectedExam.parentGuardianName}
                      </p>
                    </div>

                    <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Address
                      </label>
                      <p className="text-slate-900">{selectedExam.address}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <p className="text-slate-900">
                        {selectedExam.phoneNumber}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Email
                      </label>
                      <p className="text-slate-900">{selectedExam.gmail}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        District
                      </label>
                      <p className="text-slate-900">
                        {selectedExam.district || "Not provided"}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        State
                      </label>
                      <p className="text-slate-900">
                        {selectedExam.state || "Not provided"}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Present Belt/Grade
                      </label>
                      <p className="text-slate-900 font-bold">
                        {selectedExam.presentBelt}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Appearing For Grade/Kup
                      </label>
                      <p className="text-slate-900 font-bold">
                        {selectedExam.appearingForGrade}
                      </p>
                    </div>

                    <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        School/College/University
                      </label>
                      <p className="text-slate-900">
                        {selectedExam.schoolName || "Not provided"}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Academic Qualification
                      </label>
                      <p className="text-slate-900">
                        {selectedExam.academicQualification || "Not provided"}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Instructor's Name
                      </label>
                      <p className="text-slate-900">
                        {selectedExam.instructorName || "Not provided"}
                      </p>
                    </div>

                    {selectedExam.photo && (
                      <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Photo
                        </label>
                        <img
                          src={`https://cwtakarnataka.com/${selectedExam.photo.replace(/\\/g, "/").replace(/^.*uploads/, "uploads")}`}
                          alt="Candidate"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-slate-300"
                          onError={(e) => {
                            console.error(
                              "Image failed to load:",
                              selectedExam.photo,
                            );
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML +=
                              '<p class="text-red-500 text-sm mt-2">Photo not available</p>';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Admin Notes */}
                  {selectedExam.adminNotes && (
                    <div className="mt-8 pt-6 border-t-2 border-slate-200">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">
                        Admin Notes
                      </h3>
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="text-slate-900">
                          {selectedExam.adminNotes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end border-t pt-6 mt-6">
                  <button
                    onClick={() => {
                      handleDeleteExam(selectedExam._id);
                      setShowModal(false);
                      setSelectedExam(null);
                    }}
                    className="bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Delete Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BeltExamManagement;
