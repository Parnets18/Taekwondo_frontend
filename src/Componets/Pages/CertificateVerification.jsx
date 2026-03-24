import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const CertificateVerification = () => {
  const { verificationCode: urlCode } = useParams();
  const [verificationCode, setVerificationCode] = useState(urlCode || "");
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // API base URL
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (urlCode) {
      handleVerification(urlCode);
    }
  }, [urlCode]);

  const handleVerification = async (code = verificationCode) => {
    if (!code.trim()) {
      setError("Please enter a verification code");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setVerificationResult(null);

      const response = await axios.post(
        `${API_BASE_URL}/certificate-verification/verify`,
        {
          verificationCode: code.trim().toUpperCase(),
        },
      );

      setVerificationResult(response.data.data);
    } catch (error) {
      console.error("Verification failed:", error);
      setError(
        error.response?.data?.message ||
          "Verification failed. Please check the code and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerification();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAchievementTypeDisplay = (type) => {
    const typeMap = {
      belt_promotion: "Belt Promotion",
      course_completion: "Course Completion",
      special_achievement: "Special Achievement",
    };
    return typeMap[type] || type;
  };

  const handleViewCertificate = async (
    certificateId,
    certificateType,
    achievementId,
    certificateIndex,
  ) => {
    try {
      const params = new URLSearchParams({
        type: certificateType,
      });

      if (achievementId) params.append("achievementId", achievementId);
      if (certificateIndex !== undefined)
        params.append("certificateIndex", certificateIndex);

      const viewUrl = `${API_BASE_URL}/certificate-verification/${certificateId}?${params.toString()}`;
      console.log("Viewing certificate from URL:", viewUrl);
      console.log("View params:", {
        certificateId,
        certificateType,
        achievementId,
        certificateIndex,
      });

      const response = await axios.get(viewUrl);
      console.log("Certificate data received:", response.data);

      if (
        response.data.status === "success" &&
        response.data.data.certificate.imageUrl
      ) {
        const imageUrl = `${API_BASE_URL.replace("/api", "")}${response.data.data.certificate.imageUrl}`;
        console.log("Opening image URL:", imageUrl);
        const newWindow = window.open(
          imageUrl,
          "_blank",
          "width=800,height=600,scrollbars=yes,resizable=yes",
        );

        if (!newWindow) {
          setError(
            "Popup blocked. Please allow popups for this site or try the download option.",
          );
        } else {
          setError("");
        }
      } else {
        setError("Certificate image not available for viewing");
      }
    } catch (error) {
      console.error("Error viewing certificate:", error);
      setError("Failed to load certificate for viewing");
    }
  };

  const handleDownloadCertificate = async (
    certificateId,
    certificateType,
    achievementId,
    certificateIndex,
  ) => {
    try {
      const params = new URLSearchParams({
        type: certificateType,
      });

      if (achievementId) params.append("achievementId", achievementId);
      if (certificateIndex !== undefined)
        params.append("certificateIndex", certificateIndex);

      const downloadUrl = `${API_BASE_URL}/certificate-verification/${certificateId}/download?${params.toString()}`;
      console.log("Starting certificate download from URL:", downloadUrl);
      console.log("Download params:", {
        certificateId,
        certificateType,
        achievementId,
        certificateIndex,
      });

      const response = await axios.get(downloadUrl, {
        responseType: "blob",
        headers: {
          Accept: "application/octet-stream, image/*, application/pdf",
        },
      });

      console.log("Download response received:", {
        status: response.status,
        contentType: response.headers["content-type"],
        contentLength: response.headers["content-length"],
        contentDisposition: response.headers["content-disposition"],
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers["content-disposition"];
      let filename = `certificate_${certificateId}.jpg`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      console.log("Downloading file as:", filename);
      link.setAttribute("download", filename);
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Download initiated successfully");
      setError("");
      alert("Certificate download started! Check your downloads folder.");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      console.error("Error response:", error.response);

      if (error.response?.status === 404) {
        setError("Certificate file not found on server");
      } else if (error.response?.status === 403) {
        setError("Access denied to certificate file");
      } else {
        setError("Failed to download certificate. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Certificate Verification
          </h1>
          <p className="text-lg text-gray-600">
            Verify the authenticity of certificates issued by Combat Warrior
            Taekwon-Do Institute
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="verificationCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter Verification Code
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value.toUpperCase())
                  }
                  placeholder="Enter the verification code from the certificate"
                  className="flex-1 border border-gray-300 rounded-md px-4 py-3 text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={32}
                />
                <button
                  type="submit"
                  disabled={loading || !verificationCode.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Verification Failed
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Student Login Section */}
        <div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          style={{ border: "3px solid #006CB5" }}
        >
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 bg-white shadow-lg"
              style={{ border: "4px solid #006CB5" }}
            >
              <svg
                className="w-10 h-10"
                style={{ color: "#006CB5" }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </div>
            <h2
              className="text-3xl font-bold mb-2"
              style={{ color: "#006CB5" }}
            >
              Student Portal
            </h2>
            <p className="text-gray-600 text-lg">
              Access your certificates, progress, and achievements
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full text-white px-6 py-4 rounded-lg text-lg font-semibold shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
              style={{ backgroundColor: "#006CB5" }}
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
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              <span>Login to Student Portal</span>
            </button>

            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div
                className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                style={{ border: "2px solid #006CB5" }}
              >
                <svg
                  className="w-10 h-10 mx-auto mb-2"
                  style={{ color: "#006CB5" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#006CB5" }}
                >
                  Certificates
                </p>
              </div>
              <div
                className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                style={{ border: "2px solid #006CB5" }}
              >
                <svg
                  className="w-10 h-10 mx-auto mb-2"
                  style={{ color: "#006CB5" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#006CB5" }}
                >
                  Progress
                </p>
              </div>
              <div
                className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                style={{ border: "2px solid #006CB5" }}
              >
                <svg
                  className="w-10 h-10 mx-auto mb-2"
                  style={{ color: "#006CB5" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#006CB5" }}
                >
                  Achievements
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href="/admission"
                className="font-semibold hover:underline"
                style={{ color: "#006CB5" }}
              >
                Join Now
              </a>
            </p>
          </div>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {verificationResult.isValid ? (
              <div>
                {/* Success Header */}
                <div className="bg-green-50 border-b border-green-200 px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-8 w-8 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-green-800">
                        Certificate Verified Successfully
                      </h3>
                      <p className="text-sm text-green-600">
                        This certificate is authentic and valid.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Student Name
                        </h4>
                        <p className="mt-1 text-lg font-medium text-gray-900">
                          {verificationResult.certificate.studentName}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Achievement
                        </h4>
                        <p className="mt-1 text-lg font-medium text-gray-900">
                          {
                            verificationResult.certificate.achievementDetails
                              .title
                          }
                        </p>
                        <p className="text-sm text-gray-600">
                          {
                            verificationResult.certificate.achievementDetails
                              .description
                          }
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Achievement Type
                        </h4>
                        <span className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {getAchievementTypeDisplay(
                            verificationResult.certificate.achievementType,
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {verificationResult.certificate.achievementDetails
                        .level && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                            Level/Belt
                          </h4>
                          <p className="mt-1 text-lg font-medium text-gray-900">
                            {
                              verificationResult.certificate.achievementDetails
                                .level
                            }
                          </p>
                        </div>
                      )}

                      {verificationResult.certificate.achievementDetails
                        .grade && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                            Grade
                          </h4>
                          <p className="mt-1 text-lg font-medium text-gray-900">
                            {
                              verificationResult.certificate.achievementDetails
                                .grade
                            }
                          </p>
                        </div>
                      )}

                      {verificationResult.certificate.achievementDetails
                        .examiner && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                            Examiner
                          </h4>
                          <p className="mt-1 text-lg font-medium text-gray-900">
                            {
                              verificationResult.certificate.achievementDetails
                                .examiner
                            }
                          </p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Date Issued
                        </h4>
                        <p className="mt-1 text-lg font-medium text-gray-900">
                          {formatDate(
                            verificationResult.certificate.issuedDate,
                          )}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Verification Code
                        </h4>
                        <p className="mt-1 text-sm font-mono text-gray-600 bg-gray-100 px-3 py-2 rounded">
                          {verificationResult.certificate.verificationCode}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Status
                        </h4>
                        <span className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {verificationResult.certificate.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Actions */}
                  {verificationResult.certificate.hasFile && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                        Certificate Actions
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() =>
                            handleViewCertificate(
                              verificationResult.certificate.id,
                              verificationResult.certificate.type,
                              verificationResult.certificate.achievementId,
                              verificationResult.certificate.certificateIndex,
                            )
                          }
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View Certificate
                        </button>

                        <button
                          onClick={() =>
                            handleDownloadCertificate(
                              verificationResult.certificate.id,
                              verificationResult.certificate.type,
                              verificationResult.certificate.achievementId,
                              verificationResult.certificate.certificateIndex,
                            )
                          }
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Download Certificate
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Institute Information */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Issued by
                      </h4>
                      <p className="text-sm text-gray-600">
                        Combat Warrior Taekwon-Do Institute
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Verified on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 px-6 py-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Certificate Not Found
                    </h3>
                    <p className="mt-1 text-sm text-red-700">
                      {verificationResult.error ||
                        "The verification code you entered is invalid or the certificate may have been revoked."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Information Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-medium text-blue-900 mb-4">
            About Certificate Verification
          </h2>
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              <strong>Secure Verification:</strong> Each certificate issued by
              Combat Warrior Taekwon-Do Institute contains a unique verification
              code that can be used to confirm its authenticity.
            </p>
            <p>
              <strong>Real-time Validation:</strong> Our verification system
              checks certificates against our secure database in real-time to
              ensure accuracy and prevent fraud.
            </p>
            <p>
              <strong>Privacy Protection:</strong> Only information that appears
              on the original certificate is displayed during verification.
              Personal student information remains protected.
            </p>
            <p>
              <strong>Questions?</strong> If you have questions about a
              certificate or the verification process, please contact us at{" "}
              <a href="mailto:contact@cwtakarnataka.com" className="underline">
                contact@cwtakarnataka.com
              </a>
            </p>
          </div>
        </div>

        {/* Login Modal */}
        {showLoginModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative p-6 border-b border-gray-200">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
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

                <div className="text-center">
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
                    style={{
                      backgroundColor: "#fef2f2",
                      border: "2px solid rgba(239, 68, 68, 0.1)",
                    }}
                  >
                    <svg
                      className="w-8 h-8"
                      style={{ color: "#ef4444" }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    Student Login
                  </h3>
                  <p className="text-sm text-gray-600">
                    Enter your email and password
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLoginLoading(true);

                    try {
                      // Call the actual login API (not student-specific, just /auth/login)
                      const response = await axios.post(
                        `${API_BASE_URL}/auth/login`,
                        {
                          email: loginEmail,
                          password: loginPassword,
                        },
                      );

                      if (response.data.status === "success") {
                        // Check if the user is a student
                        if (response.data.data.user.role !== "student") {
                          setError(
                            "This login is for students only. Please use the admin login.",
                          );
                          setLoginLoading(false);
                          return;
                        }

                        // Store the token and student data
                        localStorage.setItem(
                          "studentToken",
                          response.data.data.token,
                        );
                        localStorage.setItem(
                          "studentData",
                          JSON.stringify(response.data.data.user),
                        );

                        // Redirect to dashboard
                        window.location.href = "/student/dashboard";
                      } else {
                        setError(
                          "Login failed. Please check your credentials.",
                        );
                        setLoginLoading(false);
                      }
                    } catch (error) {
                      console.error("Login error:", error);
                      setError(
                        error.response?.data?.message ||
                          "Invalid email or password. Please try again.",
                      );
                      setLoginLoading(false);
                    }
                  }}
                >
                  {/* Email Input */}
                  <div className="mb-4">
                    <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-4 py-3">
                      <svg
                        className="w-5 h-5 mr-3"
                        style={{ color: "#ef4444" }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Enter email"
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="mb-6">
                    <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-4 py-3">
                      <svg
                        className="w-5 h-5 mr-3"
                        style={{ color: "#ef4444" }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                      </svg>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {showPassword ? (
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                          ) : (
                            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                    style={{ backgroundColor: "#ef4444" }}
                  >
                    {loginLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Login</span>
                        <span>✨</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateVerification;
