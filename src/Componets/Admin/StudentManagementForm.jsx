// Student Management Form Component - Add/Edit Modal
import { useState, useEffect } from 'react';

export const StudentFormModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  student = null, 
  formAge, 
  setFormAge, 
  calculateAge,
  photoPreview,
  setPhotoPreview,
  photoFile,
  setPhotoFile,
  handlePhotoChange,
  aadharPreview,
  setAadharPreview,
  aadharFile,
  setAadharFile,
  handleAadharChange,
  birthCertificatePreview,
  setBirthCertificatePreview,
  birthCertificateFile,
  setBirthCertificateFile,
  handleBirthCertificateChange
}) => {
  const [achievements, setAchievements] = useState(
    student?.achievements || [{ tournamentName: '', address: '', date: '', typePrices: [{ type: '', price: '', certificateCode: '', certificateFile: '' }], type: '', prize: '' }]
  );
  const [expandedBelts, setExpandedBelts] = useState({
    yellow: false,
    green: false,
    blue: false,
    red: false,
    black: false,
    current: false
  });
  const [showPassword, setShowPassword] = useState(false);

  // Update achievements when student prop changes
  useEffect(() => {
    if (student?.achievements && Array.isArray(student.achievements) && student.achievements.length > 0) {
      // Ensure each achievement has typePrices array
      const formattedAchievements = student.achievements.map(ach => ({
        ...ach,
        typePrices: ach.typePrices && ach.typePrices.length > 0 
          ? ach.typePrices 
          : [{ type: ach.type || '', price: ach.prize || '', certificateCode: '', certificateFile: '' }]
      }));
      setAchievements(formattedAchievements);
    } else {
      setAchievements([{ tournamentName: '', address: '', date: '', typePrices: [{ type: '', price: '', certificateCode: '', certificateFile: '' }], type: '', prize: '' }]);
    }
  }, [student]);

  if (!show) return null;

  const isEdit = !!student;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  // Remove /api from base URL for static file access (images)
  const BASE_URL = API_BASE_URL.replace('/api', '');

  const handleAddAchievement = () => {
    setAchievements([...achievements, { tournamentName: '', address: '', date: '', typePrices: [{ type: '', price: '', certificateCode: '', certificateFile: '' }], type: '', prize: '' }]);
  };

  const handleRemoveAchievement = (index) => {
    const newAchievements = achievements.filter((_, i) => i !== index);
    setAchievements(newAchievements);
  };

  const handleAchievementChange = (index, field, value) => {
    const newAchievements = [...achievements];
    newAchievements[index][field] = value;
    setAchievements(newAchievements);
  };

  const handleAddTypePrice = (achievementIndex) => {
    const newAchievements = [...achievements];
    if (!newAchievements[achievementIndex].typePrices) {
      newAchievements[achievementIndex].typePrices = [];
    }
    newAchievements[achievementIndex].typePrices.push({ type: '', price: '', certificateCode: '', certificateFile: '' });
    setAchievements(newAchievements);
  };

  const handleRemoveTypePrice = (achievementIndex, typePriceIndex) => {
    const newAchievements = [...achievements];
    newAchievements[achievementIndex].typePrices = newAchievements[achievementIndex].typePrices.filter((_, i) => i !== typePriceIndex);
    // Keep at least one type-price pair
    if (newAchievements[achievementIndex].typePrices.length === 0) {
      newAchievements[achievementIndex].typePrices = [{ type: '', price: '', certificateCode: '', certificateFile: '' }];
    }
    setAchievements(newAchievements);
  };

  const handleTypePriceChange = (achievementIndex, typePriceIndex, field, value) => {
    const newAchievements = [...achievements];
    newAchievements[achievementIndex].typePrices[typePriceIndex][field] = value;
    setAchievements(newAchievements);
  };

  const toggleBelt = (belt) => {
    setExpandedBelts(prev => ({
      ...prev,
      [belt]: !prev[belt]
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-black">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {isEdit ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button 
            onClick={() => {
              onClose();
              setFormAge(null);
              setPhotoPreview(null);
              setPhotoFile(null);
              setAchievements([{ tournamentName: '', address: '', date: '', typePrices: [{ type: '', price: '', certificateCode: '', certificateFile: '' }], type: '', prize: '' }]);
            }}
            className="text-slate-500 hover:text-slate-700 text-2xl"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          
          // Prepare achievements data with certificate files
          const achievementsData = achievements.map((ach, achIndex) => {
            const achData = {
              tournamentName: ach.tournamentName,
              address: ach.address,
              date: ach.date,
              type: ach.type,
              prize: ach.prize,
              typePrices: ach.typePrices.map((tp, tpIndex) => ({
                type: tp.type,
                price: tp.price,
                certificateCode: tp.certificateCode,
                certificateFile: tp.certificateFile instanceof File ? `certificate_${achIndex}_${tpIndex}` : tp.certificateFile
              }))
            };
            
            // Append certificate files to FormData
            ach.typePrices.forEach((tp, tpIndex) => {
              if (tp.certificateFile instanceof File) {
                formData.append(`certificate_${achIndex}_${tpIndex}`, tp.certificateFile);
              }
            });
            
            return achData;
          });
          
          formData.append('achievements', JSON.stringify(achievementsData));
          onSubmit(formData);
        }} className="space-y-6">
          
          {/* Photo Upload */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Student Photo *</label>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {photoPreview || (isEdit && student && student.photo) ? (
                  <img 
                    src={photoPreview || `${BASE_URL}/${student.photo}`} 
                    alt="Preview" 
                    className="w-24 h-24 object-cover rounded-lg border-2 border-slate-300"
                    onError={(e) => {
                      console.error('Image load error:', e.target.src);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-3xl">📷</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handlePhotoChange}
                  className="hidden"
                  required={!isEdit && !photoPreview}
                />
                <label 
                  htmlFor="photo"
                  className="cursor-pointer inline-block px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Choose Photo
                </label>
                <p className="text-xs text-slate-500 mt-2">JPG, JPEG, or PNG. Max 5MB (required)</p>
              </div>
            </div>
          </div>

          {/* Aadhar Upload */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Aadhar Card</label>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {aadharPreview || (isEdit && student && student.aadhar) ? (
                  aadharPreview && aadharPreview.includes('application/pdf') ? (
                    <div className="w-24 h-24 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">📄</span>
                    </div>
                  ) : (
                    <img 
                      src={aadharPreview || `${BASE_URL}/${student.aadhar}`} 
                      alt="Aadhar Preview" 
                      className="w-24 h-24 object-cover rounded-lg border-2 border-slate-300"
                      onError={(e) => {
                        console.error('Image load error:', e.target.src);
                        e.target.style.display = 'none';
                      }}
                    />
                  )
                ) : (
                  <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-3xl">🆔</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="aadhar"
                  name="aadhar"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleAadharChange}
                  className="hidden"
                />
                <label 
                  htmlFor="aadhar"
                  className="cursor-pointer inline-block px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Choose Aadhar
                </label>
                <p className="text-xs text-slate-500 mt-2">JPG, JPEG, PNG, or PDF. Max 5MB (optional)</p>
              </div>
            </div>
          </div>

          {/* Birth Certificate Upload */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Birth Certificate</label>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {birthCertificatePreview || (isEdit && student && student.birthCertificate) ? (
                  birthCertificatePreview && birthCertificatePreview.includes('application/pdf') ? (
                    <div className="w-24 h-24 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">📄</span>
                    </div>
                  ) : (
                    <img 
                      src={birthCertificatePreview || `${BASE_URL}/${student.birthCertificate}`} 
                      alt="Birth Certificate Preview" 
                      className="w-24 h-24 object-cover rounded-lg border-2 border-slate-300"
                      onError={(e) => {
                        console.error('Image load error:', e.target.src);
                        e.target.style.display = 'none';
                      }}
                    />
                  )
                ) : (
                  <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-3xl">📜</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="birthCertificate"
                  name="birthCertificate"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleBirthCertificateChange}
                  className="hidden"
                />
                <label 
                  htmlFor="birthCertificate"
                  className="cursor-pointer inline-block px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Choose Birth Certificate
                </label>
                <p className="text-xs text-slate-500 mt-2">JPG, JPEG, PNG, or PDF. Max 5MB (optional)</p>
              </div>
            </div>
          </div>

          {/* All Student Information in One Section */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 1. Instructor Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2"> Instructor Name</label>
                <input
                  type="text"
                  name="instructorName"
                  defaultValue={student?.instructorName}
                  placeholder="Enter instructor name (optional)"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* 2. Class Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2"> Class Address</label>
                <input
                  type="text"
                  name="classAddress"
                  defaultValue={student?.classAddress}
                  placeholder="Enter class address (optional)"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* 3. Student Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2"> Student Name *</label>
                <input
                  type="text"
                  name="fullName"
                  defaultValue={student?.fullName}
                  placeholder="Enter student name"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent uppercase"
                  style={{ textTransform: 'uppercase' }}
                  required
                />
              </div>

              {/* 4. Student D.O.B */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                   Student D.O.B *
                  {formAge !== null && (
                    <span className={`ml-2 text-sm ${formAge >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                      (Age: {formAge} years)
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  defaultValue={student?.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : ''}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    formAge !== null && formAge < 3 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-slate-200'
                  }`}
                  onChange={(e) => {
                    const age = calculateAge(e.target.value);
                    setFormAge(age);
                  }}
                  required
                />
                {formAge !== null && formAge < 3 && (
                  <p className="text-red-600 text-sm mt-1">
                    ⚠️ Student must be at least 3 years old for enrollment
                  </p>
                )}
              </div>

              {/* 5. Age (Auto-calculated) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Age</label>
                <input
                  type="text"
                  value={formAge !== null ? `${formAge} years` : student?.age ? `${student.age} years` : ''}
                  placeholder="Auto-calculated from DOB"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-100"
                  readOnly
                />
              </div>

              
              {/* 7. Student Joining Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Student Joining Date *</label>
                <input
                  type="date"
                  name="joiningDate"
                  defaultValue={student?.joiningDate ? new Date(student.joiningDate).toISOString().split('T')[0] : ''}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 8. Student Admission Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Student Admission Number *</label>
                <input
                  type="text"
                  name="admissionNumber"
                  defaultValue={student?.admissionNumber}
                  placeholder="Enter admission number"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 9. Student School/College Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2"> Student School/College Name</label>
                <input
                  type="text"
                  name="schoolCollegeName"
                  defaultValue={student?.schoolCollegeName}
                  placeholder="Enter school/college name (optional)"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* 10. Organization Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Organization Name</label>
                <input
                  type="text"
                  name="organizationName"
                  defaultValue={student?.organizationName}
                  placeholder="Enter organization name (optional)"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* 11. Qualification */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2"> Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  defaultValue={student?.qualification}
                  placeholder="Enter qualification (optional)"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Gender *</label>
                <select 
                  name="gender" 
                  defaultValue={student?.gender}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Blood Group</label>
                <select 
                  name="bloodGroup" 
                  defaultValue={student?.bloodGroup}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={student?.email}
                  placeholder="student@example.com"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    defaultValue=""
                    placeholder={isEdit ? "Leave blank to keep current password" : "Enter student password"}
                    className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required={!isEdit}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {isEdit && (
                  <p className="text-xs text-slate-500 mt-1">Leave blank to keep current password</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={student?.phone}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Residential Address *</label>
              <textarea
                name="address"
                rows="3"
                defaultValue={student?.address}
                placeholder="Enter complete address"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                required
              ></textarea>
            </div>
          </div>

          {/* Family Information */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Family Information (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Father Name</label>
                <input
                  type="text"
                  name="fatherName"
                  defaultValue={student?.fatherName}
                  placeholder="Enter father's name (optional)"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mother Name</label>
                <input
                  type="text"
                  name="motherName"
                  defaultValue={student?.motherName}
                  placeholder="Enter mother's name (optional)"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Father's Phone Number</label>
                <input
                  type="tel"
                  name="fatherPhone"
                  defaultValue={student?.fatherPhone}
                  placeholder="+91 9876543210 (optional)"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mother's Phone Number</label>
                <input
                  type="tel"
                  name="motherPhone"
                  defaultValue={student?.motherPhone}
                  placeholder="+91 9876543210 (optional)"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Father Occupation</label>
                <input
                  type="text"
                  name="fatherOccupation"
                  defaultValue={student?.fatherOccupation}
                  placeholder="Enter father's occupation (optional)"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mother Occupation</label>
                <input
                  type="text"
                  name="motherOccupation"
                  defaultValue={student?.motherOccupation}
                  placeholder="Enter mother's occupation (optional)"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              
            </div>
          </div>

          {/* Student Achievements */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Student Achievements (Optional)</h3>
                <div className="mt-2">
                  <div className="flex gap-4">
                    <span className="text-sm font-medium text-slate-600">
                      No. of Events: <span className="text-blue-600 font-bold">
                        {achievements.reduce((total, ach) => {
                          return total + (ach.typePrices?.filter(tp => tp.type).length || 0);
                        }, 0)}
                      </span>
                    </span>
                    <span className="text-sm font-medium text-slate-600">
                      No. of Medals: <span className="text-blue-600 font-bold">
                        {achievements.reduce((total, ach) => {
                          return total + (ach.typePrices?.filter(tp => tp.price).length || 0);
                        }, 0)}
                      </span>
                    </span>
                  </div>
                  {/* Medal Breakdown */}
                  {(() => {
                    const medalCounts = { Gold: 0, Silver: 0, Bronze: 0 };
                    achievements.forEach(ach => {
                      ach.typePrices?.forEach(tp => {
                        if (tp.price) {
                          const medalType = tp.price.toLowerCase();
                          if (medalType.includes('gold')) medalCounts.Gold++;
                          else if (medalType.includes('silver') || medalType.includes('sliver')) medalCounts.Silver++;
                          else if (medalType.includes('bronze')) medalCounts.Bronze++;
                        }
                      });
                    });
                    const total = medalCounts.Gold + medalCounts.Silver + medalCounts.Bronze;
                    return total > 0 && (
                      <div className="text-sm text-slate-600 mt-1">
                        Gold: {medalCounts.Gold}, Silver: {medalCounts.Silver}, Bronze: {medalCounts.Bronze}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddAchievement}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors font-medium text-sm"
                style={{ backgroundColor: '#006CB5' }}
              >
                + Add Achievement
              </button>
            </div>
            {achievements.map((achievement, index) => (
              <div key={index} className="mb-4 p-4 bg-white rounded-lg border-2 border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-slate-700">Achievement {index + 1}</h4>
                  {achievements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievement(index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tournament Name</label>
                    <input
                      type="text"
                      name={`achievement_${index}_tournamentName`}
                      value={achievement.tournamentName || ''}
                      onChange={(e) => handleAchievementChange(index, 'tournamentName', e.target.value)}
                      placeholder="Enter tournament name (optional)"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                    <input
                      type="text"
                      name={`achievement_${index}_address`}
                      value={achievement.address || ''}
                      onChange={(e) => handleAchievementChange(index, 'address', e.target.value)}
                      placeholder="Enter address (optional)"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                    <input
                      type="date"
                      name={`achievement_${index}_date`}
                      value={achievement.date ? (typeof achievement.date === 'string' ? achievement.date.split('T')[0] : new Date(achievement.date).toISOString().split('T')[0]) : ''}
                      onChange={(e) => handleAchievementChange(index, 'date', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Event-Medal Pairs Section */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-slate-700">Achievement Events & Medals</label>
                    <button
                      type="button"
                      onClick={() => handleAddTypePrice(index)}
                      className="px-3 py-1 text-white rounded-md hover:opacity-90 transition-colors font-medium text-xs"
                      style={{ backgroundColor: '#006CB5' }}
                    >
                      + Add Event-Medal
                    </button>
                  </div>
                  {achievement.typePrices && achievement.typePrices.map((typePrice, tpIndex) => (
                    <div key={tpIndex} className="mb-3 p-3 bg-white rounded-md border border-slate-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-600">Event-Medal {tpIndex + 1}</span>
                        {achievement.typePrices.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTypePrice(index, tpIndex)}
                            className="text-red-600 hover:text-red-800 text-xs font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Event</label>
                          <select
                            name={`achievement_${index}_typePrice_${tpIndex}_type`}
                            value={typePrice.type || ''}
                            onChange={(e) => handleTypePriceChange(index, tpIndex, 'type', e.target.value)}
                            className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="">Select Event (optional)</option>
                            <option value="Individual Sparring">Individual Sparring</option>
                            <option value="Group Sparring">Group Sparring</option>
                            <option value="Individual Tuls">Individual Tuls</option>
                            <option value="Group Tuls">Group Tuls</option>
                            <option value="Power Breaking">Power Breaking</option>
                            <option value="Self Defence Techniques">Self Defence Techniques</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Medal</label>
                          <select
                            name={`achievement_${index}_typePrice_${tpIndex}_price`}
                            value={typePrice.price || ''}
                            onChange={(e) => handleTypePriceChange(index, tpIndex, 'price', e.target.value)}
                            className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="">Select medal (optional)</option>
                            <option value="Gold">Gold</option>
                            <option value="Silver">Silver</option>
                            <option value="Bronze">Bronze</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Certificate Code</label>
                          <input
                            type="text"
                            name={`achievement_${index}_typePrice_${tpIndex}_certificateCode`}
                            value={typePrice.certificateCode || ''}
                            onChange={(e) => handleTypePriceChange(index, tpIndex, 'certificateCode', e.target.value)}
                            placeholder="Enter certificate code (optional)"
                            className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Certificate Upload</label>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleTypePriceChange(index, tpIndex, 'certificateFile', file);
                              }
                            }}
                            className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                          {typePrice.certificateFile && typeof typePrice.certificateFile === 'string' && (
                            <p className="text-xs text-green-600 mt-1">Certificate uploaded</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Exam Dates Details */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Exam Dates Details (Optional)</h3>
            
            <div className="space-y-3">
              {/* Yellow Belt Accordion */}
              <div className="bg-white rounded-lg border-2 border-yellow-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleBelt('yellow')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-yellow-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-yellow-400 rounded-full mr-3"></span>
                    <span className="font-semibold text-yellow-700">Yellow Belt</span>
                  </div>
                  <span className="text-yellow-700 text-xl">{expandedBelts.yellow ? '−' : '+'}</span>
                </button>
                {expandedBelts.yellow && (
                  <div className="px-4 pb-4 pt-2 border-t border-yellow-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Stripe Date</label>
                        <input
                          type="date"
                          name="examYellowStripe"
                          defaultValue={student?.examYellowStripe ? new Date(student.examYellowStripe).toISOString().split('T')[0] : ''}
                          className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Belt Date</label>
                        <input
                          type="date"
                          name="examYellowBelt"
                          defaultValue={student?.examYellowBelt ? new Date(student.examYellowBelt).toISOString().split('T')[0] : ''}
                          className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Green Belt Accordion */}
              <div className="bg-white rounded-lg border-2 border-green-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleBelt('green')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
                    <span className="font-semibold text-green-700">Green Belt</span>
                  </div>
                  <span className="text-green-700 text-xl">{expandedBelts.green ? '−' : '+'}</span>
                </button>
                {expandedBelts.green && (
                  <div className="px-4 pb-4 pt-2 border-t border-green-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Stripe Date</label>
                        <input
                          type="date"
                          name="examGreenStripe"
                          defaultValue={student?.examGreenStripe ? new Date(student.examGreenStripe).toISOString().split('T')[0] : ''}
                          className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Belt Date</label>
                        <input
                          type="date"
                          name="examGreenBelt"
                          defaultValue={student?.examGreenBelt ? new Date(student.examGreenBelt).toISOString().split('T')[0] : ''}
                          className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Blue Belt Accordion */}
              <div className="bg-white rounded-lg border-2 border-blue-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleBelt('blue')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-blue-500 rounded-full mr-3"></span>
                    <span className="font-semibold text-blue-700">Blue Belt</span>
                  </div>
                  <span className="text-blue-700 text-xl">{expandedBelts.blue ? '−' : '+'}</span>
                </button>
                {expandedBelts.blue && (
                  <div className="px-4 pb-4 pt-2 border-t border-blue-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Stripe Date</label>
                        <input
                          type="date"
                          name="examBlueStripe"
                          defaultValue={student?.examBlueStripe ? new Date(student.examBlueStripe).toISOString().split('T')[0] : ''}
                          className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Belt Date</label>
                        <input
                          type="date"
                          name="examBlueBelt"
                          defaultValue={student?.examBlueBelt ? new Date(student.examBlueBelt).toISOString().split('T')[0] : ''}
                          className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Red Belt Accordion */}
              <div className="bg-white rounded-lg border-2 border-red-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleBelt('red')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-red-500 rounded-full mr-3"></span>
                    <span className="font-semibold text-red-700">Red Belt</span>
                  </div>
                  <span className="text-red-700 text-xl">{expandedBelts.red ? '−' : '+'}</span>
                </button>
                {expandedBelts.red && (
                  <div className="px-4 pb-4 pt-2 border-t border-red-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Stripe Date</label>
                        <input
                          type="date"
                          name="examRedStripe"
                          defaultValue={student?.examRedStripe ? new Date(student.examRedStripe).toISOString().split('T')[0] : ''}
                          className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Belt Date</label>
                        <input
                          type="date"
                          name="examRedBelt"
                          defaultValue={student?.examRedBelt ? new Date(student.examRedBelt).toISOString().split('T')[0] : ''}
                          className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Black Belt Accordion */}
              <div className="bg-white rounded-lg border-2 border-gray-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleBelt('black')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-gray-800 rounded-full mr-3"></span>
                    <span className="font-semibold text-gray-800">Black Belt</span>
                  </div>
                  <span className="text-gray-800 text-xl">{expandedBelts.black ? '−' : '+'}</span>
                </button>
                {expandedBelts.black && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Stripe Date</label>
                        <input
                          type="date"
                          name="examBlackStripe"
                          defaultValue={student?.examBlackStripe ? new Date(student.examBlackStripe).toISOString().split('T')[0] : ''}
                          className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Belt Date</label>
                        <input
                          type="date"
                          name="examBlackBelt"
                          defaultValue={student?.examBlackBelt ? new Date(student.examBlackBelt).toISOString().split('T')[0] : ''}
                          className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Current Status Accordion */}
              <div className="bg-white rounded-lg border-2 border-amber-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleBelt('current')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">🥋</span>
                    <span className="font-semibold text-amber-700">Current Status & ID</span>
                  </div>
                  <span className="text-amber-700 text-xl">{expandedBelts.current ? '−' : '+'}</span>
                </button>
                {expandedBelts.current && (
                  <div className="px-4 pb-4 pt-2 border-t border-amber-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Current Belt</label>
                        <input
                          type="text"
                          name="currentBeltLevel"
                          defaultValue={student?.currentBeltLevel}
                          placeholder="e.g., Blue Belt"
                          className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">ID Number</label>
                        <input
                          type="text"
                          name="idNumber"
                          defaultValue={student?.idNumber}
                          placeholder="Enter ID"
                          className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button 
              type="button"
              onClick={() => {
                onClose();
                setFormAge(null);
                setPhotoPreview(null);
                setPhotoFile(null);
                setAchievements([{ tournamentName: '', address: '', date: '', typePrices: [{ type: '', price: '', certificateCode: '', certificateFile: '' }], type: '', prize: '' }]);
              }}
              className="px-6 py-3 rounded-xl font-semibold transition-colors"
              style={{ backgroundColor: '#e5e7eb', color: '#374151' }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#006CB5' }}
            >
              {isEdit ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
