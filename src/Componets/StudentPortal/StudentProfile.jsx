import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack, IoMdClose } from 'react-icons/io';
import {
  FaUser, FaIdCard, FaBirthdayCake, FaVenusMars, FaTint, FaCalendarAlt,
  FaSchool, FaBuilding, FaGraduationCap, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaMedal, FaTrophy, FaLock, FaSignOutAlt, FaEdit, FaDownload, FaEye,
  FaUserFriends, FaBriefcase, FaExclamationTriangle, FaHeart, FaChevronRight,
  FaQuestionCircle, FaShieldAlt, FaCertificate
} from 'react-icons/fa';

// All belt exam entries in order
const EXAM_BELTS = [
  { label: 'White Belt',          dateKey: 'examWhiteBelt',       codeKey: 'examWhiteBeltCertCode',       fileKey: 'examWhiteBeltCertFile',       color: '#ffffff', border: '#9ca3af' },
  { label: 'White-Yellow Stripe', dateKey: 'examWhiteYellowStripe', codeKey: 'examWhiteYellowStripeCertCode', fileKey: 'examWhiteYellowStripeCertFile', color: '#fde68a', border: '#d97706' },
  { label: 'Yellow Belt',         dateKey: 'examYellowBelt',      codeKey: 'examYellowBeltCertCode',      fileKey: 'examYellowBeltCertFile',      color: '#fbbf24', border: '#d97706' },
  { label: 'Yellow-Green Stripe', dateKey: 'examYellowStripe',    codeKey: 'examYellowStripeCertCode',    fileKey: 'examYellowStripeCertFile',    color: '#86efac', border: '#16a34a' },
  { label: 'Green Belt',          dateKey: 'examGreenBelt',       codeKey: 'examGreenBeltCertCode',       fileKey: 'examGreenBeltCertFile',       color: '#22c55e', border: '#15803d' },
  { label: 'Green-Blue Stripe',   dateKey: 'examGreenStripe',     codeKey: 'examGreenStripeCertCode',     fileKey: 'examGreenStripeCertFile',     color: '#93c5fd', border: '#2563eb' },
  { label: 'Blue Belt',           dateKey: 'examBlueBelt',        codeKey: 'examBlueBeltCertCode',        fileKey: 'examBlueBeltCertFile',        color: '#3b82f6', border: '#1d4ed8' },
  { label: 'Blue-Red Stripe',     dateKey: 'examBlueStripe',      codeKey: 'examBlueStripeCertCode',      fileKey: 'examBlueStripeCertFile',      color: '#fca5a5', border: '#dc2626' },
  { label: 'Red Belt',            dateKey: 'examRedBelt',         codeKey: 'examRedBeltCertCode',         fileKey: 'examRedBeltCertFile',         color: '#ef4444', border: '#b91c1c' },
  { label: 'Red-Black Stripe',    dateKey: 'examRedStripe',       codeKey: 'examRedStripeCertCode',       fileKey: 'examRedStripeCertFile',       color: '#1f2937', border: '#000' },
  { label: 'Black Stripe',        dateKey: 'examBlackStripe',     codeKey: 'examBlackStripeCertCode',     fileKey: 'examBlackStripeCertFile',     color: '#111827', border: '#000' },
  { label: 'Black Belt (1st Dan)',dateKey: 'examBlackBelt',       codeKey: 'examBlackBeltCertCode',       fileKey: 'examBlackBeltCertFile',       color: '#000000', border: '#374151' },
  { label: 'Black Belt 2nd Dan',  dateKey: 'examBlack2Dan',       codeKey: 'examBlack2DanCertCode',       fileKey: 'examBlack2DanCertFile',       color: '#000000', border: '#374151' },
  { label: 'Black Belt 3rd Dan',  dateKey: 'examBlack3Dan',       codeKey: 'examBlack3DanCertCode',       fileKey: 'examBlack3DanCertFile',       color: '#000000', border: '#374151' },
  { label: 'Black Belt 4th Dan',  dateKey: 'examBlack4Dan',       codeKey: 'examBlack4DanCertCode',       fileKey: 'examBlack4DanCertFile',       color: '#000000', border: '#374151' },
  { label: 'Black Belt 5th Dan',  dateKey: 'examBlack5Dan',       codeKey: 'examBlack5DanCertCode',       fileKey: 'examBlack5DanCertFile',       color: '#000000', border: '#374151' },
];

const StudentProfile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [viewingCert, setViewingCert] = useState(null);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:9000';

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (!token) { navigate('/verify-certificate'); return; }
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('studentToken');
      const res = await fetch(`${API_BASE_URL}/students/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') setProfileData(data.data);
      } else if (res.status === 401) {
        localStorage.removeItem('studentToken');
        navigate('/verify-certificate');
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('studentToken');
      localStorage.removeItem('studentData');
      navigate('/');
    }
  };

  const openEdit = (field, val) => { setEditField(field); setEditValue(val || ''); setShowEditModal(true); };
  const saveEdit = () => {
    if (!editValue.trim()) { alert('Value cannot be empty'); return; }
    setProfileData({ ...profileData, [editField]: editValue.trim() });
    setShowEditModal(false); setEditField(''); setEditValue('');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) { alert('Fill all fields'); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { alert('Passwords do not match'); return; }
    if (passwordData.newPassword.length < 6) { alert('Min 6 characters'); return; }
    alert('Password changed successfully!');
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const fileUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${BASE_URL}/${path}`;
  };

  const downloadFile = async (url, name) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = name || 'certificate';
      a.click();
    } catch { alert('Download failed'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#006CB5]" />
    </div>
  );

  const photoSrc = profileData?.photo
    ? (profileData.photo.startsWith('http') ? profileData.photo : `${BASE_URL}/${profileData.photo}`)
    : null;

  // Filter exam belts that have a date
  const examEntries = EXAM_BELTS.filter(b => profileData?.[b.dateKey]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/student/dashboard')} className="text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-all">
            <IoMdArrowBack className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Photo + Name */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
          <div className="relative mb-4">
            {photoSrc
              ? <img src={photoSrc} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 shadow-lg" style={{ borderColor: '#006CB5' }} />
              : <div className="w-28 h-28 rounded-full flex items-center justify-center text-white text-5xl shadow-lg" style={{ backgroundColor: '#006CB5' }}><FaUser /></div>
            }
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{profileData?.fullName || profileData?.name || 'Student'}</h2>
          <span className="mt-1 px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: '#006CB5' }}>
            {profileData?.currentBeltLevel || 'Student'}
          </span>
        </div>

        {/* Personal Information */}
        <Section title="Personal Information" icon={<FaUser className="text-[#006CB5]" />}>
          <InfoRow icon={<FaIdCard />} label="Admission Number" value={profileData?.admissionNumber} />
          <InfoRow icon={<FaIdCard />} label="ID Number" value={profileData?.idNumber} />
          <InfoRow icon={<FaBirthdayCake />} label="Date of Birth" value={profileData?.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : null} />
          <InfoRow icon={<FaUser />} label="Age" value={profileData?.age ? `${profileData.age} years` : null} />
          <InfoRow icon={<FaVenusMars />} label="Gender" value={profileData?.gender} />
          <InfoRow icon={<FaTint />} label="Blood Group" value={profileData?.bloodGroup} />
          <InfoRow icon={<FaCalendarAlt />} label="Joining Date" value={profileData?.joiningDate ? new Date(profileData.joiningDate).toLocaleDateString() : null} />
          <InfoRow icon={<FaSchool />} label="School / College" value={profileData?.schoolCollegeName} />
          <InfoRow icon={<FaGraduationCap />} label="Qualification" value={profileData?.qualification} />
          <InfoRow icon={<FaBuilding />} label="Organization" value={profileData?.organizationName} />
        </Section>

        {/* Contact Information */}
        <Section title="Contact Information" icon={<FaPhone className="text-[#006CB5]" />}>
          <InfoRow icon={<FaPhone />} label="Phone" value={profileData?.phone} onEdit={() => openEdit('phone', profileData?.phone)} />
          <InfoRow icon={<FaEnvelope />} label="Email" value={profileData?.email} onEdit={() => openEdit('email', profileData?.email)} />
          <InfoRow icon={<FaMapMarkerAlt />} label="Address" value={profileData?.address} />
        </Section>

        {/* Family Information */}
        <Section title="Family Information" icon={<FaUserFriends className="text-[#006CB5]" />}>
          <InfoRow icon={<FaUser />} label="Father's Name" value={profileData?.fatherName} />
          <InfoRow icon={<FaPhone />} label="Father's Phone" value={profileData?.fatherPhone} />
          <InfoRow icon={<FaBriefcase />} label="Father's Occupation" value={profileData?.fatherOccupation} />
          <InfoRow icon={<FaUser />} label="Mother's Name" value={profileData?.motherName} />
          <InfoRow icon={<FaPhone />} label="Mother's Phone" value={profileData?.motherPhone} />
          <InfoRow icon={<FaBriefcase />} label="Mother's Occupation" value={profileData?.motherOccupation} />
          {(profileData?.emergencyContact?.name || profileData?.emergencyContact?.phone) && <>
            <div className="px-5 py-2 bg-orange-50 border-t border-orange-100">
              <p className="text-xs font-bold text-orange-600 flex items-center gap-1"><FaExclamationTriangle /> Emergency Contact</p>
            </div>
            <InfoRow icon={<FaUser />} label="Name" value={profileData?.emergencyContact?.name} />
            <InfoRow icon={<FaPhone />} label="Phone" value={profileData?.emergencyContact?.phone} />
            <InfoRow icon={<FaHeart />} label="Relationship" value={profileData?.emergencyContact?.relationship} />
          </>}
        </Section>

        {/* Training Information */}
        <Section title="Training Information" icon={<FaMedal className="text-[#006CB5]" />}>
          <InfoRow icon={<FaMedal />} label="Current Belt Level" value={profileData?.currentBeltLevel} />
          <InfoRow icon={<FaUser />} label="Instructor Name" value={profileData?.instructorName} />
          <InfoRow icon={<FaMapMarkerAlt />} label="Class Address" value={profileData?.classAddress} />
        </Section>

        {/* Exam Dates & Certificates */}
        {examEntries.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <FaCertificate className="text-[#006CB5]" />
              <span className="font-bold text-gray-900 text-sm">Exam Dates & Certificates</span>
            </div>
            {examEntries.map((belt, i) => {
              const date = profileData[belt.dateKey];
              const code = profileData[belt.codeKey];
              const file = profileData[belt.fileKey];
              const url = fileUrl(file);
              return (
                <div key={i} className="px-5 py-4 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    {/* Belt color circle */}
                    <div className="w-10 h-10 rounded-full flex-shrink-0 border-2" style={{ backgroundColor: belt.color, borderColor: belt.border }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-medium">{belt.label}</p>
                      <p className="text-sm font-semibold text-gray-900">{new Date(date).toLocaleDateString()}</p>
                      {code && <p className="text-xs text-gray-500 mt-0.5">Code: {code}</p>}
                    </div>
                    {url && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => setViewingCert(url)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-all text-[#006CB5]" title="View">
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button onClick={() => downloadFile(url, `cert-${belt.label}.${file.split('.').pop()}`)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-all text-green-600" title="Download">
                          <FaDownload className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Achievements */}
        {profileData?.achievements?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <FaTrophy className="text-yellow-500" />
              <span className="font-bold text-gray-900 text-sm">Achievements ({profileData.achievements.length})</span>
            </div>
            <div className="divide-y divide-gray-50">
              {profileData.achievements.map((a, i) => (
                <div key={i} className="px-5 py-4">
                  <p className="font-bold text-gray-900 mb-1">{a.tournamentName || 'Tournament'}</p>
                  {a.address && <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1"><FaMapMarkerAlt className="text-gray-400" />{a.address}</p>}
                  {a.date && <p className="text-xs text-gray-500 mb-3 flex items-center gap-1"><FaCalendarAlt className="text-gray-400" />{new Date(a.date).toLocaleDateString()}</p>}
                  <div className="space-y-2">
                    {(a.typePrices?.length > 0 ? a.typePrices : (a.type ? [{ type: a.type, price: a.prize }] : [])).map((tp, j) => tp.type && (
                      <div key={j} className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-900 flex items-center gap-2 text-sm"><FaMedal className="text-yellow-500" />{tp.type}</span>
                          {tp.price && <span className="px-2 py-0.5 bg-yellow-400 rounded-full text-xs font-bold text-gray-800">{tp.price}</span>}
                        </div>
                        {tp.certificateCode && <p className="text-xs text-gray-500 mb-2">Code: {tp.certificateCode}</p>}
                        {tp.certificateFile && (
                          <div className="flex gap-2">
                            <button onClick={() => setViewingCert(fileUrl(tp.certificateFile))}
                              className="flex-1 py-1.5 rounded-lg text-xs font-bold border border-[#006CB5] text-[#006CB5] flex items-center justify-center gap-1 hover:bg-blue-50 transition-all">
                              <FaEye className="w-3 h-3" /> View
                            </button>
                            <button onClick={() => downloadFile(fileUrl(tp.certificateFile), `achievement-cert.${tp.certificateFile.split('.').pop()}`)}
                              className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1 hover:opacity-90 transition-all" style={{ backgroundColor: '#006CB5' }}>
                              <FaDownload className="w-3 h-3" /> Download
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <ActionRow icon={<FaLock className="text-[#006CB5]" />} label="Change Password" onClick={() => setShowPasswordModal(true)} />
          <ActionRow icon={<FaSignOutAlt className="text-red-500" />} label="Logout" labelClass="text-red-500" onClick={handleLogout} />
        </div>

        <div className="h-6" />
      </div>

      {/* Certificate Viewer */}
      {viewingCert && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={() => setViewingCert(null)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewingCert(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300">
              <IoMdClose className="w-8 h-8" />
            </button>
            <img src={viewingCert} alt="Certificate" className="w-full rounded-xl shadow-2xl" />
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <Modal title="Change Password" onClose={() => setShowPasswordModal(false)}>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            {[
              { label: 'Current Password', key: 'currentPassword', show: showCurrentPwd, toggle: () => setShowCurrentPwd(!showCurrentPwd) },
              { label: 'New Password', key: 'newPassword', show: showNewPwd, toggle: () => setShowNewPwd(!showNewPwd) },
              { label: 'Confirm Password', key: 'confirmPassword', show: showConfirmPwd, toggle: () => setShowConfirmPwd(!showConfirmPwd) },
            ].map(({ label, key, show, toggle }) => (
              <div key={key} className="relative">
                <input type={show ? 'text' : 'password'} placeholder={label}
                  value={passwordData[key]} onChange={e => setPasswordData({ ...passwordData, [key]: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006CB5]" />
                <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{show ? '👁️' : '👁️‍🗨️'}</button>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 py-3 text-white rounded-xl font-semibold hover:opacity-90" style={{ backgroundColor: '#006CB5' }}>Update</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Field Modal */}
      {showEditModal && (
        <Modal title={`Edit ${editField}`} onClose={() => setShowEditModal(false)}>
          <input type={editField === 'email' ? 'email' : editField === 'phone' ? 'tel' : 'text'}
            placeholder={`Enter ${editField}`} value={editValue} onChange={e => setEditValue(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006CB5] mb-4" />
          <div className="flex gap-3">
            <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50">Cancel</button>
            <button onClick={saveEdit} className="flex-1 py-3 text-white rounded-xl font-semibold hover:opacity-90" style={{ backgroundColor: '#006CB5' }}>Save</button>
          </div>
        </Modal>
      )}

      {/* Help & Support */}
      {showHelpModal && (
        <BottomSheet title="Help & Support" onClose={() => setShowHelpModal(false)}>
          <div className="text-sm text-gray-700 space-y-4 leading-relaxed">
            <div><p className="font-bold text-gray-900 mb-1">📞 Contact</p><p>Email: support@cwtakarnataka.com</p><p>Phone: +91 98765 43210</p></div>
            <div><p className="font-bold text-gray-900 mb-1">⏰ Support Hours</p><p>Mon–Fri: 9 AM – 6 PM | Sat: 9 AM – 2 PM</p></div>
            <div><p className="font-bold text-gray-900 mb-1">❓ FAQs</p>
              <p className="font-semibold mt-2">How do I view my certificates?</p><p>Go to Certificates from the dashboard.</p>
              <p className="font-semibold mt-2">How is attendance tracked?</p><p>Your instructor marks attendance. View it in the Attendance section.</p>
              <p className="font-semibold mt-2">Can't log in?</p><p>Verify your email/phone and password. Contact your instructor if the issue persists.</p>
            </div>
          </div>
        </BottomSheet>
      )}

      {/* Privacy Policy */}
      {showPrivacyModal && (
        <BottomSheet title="Privacy Policy" onClose={() => setShowPrivacyModal(false)}>
          <div className="text-sm text-gray-700 space-y-4 leading-relaxed">
            <div><p className="font-bold text-gray-900 mb-1">1. Information We Collect</p><p>Name, email, phone, training data, and usage information.</p></div>
            <div><p className="font-bold text-gray-900 mb-1">2. How We Use It</p><p>To provide training services, track progress, and improve the platform.</p></div>
            <div><p className="font-bold text-gray-900 mb-1">3. Data Security</p><p>Your data is encrypted and stored securely. We do not sell your information.</p></div>
            <div><p className="font-bold text-gray-900 mb-1">4. Your Rights</p><p>You can access, update, or delete your data at any time.</p></div>
            <div><p className="font-bold text-gray-900 mb-1">5. Contact</p><p>privacy@cwtakarnataka.com</p></div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
};

/* ── Sub-components ── */

const Section = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden">
    <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
      {icon}
      <span className="font-bold text-gray-900 text-sm">{title}</span>
    </div>
    {children}
  </div>
);

const InfoRow = ({ icon, label, value, onEdit }) => (
  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <span className="text-gray-400 text-base flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate">{value || 'N/A'}</p>
      </div>
    </div>
    {onEdit && (
      <button onClick={onEdit} className="text-[#006CB5] hover:opacity-70 transition-all p-1 flex-shrink-0 ml-2">
        <FaEdit className="w-4 h-4" />
      </button>
    )}
  </div>
);

const ActionRow = ({ icon, label, onClick, labelClass = '' }) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-all text-left">
    <span className="text-xl flex-shrink-0">{icon}</span>
    <span className={`flex-1 font-semibold text-gray-900 ${labelClass}`}>{label}</span>
    <FaChevronRight className="text-gray-400 w-4 h-4 flex-shrink-0" />
  </button>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 capitalize">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><IoMdClose className="w-6 h-6" /></button>
      </div>
      {children}
    </div>
  </div>
);

const BottomSheet = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50" onClick={onClose}>
    <div className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><IoMdClose className="w-6 h-6" /></button>
      </div>
      <div className="overflow-y-auto px-6 py-4">{children}</div>
    </div>
  </div>
);

export default StudentProfile;
