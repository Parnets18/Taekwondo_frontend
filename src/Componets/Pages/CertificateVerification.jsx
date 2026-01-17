import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const CertificateVerification = () => {
  const { verificationCode: urlCode } = useParams();
  const [verificationCode, setVerificationCode] = useState(urlCode || '');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (urlCode) {
      handleVerification(urlCode);
    }
  }, [urlCode]);

  const handleVerification = async (code = verificationCode) => {
    if (!code.trim()) {
      setError('Please enter a verification code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setVerificationResult(null);

      const response = await axios.post('/api/certificates/verify', {
        verificationCode: code.trim().toUpperCase()
      });

      // Extract the data from the response
      setVerificationResult(response.data.data);
    } catch (error) {
      console.error('Verification failed:', error);
      setError(error.response?.data?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerification();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAchievementTypeDisplay = (type) => {
    const typeMap = {
      'belt_promotion': 'Belt Promotion',
      'course_completion': 'Course Completion',
      'special_achievement': 'Special Achievement'
    };
    return typeMap[type] || type;
  };

  const handleViewCertificate = async (certificateId) => {
    try {
      // Public route - no authentication needed
      const response = await axios.get(`/api/certificates/${certificateId}`);
      if (response.data.status === 'success' && response.data.data.certificate.imageUrl) {
        // Open certificate image in a new window
        const imageUrl = response.data.data.certificate.imageUrl;
        window.open(imageUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
        // Reset the page after 2 seconds to allow user to see the action completed
        setTimeout(() => {
          setVerificationResult(null);
          setVerificationCode('');
          setError('');
        }, 2000);
      } else {
        setError('Certificate image not available for viewing');
      }
    } catch (error) {
      console.error('Error viewing certificate:', error);
      setError('Failed to load certificate for viewing');
    }
  };

  const handleDownloadCertificate = async (certificateId) => {
    try {
      // Public route - no authentication needed
      const response = await axios.get(`/api/certificates/${certificateId}/download`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'certificate.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Reset the page after 2 seconds to allow user to see the download started
      setTimeout(() => {
        setVerificationResult(null);
        setVerificationCode('');
        setError('');
      }, 2000);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      setError('Failed to download certificate');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Certificate Verification</h1>
          <p className="text-lg text-gray-600">
            Verify the authenticity of certificates issued by Combat Warrior Taekwon-Do Institute
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Verification Code
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
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
                    'Verify'
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Verification Failed</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
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
                      <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-green-800">Certificate Verified Successfully</h3>
                      <p className="text-sm text-green-600">This certificate is authentic and valid.</p>
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Student Name</h4>
                        <p className="mt-1 text-lg font-medium text-gray-900">{verificationResult.certificate.studentName}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Achievement</h4>
                        <p className="mt-1 text-lg font-medium text-gray-900">{verificationResult.certificate.achievementDetails.title}</p>
                        <p className="text-sm text-gray-600">{verificationResult.certificate.achievementDetails.description}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Achievement Type</h4>
                        <span className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {getAchievementTypeDisplay(verificationResult.certificate.achievementType)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {verificationResult.certificate.achievementDetails.level && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Level/Belt</h4>
                          <p className="mt-1 text-lg font-medium text-gray-900">{verificationResult.certificate.achievementDetails.level}</p>
                        </div>
                      )}

                      {verificationResult.certificate.achievementDetails.grade && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Grade</h4>
                          <p className="mt-1 text-lg font-medium text-gray-900">{verificationResult.certificate.achievementDetails.grade}</p>
                        </div>
                      )}

                      {verificationResult.certificate.achievementDetails.examiner && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Examiner</h4>
                          <p className="mt-1 text-lg font-medium text-gray-900">{verificationResult.certificate.achievementDetails.examiner}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Date Issued</h4>
                        <p className="mt-1 text-lg font-medium text-gray-900">{formatDate(verificationResult.certificate.issuedDate)}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Verification Code</h4>
                        <p className="mt-1 text-sm font-mono text-gray-600 bg-gray-100 px-3 py-2 rounded">
                          {verificationResult.certificate.verificationCode}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</h4>
                        <span className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {verificationResult.certificate.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Actions */}
                  {verificationResult.certificate.hasFile && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Certificate Actions</h4>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleViewCertificate(verificationResult.certificate.id)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Certificate
                        </button>
                        <button
                          onClick={() => handleDownloadCertificate(verificationResult.certificate.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                      <h4 className="text-sm font-medium text-gray-900">Issued by</h4>
                      <p className="text-sm text-gray-600">Combat Warrior Taekwon-Do Institute</p>
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
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Certificate Not Found</h3>
                    <p className="mt-1 text-sm text-red-700">
                      {verificationResult.error || 'The verification code you entered is invalid or the certificate may have been revoked.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Information Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-medium text-blue-900 mb-4">About Certificate Verification</h2>
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              <strong>Secure Verification:</strong> Each certificate issued by Combat Warrior Taekwon-Do Institute 
              contains a unique verification code that can be used to confirm its authenticity.
            </p>
            <p>
              <strong>Real-time Validation:</strong> Our verification system checks certificates against our 
              secure database in real-time to ensure accuracy and prevent fraud.
            </p>
            <p>
              <strong>Privacy Protection:</strong> Only information that appears on the original certificate 
              is displayed during verification. Personal student information remains protected.
            </p>
            <p>
              <strong>Questions?</strong> If you have questions about a certificate or the verification process, 
              please contact us at <a href="mailto:info@combatwarrior.com" className="underline">info@combatwarrior.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerification;