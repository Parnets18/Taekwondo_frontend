import { useState, useEffect } from 'react';

function FeeManagement() {
  const [feeRecords, setFeeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddFeeModal, setShowAddFeeModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [statistics, setStatistics] = useState({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    totalRecords: 0,
    paidRecords: 0,
    pendingRecords: 0,
    overdueRecords: 0
  });
  const [authToken, setAuthToken] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'Cash',
    transactionId: '',
    paidDate: new Date().toISOString().split('T')[0],
    amount: 0, // Add amount field for partial payments
    lateFee: { amount: 0 },
    discount: { amount: 0, reason: '' },
    notes: ''
  });
  const [newFeeForm, setNewFeeForm] = useState({
    studentName: '',
    course: 'Beginner',
    feeType: 'Monthly Fee',
    amount: 2000,
    dueDate: '',
    discount: { amount: 0, reason: '' },
    notes: ''
  });

  // Autocomplete states
  const [students, setStudents] = useState([]);
  const [studentSuggestions, setStudentSuggestions] = useState([]);
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);

  // API base URL
  const API_BASE_URL = '/api';

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token'); // Use 'token' instead of 'authToken'
    if (token) {
      setAuthToken(token);
    } else {
      setShowLoginModal(true);
    }
  }, []);

  // Manual login function
  const handleLogin = async (email, password) => {
    try {
      console.log('Attempting login with:', email);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', data);

      if (response.ok) {
        if (data.status === 'success') {
          const token = data.data.token;
          setAuthToken(token);
          localStorage.setItem('token', token); // Use 'token' instead of 'authToken'
          setShowLoginModal(false);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // Get auth headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    };
  };

  // Fetch students for autocomplete
  const fetchStudents = async () => {
    if (!authToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setStudents(data.data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  // Fetch fees from backend
  const fetchFees = async () => {
    if (!authToken) return;
    
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split('-');
      
      const params = new URLSearchParams({
        month,
        year,
        ...(filterStatus !== 'all' && { status: filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1) }),
        limit: '50'
      });

      const response = await fetch(`${API_BASE_URL}/fees?${params}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token'); // Use 'token' instead of 'authToken'
          setAuthToken(null);
          setShowLoginModal(true);
          return;
        }
        throw new Error('Failed to fetch fees');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setFeeRecords(data.data.fees);
        setStatistics(data.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
      alert('Error fetching fees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create new fee record
  const createFee = async (feeData) => {
    if (!authToken) {
      alert('Please login first');
      return;
    }

    try {
      console.log('Creating fee with data:', feeData);
      console.log('Using token:', authToken ? 'Token present' : 'No token');
      
      const response = await fetch(`${API_BASE_URL}/fees`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(feeData)
      });

      console.log('Create fee response status:', response.status);
      const data = await response.json();
      console.log('Create fee response data:', data);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setAuthToken(null);
          setShowLoginModal(true);
          throw new Error('Authentication required');
        }
        
        if (response.status === 500) {
          // Handle the specific 500 error with better user feedback
          throw new Error('Server error: There is a technical issue with fee creation. Please contact the administrator or try again later.');
        }
        
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg).join(', ');
          throw new Error(`Validation errors: ${errorMessages}`);
        }
        
        throw new Error(data.message || 'Failed to create fee record');
      }
      
      if (data.status === 'success') {
        fetchFees();
        setShowAddFeeModal(false);
        resetNewFeeForm();
        alert('Fee record created successfully!');
      }
    } catch (error) {
      console.error('Error creating fee:', error);
      alert(`Error creating fee record: ${error.message}`);
    }
  };

  // Record payment
  const recordPayment = async (feeId, paymentData) => {
    if (!authToken) {
      alert('Please login first');
      return;
    }

    try {
      console.log('Recording payment for fee:', feeId);
      console.log('Payment data being sent:', paymentData);
      
      const response = await fetch(`${API_BASE_URL}/fees/${feeId}/payment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData)
      });

      console.log('Record payment response status:', response.status);
      const data = await response.json();
      console.log('Record payment response data:', data);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setAuthToken(null);
          setShowLoginModal(true);
          throw new Error('Authentication required');
        }
        
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => `${err.path}: ${err.msg}`).join(', ');
          throw new Error(`Validation errors: ${errorMessages}`);
        }
        
        throw new Error(data.message || 'Failed to record payment');
      }

      if (data.status === 'success') {
        fetchFees();
        setShowPaymentModal(false);
        resetPaymentForm();
        alert('Payment recorded successfully!');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert(`Error recording payment: ${error.message}`);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchFees();
      fetchStudents();
    }
  }, [authToken, selectedMonth, filterStatus]);

  // Close autocomplete dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-container')) {
        setShowStudentSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const resetPaymentForm = () => {
    setPaymentForm({
      paymentMethod: 'Cash',
      transactionId: '',
      paidDate: new Date().toISOString().split('T')[0],
      amount: 0,
      lateFee: { amount: 0 },
      discount: { amount: 0, reason: '' },
      notes: ''
    });
  };

  const resetNewFeeForm = () => {
    setNewFeeForm({
      studentName: '',
      course: 'Beginner',
      feeType: 'Monthly Fee',
      amount: 2000,
      dueDate: '',
      discount: { amount: 0, reason: '' },
      notes: ''
    });
    setStudentSuggestions([]);
    setShowStudentSuggestions(false);
  };

  const handleStudentNameChange = (value) => {
    setNewFeeForm({...newFeeForm, studentName: value});
    
    if (value.trim() === '') {
      setStudentSuggestions([]);
      setShowStudentSuggestions(false);
    } else {
      // Filter students by name
      const filtered = students.filter(s => 
        s.fullName.toLowerCase().includes(value.toLowerCase())
      );
      setStudentSuggestions(filtered);
      setShowStudentSuggestions(true);
    }
  };

  const selectStudent = (student) => {
    setNewFeeForm({...newFeeForm, studentName: student.fullName});
    setShowStudentSuggestions(false);
  };

  const handleRecordPayment = (record) => {
    setSelectedRecord(record);
    // Calculate remaining amount for default payment
    const totalAmount = record.amount + (record.lateFee?.amount || 0) - (record.discount?.amount || 0);
    const remainingAmount = totalAmount - (record.totalPaidAmount || 0);
    setPaymentForm(prev => ({
      ...prev,
      amount: remainingAmount > 0 ? remainingAmount : totalAmount
    }));
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    
    // Calculate remaining balance
    const totalAmount = selectedRecord.amount + (selectedRecord.lateFee?.amount || 0) - (selectedRecord.discount?.amount || 0);
    const remainingBalance = totalAmount - (selectedRecord.totalPaidAmount || 0);
    
    // Validate payment amount
    if (paymentForm.amount > remainingBalance) {
      alert(`Error: Payment amount (₹${paymentForm.amount.toLocaleString()}) cannot exceed remaining balance (₹${remainingBalance.toLocaleString()})`);
      return;
    }
    
    const paymentData = {
      paymentMethod: paymentForm.paymentMethod,
      paidDate: paymentForm.paidDate,
      amount: parseFloat(paymentForm.amount) || 0
    };

    // Only add optional fields if they have values
    if (paymentForm.transactionId && paymentForm.transactionId.trim()) {
      paymentData.transactionId = paymentForm.transactionId.trim();
    }

    if (paymentForm.lateFee.amount > 0) {
      paymentData.lateFee = {
        amount: paymentForm.lateFee.amount
      };
    }

    if (paymentForm.discount.amount > 0) {
      paymentData.discount = {
        amount: paymentForm.discount.amount,
        reason: paymentForm.discount.reason || ''
      };
    }

    if (paymentForm.notes && paymentForm.notes.trim()) {
      paymentData.notes = paymentForm.notes.trim();
    }

    console.log('Final payment data:', paymentData);
    recordPayment(selectedRecord._id, paymentData);
  };

  const handleAddFee = (e) => {
    e.preventDefault();
    
    const feeData = {
      studentName: newFeeForm.studentName,
      course: newFeeForm.course,
      feeType: newFeeForm.feeType,
      amount: parseFloat(newFeeForm.amount),
      dueDate: newFeeForm.dueDate,
      ...(newFeeForm.discount.amount > 0 && { discount: newFeeForm.discount }),
      ...(newFeeForm.notes && { notes: newFeeForm.notes })
    };

    createFee(feeData);
  };

  const handleExportReport = () => {
    const csvContent = [
      ['Fee ID', 'Student Name', 'Course', 'Fee Type', 'Amount', 'Due Date', 'Status', 'Payment Method', 'Transaction ID'],
      ...feeRecords.map(record => [
        record.feeId || record._id,
        record.studentName,
        record.course,
        record.feeType,
        record.amount,
        new Date(record.dueDate).toLocaleDateString(),
        record.status,
        record.paymentMethod || '',
        record.transactionId || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee_report_${selectedMonth}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowPreviewModal(true);
  };

  if (loading && authToken) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">Fee Management</h1>
          <p className="text-slate-600">Track and manage student fee payments digitally</p>
        </div>
        <button 
          onClick={() => setShowAddFeeModal(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 flex items-center space-x-2"
        >
          <span>Add Fee Record</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 text-center">
          <div className="text-3xl font-black text-blue-600 mb-2">₹{statistics.totalAmount.toLocaleString()}</div>
          <div className="text-slate-600 font-medium">Total Expected</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 text-center">
          <div className="text-3xl font-black text-green-600 mb-2">₹{statistics.paidAmount.toLocaleString()}</div>
          <div className="text-slate-600 font-medium">Amount Collected</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 text-center">
          <div className="text-3xl font-black text-red-600 mb-2">₹{(statistics.pendingAmount + statistics.overdueAmount + (statistics.partialAmount || 0)).toLocaleString()}</div>
          <div className="text-slate-600 font-medium">Pending Amount</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 text-center">
          <div className="text-3xl font-black text-amber-600 mb-2">
            {statistics.totalAmount > 0 ? Math.round((statistics.paidAmount / statistics.totalAmount) * 100) : 0}%
          </div>
          <div className="text-slate-600 font-medium">Collection Rate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Select Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={handleExportReport}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors font-semibold"
            >
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Fee Records Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 font-bold text-slate-800 text-sm">Fee ID</th>
                <th className="text-left py-3 px-4 font-bold text-slate-800 text-sm">Student</th>
                <th className="text-left py-3 px-4 font-bold text-slate-800 text-sm">Course</th>
                <th className="text-left py-3 px-4 font-bold text-slate-800 text-sm">Fee Type</th>
                <th className="text-left py-3 px-4 font-bold text-slate-800 text-sm">Total Amount</th>
                <th className="text-left py-3 px-4 font-bold text-slate-800 text-sm">Balance</th>
                <th className="text-left py-3 px-4 font-bold text-slate-800 text-sm">Due Date</th>
                <th className="text-left py-3 px-4 font-bold text-slate-800 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-bold text-slate-800 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feeRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500">
                    No fee records found for the selected criteria
                  </td>
                </tr>
              ) : (
                feeRecords.map((record, index) => (
                  <tr key={record._id} className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-amber-50 transition-colors`}>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 text-sm">{record.feeId || record._id.slice(-6)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 text-sm">{record.studentName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-600 text-sm">{record.course}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-600 text-sm">{record.feeType}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">
                        ₹{(record.amount + (record.lateFee?.amount || 0) - (record.discount?.amount || 0)).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        {(() => {
                          const totalAmount = record.amount + (record.lateFee?.amount || 0) - (record.discount?.amount || 0);
                          // If status is 'Paid', balance should be 0
                          if (record.status === 'Paid') {
                            return (
                              <div className="font-bold text-green-600">
                                0
                              </div>
                            );
                          }
                          // Otherwise calculate remaining balance
                          const remainingBalance = totalAmount - (record.totalPaidAmount || 0);
                          return remainingBalance > 0 ? (
                            <div className="font-bold text-red-600">
                              ₹{remainingBalance.toLocaleString()}
                            </div>
                          ) : (
                            <div className="font-bold text-green-600">
                              0
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-600 text-sm">{new Date(record.dueDate).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : record.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : record.status === 'Overdue'
                          ? 'bg-red-100 text-red-800'
                          : record.status === 'Partial'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {/* Calculate remaining balance */}
                        {(() => {
                          const totalAmount = record.amount + (record.lateFee?.amount || 0) - (record.discount?.amount || 0);
                          // If status is 'Paid', payment is complete
                          const isFullyPaid = record.status === 'Paid';
                          
                          return (
                            <>
                              <button 
                                onClick={() => handleRecordPayment(record)}
                                disabled={isFullyPaid}
                                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                  isFullyPaid
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                              >
                                {isFullyPaid ? 'Paid' : 'Pay'}
                              </button>
                              <button 
                                onClick={() => handleViewRecord(record)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                View
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>



      {/* Payment Modal */}
      {showPaymentModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Record Payment</h2>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="text-sm text-blue-600 mb-1 font-medium">Student</div>
              <div className="font-bold text-slate-800 text-lg">{selectedRecord.studentName}</div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="text-sm text-blue-600 font-medium">Total Amount</div>
                  <div className="text-xl font-black text-slate-800">
                    ₹{(selectedRecord.amount + (selectedRecord.lateFee?.amount || 0) - (selectedRecord.discount?.amount || 0)).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-blue-600 font-medium">
                    {selectedRecord.status === 'Paid' ? 'Additional Payment' : 'Amount Due'}
                  </div>
                  <div className="text-xl font-black text-slate-800">
                    ₹{((selectedRecord.amount + (selectedRecord.lateFee?.amount || 0) - (selectedRecord.discount?.amount || 0)) - (selectedRecord.totalPaidAmount || 0)).toLocaleString()}
                  </div>
                </div>
              </div>
              
              {selectedRecord.totalPaidAmount > 0 && (
                <div className="mt-3 p-3 bg-green-100 rounded-lg">
                  <div className="text-sm text-green-700 font-medium">Already Paid: ₹{selectedRecord.totalPaidAmount.toLocaleString()}</div>
                  <div className="text-xs text-green-600">
                    {selectedRecord.status === 'Paid' ? 'Fee is fully paid. You can add additional payments if needed.' : 'This is a partial payment. You can pay the remaining amount or add more.'}
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Payment Amount (₹) *</label>
                <input 
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={((selectedRecord.amount + (selectedRecord.lateFee?.amount || 0) - (selectedRecord.discount?.amount || 0)) - (selectedRecord.totalPaidAmount || 0))}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 0})}
                  placeholder="Enter payment amount"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  required
                />
                <div className="text-xs text-slate-500 mt-1">
                  Maximum allowed: ₹{((selectedRecord.amount + (selectedRecord.lateFee?.amount || 0) - (selectedRecord.discount?.amount || 0)) - (selectedRecord.totalPaidAmount || 0)).toLocaleString()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Payment Method *</label>
                  <select 
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Payment Date *</label>
                  <input 
                    type="date"
                    value={paymentForm.paidDate}
                    onChange={(e) => setPaymentForm({...paymentForm, paidDate: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Transaction ID (Optional)</label>
                <input 
                  type="text" 
                  value={paymentForm.transactionId}
                  onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
                  placeholder="Enter transaction reference number"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Late Fee (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={paymentForm.lateFee.amount}
                    onChange={(e) => setPaymentForm({
                      ...paymentForm, 
                      lateFee: { ...paymentForm.lateFee, amount: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Discount Amount (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={paymentForm.discount.amount}
                    onChange={(e) => setPaymentForm({
                      ...paymentForm, 
                      discount: { ...paymentForm.discount, amount: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" 
                  />
                </div>
              </div>

              {paymentForm.discount.amount > 0 && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Discount Reason</label>
                  <input 
                    type="text" 
                    value={paymentForm.discount.reason}
                    onChange={(e) => setPaymentForm({
                      ...paymentForm, 
                      discount: { ...paymentForm.discount, reason: e.target.value }
                    })}
                    placeholder="Enter reason for discount"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" 
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Notes (Optional)</label>
                <textarea 
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  placeholder="Add any additional notes about this payment"
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none" 
                />
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-3">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Payment Amount:</span>
                    <span className="font-semibold">₹{paymentForm.amount.toLocaleString()}</span>
                  </div>
                  {paymentForm.lateFee.amount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Late Fee (included):</span>
                      <span className="font-semibold">₹{paymentForm.lateFee.amount.toLocaleString()}</span>
                    </div>
                  )}
                  {paymentForm.discount.amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount (included):</span>
                      <span className="font-semibold">₹{paymentForm.discount.amount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-300 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total Payment:</span>
                      <span className="text-slate-800">₹{paymentForm.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 mt-1">
                      <span>Remaining After Payment:</span>
                      <span>₹{Math.max(0, (selectedRecord.amount + (selectedRecord.lateFee?.amount || 0) - (selectedRecord.discount?.amount || 0)) - (selectedRecord.totalPaidAmount || 0) - paymentForm.amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Fee Modal */}
      {showAddFeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Add Fee Record</h2>
              <button 
                onClick={() => setShowAddFeeModal(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddFee} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Student Name *</label>
                  <div className="relative autocomplete-container">
                    <input 
                      type="text"
                      value={newFeeForm.studentName}
                      onChange={(e) => handleStudentNameChange(e.target.value)}
                      onFocus={() => {
                        if (newFeeForm.studentName && studentSuggestions.length > 0) {
                          setShowStudentSuggestions(true);
                        }
                      }}
                      placeholder="Type student name..."
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                      required
                      autoComplete="off"
                    />
                    
                    {/* Autocomplete Dropdown */}
                    {showStudentSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {studentSuggestions.length > 0 ? (
                          studentSuggestions.map((student) => (
                            <div
                              key={student._id}
                              onClick={() => selectStudent(student)}
                              className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{student.fullName}</p>
                                </div>
                                <div className="text-xs text-green-600 font-semibold">Select</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center text-red-600">
                            <p className="font-medium">Student not found</p>
                            <p className="text-xs text-gray-500 mt-1">No student matches "{newFeeForm.studentName}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {newFeeForm.studentName && !students.find(s => s.fullName === newFeeForm.studentName) && !showStudentSuggestions && (
                    <p className="text-xs text-red-600 mt-1">⚠️ This student is not in Student Management</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Course *</label>
                  <select 
                    value={newFeeForm.course}
                    onChange={(e) => {
                      const course = e.target.value;
                      let amount = 2000;
                      if (course === 'Intermediate') amount = 2500;
                      if (course === 'Advanced') amount = 3000;
                      if (newFeeForm.feeType === 'Registration Fee') amount = 500;
                      if (newFeeForm.feeType === 'Exam Fee') amount = 300;
                      setNewFeeForm({...newFeeForm, course, amount});
                    }}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    required
                  >
                    <option value="Beginner">Beginner Course</option>
                    <option value="Intermediate">Intermediate Course</option>
                    <option value="Advanced">Advanced Course</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Fee Type *</label>
                  <select 
                    value={newFeeForm.feeType}
                    onChange={(e) => {
                      const feeType = e.target.value;
                      let amount = newFeeForm.amount;
                      
                      // Auto-set amount based on fee type
                      if (feeType === 'Registration Fee') amount = 500;
                      else if (feeType === 'Exam Fee') amount = 300;
                      else if (feeType === 'Monthly Fee') {
                        if (newFeeForm.course === 'Beginner') amount = 2000;
                        else if (newFeeForm.course === 'Intermediate') amount = 2500;
                        else if (newFeeForm.course === 'Advanced') amount = 3000;
                      }
                      
                      setNewFeeForm({...newFeeForm, feeType, amount});
                    }}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    required
                  >
                    <option value="Monthly Fee">Monthly Fee</option>
                    <option value="Registration Fee">Registration Fee</option>
                    <option value="Exam Fee">Exam Fee</option>
                    <option value="Equipment Fee">Equipment Fee</option>
                    <option value="Late Fee">Late Fee</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Amount (₹) *</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={newFeeForm.amount}
                    onChange={(e) => setNewFeeForm({...newFeeForm, amount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Due Date *</label>
                <input 
                  type="date"
                  value={newFeeForm.dueDate}
                  onChange={(e) => setNewFeeForm({...newFeeForm, dueDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Discount Amount (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={newFeeForm.discount.amount}
                    onChange={(e) => setNewFeeForm({
                      ...newFeeForm, 
                      discount: { ...newFeeForm.discount, amount: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" 
                  />
                </div>

                {newFeeForm.discount.amount > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Discount Reason</label>
                    <input 
                      type="text" 
                      value={newFeeForm.discount.reason}
                      onChange={(e) => setNewFeeForm({
                        ...newFeeForm, 
                        discount: { ...newFeeForm.discount, reason: e.target.value }
                      })}
                      placeholder="Enter reason for discount"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" 
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Notes (Optional)</label>
                <textarea 
                  value={newFeeForm.notes}
                  onChange={(e) => setNewFeeForm({...newFeeForm, notes: e.target.value})}
                  placeholder="Add any additional notes about this fee record"
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none" 
                />
              </div>

              {/* Fee Summary */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                <h4 className="font-bold text-slate-800 mb-3">Fee Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Student:</span>
                    <span className="font-semibold">{newFeeForm.studentName || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Course:</span>
                    <span className="font-semibold">{newFeeForm.course}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Fee Type:</span>
                    <span className="font-semibold">{newFeeForm.feeType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Base Amount:</span>
                    <span className="font-semibold">₹{newFeeForm.amount.toLocaleString()}</span>
                  </div>
                  {newFeeForm.discount.amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span className="font-semibold">-₹{newFeeForm.discount.amount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-amber-300 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Final Amount:</span>
                      <span className="text-slate-800">
                        ₹{(newFeeForm.amount - (newFeeForm.discount.amount || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowAddFeeModal(false)}
                  className="flex-1 bg-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg"
                >
                  Add Fee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showPreviewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Fee Record Details</h2>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Student Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-blue-600 font-medium">Student Name</div>
                    <div className="text-lg font-semibold text-slate-800">{selectedRecord.studentName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-600 font-medium">Course</div>
                    <div className="text-lg font-semibold text-slate-800">{selectedRecord.course}</div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-600 font-medium">Fee ID</div>
                    <div className="text-lg font-semibold text-slate-800">{selectedRecord.feeId || selectedRecord._id.slice(-6)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-600 font-medium">Fee Type</div>
                    <div className="text-lg font-semibold text-slate-800">{selectedRecord.feeType}</div>
                  </div>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Amount Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Base Amount:</span>
                    <span className="text-xl font-bold text-slate-800">₹{selectedRecord.amount.toLocaleString()}</span>
                  </div>
                  
                  {selectedRecord.lateFee?.amount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-red-600">Late Fee:</span>
                      <span className="text-lg font-semibold text-red-600">+₹{selectedRecord.lateFee.amount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {selectedRecord.discount?.amount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-600">Discount:</span>
                      <span className="text-lg font-semibold text-green-600">-₹{selectedRecord.discount.amount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-amber-300 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-slate-800">Total Amount:</span>
                      <span className="text-2xl font-black text-slate-800">
                        ₹{(selectedRecord.amount + (selectedRecord.lateFee?.amount || 0) - (selectedRecord.discount?.amount || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {(selectedRecord.status === 'Paid' || selectedRecord.status === 'Partial') && (
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 font-semibold">Amount Paid:</span>
                      <span className="text-xl font-bold text-blue-600">
                        ₹{(selectedRecord.totalPaidAmount || (selectedRecord.amount + (selectedRecord.lateFee?.amount || 0) - (selectedRecord.discount?.amount || 0))).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-amber-300 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-slate-800">Balance Due:</span>
                      {(() => {
                        // If status is 'Paid', balance should be 0
                        if (selectedRecord.status === 'Paid') {
                          return (
                            <span className="text-2xl font-black text-green-600">
                              0
                            </span>
                          );
                        }
                        // Otherwise calculate remaining balance
                        const totalAmount = selectedRecord.amount + (selectedRecord.lateFee?.amount || 0) - (selectedRecord.discount?.amount || 0);
                        const remainingBalance = totalAmount - (selectedRecord.totalPaidAmount || 0);
                        return remainingBalance > 0 ? (
                          <span className="text-2xl font-black text-red-600">
                            ₹{remainingBalance.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-2xl font-black text-green-600">
                            0
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Payment Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-600 font-medium">Status</div>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mt-1 ${
                      selectedRecord.status === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedRecord.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : selectedRecord.status === 'Overdue'
                        ? 'bg-red-100 text-red-800'
                        : selectedRecord.status === 'Partial'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedRecord.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 font-medium">Due Date</div>
                    <div className="text-lg font-semibold text-slate-800">{new Date(selectedRecord.dueDate).toLocaleDateString()}</div>
                  </div>
                  
                  {(selectedRecord.status === 'Paid' || selectedRecord.status === 'Partial') && (
                    <>
                      <div>
                        <div className="text-sm text-slate-600 font-medium">Payment Method</div>
                        <div className="text-lg font-semibold text-slate-800">{selectedRecord.paymentMethod}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 font-medium">Last Payment Date</div>
                        <div className="text-lg font-semibold text-slate-800">{new Date(selectedRecord.paidDate).toLocaleDateString()}</div>
                      </div>
                      {selectedRecord.transactionId && (
                        <div className="md:col-span-2">
                          <div className="text-sm text-slate-600 font-medium">Transaction ID</div>
                          <div className="text-lg font-semibold text-slate-800">{selectedRecord.transactionId}</div>
                        </div>
                      )}
                      {selectedRecord.receiptNumber && (
                        <div className="md:col-span-2">
                          <div className="text-sm text-slate-600 font-medium">Receipt Number</div>
                          <div className="text-lg font-semibold text-blue-600">{selectedRecord.receiptNumber}</div>
                        </div>
                      )}
                      {selectedRecord.status === 'Partial' && (
                        <div className="md:col-span-2">
                          <div className="text-sm text-slate-600 font-medium">Total Paid Amount</div>
                          <div className="text-lg font-semibold text-blue-600">₹{(selectedRecord.totalPaidAmount || 0).toLocaleString()}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Payment History */}
              {selectedRecord.paymentHistory && selectedRecord.paymentHistory.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Payment History</h3>
                  <div className="space-y-3">
                    {selectedRecord.paymentHistory.map((payment, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <div className="text-green-600 font-medium">Amount</div>
                            <div className="font-semibold text-slate-800">₹{payment.amount.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-green-600 font-medium">Method</div>
                            <div className="text-slate-800">{payment.paymentMethod}</div>
                          </div>
                          <div>
                            <div className="text-green-600 font-medium">Date</div>
                            <div className="text-slate-800">{new Date(payment.paidDate).toLocaleDateString()}</div>
                          </div>
                          {payment.transactionId && (
                            <div className="md:col-span-3">
                              <div className="text-green-600 font-medium">Transaction ID</div>
                              <div className="text-slate-800">{payment.transactionId}</div>
                            </div>
                          )}
                          {payment.notes && (
                            <div className="md:col-span-3">
                              <div className="text-green-600 font-medium">Notes</div>
                              <div className="text-slate-800">{payment.notes}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {(selectedRecord.notes || selectedRecord.discount?.reason) && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Additional Information</h3>
                  {selectedRecord.discount?.reason && (
                    <div className="mb-3">
                      <div className="text-sm text-purple-600 font-medium">Discount Reason</div>
                      <div className="text-slate-800">{selectedRecord.discount.reason}</div>
                    </div>
                  )}
                  {selectedRecord.notes && (
                    <div>
                      <div className="text-sm text-purple-600 font-medium">Notes</div>
                      <div className="text-slate-800">{selectedRecord.notes}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Record Information */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Record Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 font-medium">Created On</div>
                    <div className="text-slate-800">{new Date(selectedRecord.createdAt).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-medium">Last Updated</div>
                    <div className="text-slate-800">{new Date(selectedRecord.updatedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="flex-1 bg-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-400 transition-colors"
              >
                Close
              </button>
              {(() => {
                const totalAmount = selectedRecord.amount + (selectedRecord.lateFee?.amount || 0) - (selectedRecord.discount?.amount || 0);
                // If status is 'Paid', payment is complete
                const isFullyPaid = selectedRecord.status === 'Paid';
                
                return (
                  <button 
                    onClick={() => {
                      setShowPreviewModal(false);
                      handleRecordPayment(selectedRecord);
                    }}
                    disabled={isFullyPaid}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                      isFullyPaid
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : selectedRecord.status === 'Paid'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                    }`}
                  >
                    {isFullyPaid ? 'Payment Complete' : selectedRecord.status === 'Paid' ? 'Add Additional Payment' : 'Record Payment'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white font-bold">A</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Admin Login Required</h2>
              <p className="text-slate-600 mt-2">Please login to access fee management system</p>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const email = formData.get('email');
              const password = formData.get('password');
              
              const success = await handleLogin(email, password);
              if (!success) {
                alert('Login failed. Please check your credentials and try again.');
              }
            }} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  defaultValue="admin@combatwarrior.com"
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  defaultValue="admin123"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  required
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="text-sm text-blue-800">
                  <strong>Demo Credentials:</strong><br/>
                  Email: admin@combatwarrior.com<br/>
                  Password: admin123
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg"
              >
                Login to Dashboard
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeeManagement;