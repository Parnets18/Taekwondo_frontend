import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdArrowBack, IoMdClose } from "react-icons/io";
import {
  MdCardMembership,
  MdVisibility,
  MdFileDownload,
  MdWorkspacePremium,
} from "react-icons/md";

const StudentCertificates = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://taekwondo-backend-j8w4.onrender.com/api";
  const BASE_URL = import.meta.env.VITE_BASE_URL || "https://taekwondo-backend-j8w4.onrender.com";

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      navigate("/verify-certificate");
      return;
    }
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("studentToken");

      console.log("📜 Loading certificates...");

      const response = await fetch(
        `${API_BASE_URL}/student-portal/certificates`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("📊 Certificates response:", data);
        if (data.status === "success") {
          const certs = data.data?.certificates || [];
          console.log("✅ Loaded certificates:", certs);
          setCertificates(certs);
        }
      } else {
        console.error("❌ Failed to load certificates:", response.status);
      }
    } catch (error) {
      console.error("❌ Error loading certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificate) => {
    try {
      if (!certificate.imageUrl) {
        alert("No certificate file available");
        return;
      }

      const fullUrl = certificate.imageUrl.startsWith("/")
        ? `${BASE_URL}${certificate.imageUrl}`
        : certificate.imageUrl;

      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate_${certificate.student.replace(/\s+/g, "_")}_${certificate.verificationCode}.${certificate.imageUrl.split(".").pop()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Failed to download certificate");
    }
  };

  const handleView = (certificate) => {
    if (!certificate.imageUrl) {
      alert("No certificate file available");
      return;
    }

    let fullUrl = certificate.imageUrl;

    // If it's a relative path, construct the full URL
    if (certificate.imageUrl.startsWith("/")) {
      fullUrl = `${BASE_URL}${certificate.imageUrl}`;
    }

    console.log("🖼️ Opening certificate:", fullUrl);

    setSelectedCertificate({
      ...certificate,
      fullUrl,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border border-[#006CB5] border-t-transparent"></div>
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
            <h1 className="text-2xl font-bold text-white">My Certificates</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Certificates Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">My Certificates</h3>
            <p className="text-sm text-gray-600">
              {certificates.length} certificate
              {certificates.length !== 1 ? "s" : ""}
            </p>
          </div>

          {certificates.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <MdWorkspacePremium className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-600 mb-2">
                No certificates found
              </h3>
              <p className="text-gray-500">
                Your certificates will appear here once issued
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-xl shadow-md p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">
                        {cert.title || "Certificate"}
                      </h4>
                      <p className="text-sm text-gray-700 mb-1">
                        {cert.student || "Student"}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        {cert.type || "Achievement"}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Issued: {cert.issueDate}
                      </p>
                      {cert.verificationCode && (
                        <p className="text-xs text-gray-500">
                          Code: {cert.verificationCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {cert.imageUrl && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleView(cert)}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                      >
                        <MdVisibility className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleDownload(cert)}
                        className="flex-1 px-4 py-2.5 bg-[#006CB5] text-white rounded-lg font-semibold hover:bg-[#005a9c] transition-all flex items-center justify-center gap-2"
                      >
                        <MdFileDownload className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  )}

                  {!cert.imageUrl && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600">
                        No certificate file uploaded
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certificate View Modal */}
      {selectedCertificate && (
        <div
          className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCertificate(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-4 right-4 z-10 bg-white text-gray-700 hover:bg-gray-100 p-2 rounded-full shadow-lg transition-all"
            >
              <IoMdClose className="w-6 h-6" />
            </button>

            {/* Certificate Image */}
            <img
              src={selectedCertificate.fullUrl}
              alt="Certificate"
              className="w-full rounded-lg shadow-2xl"
              onError={(e) => {
                console.error("❌ Failed to load certificate image");
                e.target.style.display = "none";
                e.target.parentElement.innerHTML =
                  '<div class="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center"><p class="text-blue-600 font-semibold mb-2">Certificate image not found</p><p class="text-sm text-blue-500">The certificate file is not available on the server. Please contact the administrator.</p></div>';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCertificates;
