import { useState, useEffect } from 'react';
import { 
  FaMedal, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaHistory,
  FaAward,
  FaUsers,
  FaCalendarAlt,
  FaCheckCircle,
  FaEye
} from 'react-icons/fa';

function BeltManagement() {
  const [activeTab, setActiveTab] = useState('levels');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBelt, setSelectedBelt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Data states
  const [beltLevels, setBeltLevels] = useState([]);
  const [students, setStudents] = useState([]);
  const [recentPromotions, setRecentPromotions] = useState([]);
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    recentPromotions: 0,
    upcomingTests: 0,
    blackBelts: 0
  });

  const [beltForm, setBeltForm] = useState({
    name: '',
    level: '',
    color: 'white',
    hex: '#FFFFFF',
    requirements: ['']
  });

  // Predefined belt colors with names
  const beltColors = [
    { name: 'White', value: 'white', hex: '#FFFFFF' },
    { name: 'Yellow', value: 'yellow', hex: '#FFD700' },
    { name: 'Orange', value: 'orange', hex: '#FFA500' },
    { name: 'Green', value: 'green', hex: '#008000' },
    { name: 'Blue', value: 'blue', hex: '#0000FF' },
    { name: 'Purple', value: 'purple', hex: '#800080' },
    { name: 'Brown', value: 'brown', hex: '#8B4513' },
    { name: 'Red', value: 'red', hex: '#FF0000' },
    { name: 'Black', value: 'black', hex: '#000000' }
  ];

  const [promotionForm, setPromotionForm] = useState({
    studentName: '',
    fromBelt: '',
    toBelt: '',
    date: '',
    instructor: ''
  });
  const [testForm, setTestForm] = useState({
    studentName: '',
    currentBelt: '',
    testingFor: '',
    testDate: '',
    readiness: ''
  });
  
  // Autocomplete states
  const [promotionStudentSuggestions, setPromotionStudentSuggestions] = useState([]);
  const [showPromotionSuggestions, setShowPromotionSuggestions] = useState(false);
  const [testStudentSuggestions, setTestStudentSuggestions] = useState([]);
  const [showTestSuggestions, setShowTestSuggestions] = useState(false);
  const [promotionStudentError, setPromotionStudentError] = useState('');
  const [testStudentError, setTestStudentError] = useState('');
  
  // View/Edit states for promotions and tests
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showViewPromotionModal, setShowViewPromotionModal] = useState(false);
  const [showEditPromotionModal, setShowEditPromotionModal] = useState(false);
  const [showViewTestModal, setShowViewTestModal] = useState(false);
  const [showEditTestModal, setShowEditTestModal] = useState(false);

  // API base URL - using direct backend URL to bypass proxy issues
  const API_BASE_URL = 'http://localhost:5000/api';

  // Log API URL on component mount
  useEffect(() => {
    console.log('🌐 BeltManagement Component Loaded');
    console.log('📍 API_BASE_URL:', API_BASE_URL);
    console.log('🔑 Initial auth token:', localStorage.getItem('token') ? 'Found in localStorage' : 'Not found');
  }, []);

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('✅ Setting auth token from localStorage');
      setAuthToken(token);
    } else {
      console.log('⚠️ No token in localStorage, showing login modal');
      setShowLoginModal(true);
    }
  }, []);

  // Manual login function
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        const token = data.data.token;
        setAuthToken(token);
        localStorage.setItem('token', token);
        setShowLoginModal(false);
        return true;
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

  // Fetch belt levels
  const fetchBeltLevels = async () => {
    if (!authToken) {
      console.log('❌ No auth token, skipping fetch');
      return;
    }
    
    console.log('🔄 Fetching belt levels from:', `${API_BASE_URL}/belts/levels`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/belts/levels`, {
        headers: getAuthHeaders()
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔒 Unauthorized - clearing token');
          localStorage.removeItem('token');
          setAuthToken(null);
          setShowLoginModal(true);
          return;
        }
        throw new Error('Failed to fetch belt levels');
      }

      const data = await response.json();
      console.log('✅ Belt levels data received:', data);
      console.log('🔍 Data structure:', JSON.stringify(data, null, 2));
      console.log('🔍 data.data:', data.data);
      console.log('🔍 data.data.belts:', data.data?.belts);
      
      if (data.status === 'success') {
        const belts = data.data?.belts || [];
        console.log('📊 Setting belt levels:', belts.length, 'belts');
        console.log('📊 Belt data:', belts);
        setBeltLevels(belts);
      }
    } catch (error) {
      console.error('❌ Error fetching belt levels:', error);
      alert('Error fetching belt levels. Please try again.');
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    if (!authToken) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch students');

      const data = await response.json();
      if (data.status === 'success') {
        setStudents(data.data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Fetch promotions
  const fetchPromotions = async () => {
    if (!authToken) return;
    
    try {
      // Fetch all promotions (not just recent 5) for accurate belt tracking
      const response = await fetch(`${API_BASE_URL}/belts/promotions`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch promotions');

      const data = await response.json();
      if (data.status === 'success') {
        setRecentPromotions(data.data.promotions);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  // Fetch belt tests
  const fetchBeltTests = async () => {
    if (!authToken) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/belts/tests?upcoming=true&limit=4`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch belt tests');

      const data = await response.json();
      if (data.status === 'success') {
        setUpcomingTests(data.data.tests);
      }
    } catch (error) {
      console.error('Error fetching belt tests:', error);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    if (!authToken) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/belts/statistics`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch statistics');

      const data = await response.json();
      if (data.status === 'success') {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Load all data
  useEffect(() => {
    console.log('🔄 useEffect triggered - authToken:', authToken ? 'Present' : 'Missing');
    
    if (authToken) {
      console.log('✅ Auth token found, loading data...');
      setLoading(true);
      Promise.all([
        fetchBeltLevels(),
        fetchStudents(),
        fetchPromotions(),
        fetchBeltTests(),
        fetchStatistics()
      ]).finally(() => {
        console.log('✅ All data loaded');
        setLoading(false);
      });
    } else {
      console.log('⚠️ No auth token, skipping data load');
    }
  }, [authToken]);

  // Close autocomplete dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.autocomplete-container')) {
        setShowPromotionSuggestions(false);
        setShowTestSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getBeltColor = (color, hex) => {
    return color === 'white' ? '#E5E7EB' : hex;
  };

  const getReadinessColor = (readiness) => {
    if (readiness >= 90) return 'text-green-600 bg-green-100';
    if (readiness >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const handleFormChange = (field, value) => {
    setBeltForm(prev => {
      const newForm = {
        ...prev,
        [field]: value
      };
      
      // Auto-update hex when color changes
      if (field === 'color') {
        const selectedColor = beltColors.find(c => c.value === value);
        if (selectedColor) {
          newForm.hex = selectedColor.hex;
        }
      }
      
      return newForm;
    });
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...beltForm.requirements];
    newRequirements[index] = value;
    setBeltForm(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  const addRequirement = () => {
    setBeltForm(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index) => {
    if (beltForm.requirements.length > 1) {
      const newRequirements = beltForm.requirements.filter((_, i) => i !== index);
      setBeltForm(prev => ({
        ...prev,
        requirements: newRequirements
      }));
    }
  };

  const resetForm = () => {
    setBeltForm({
      name: '',
      level: '',
      color: 'white',
      hex: '#FFFFFF',
      requirements: ['']
    });
  };

  const resetPromotionForm = () => {
    setPromotionForm({
      studentName: '',
      fromBelt: '',
      toBelt: '',
      date: '',
      instructor: ''
    });
  };

  const resetTestForm = () => {
    setTestForm({
      studentName: '',
      currentBelt: '',
      testingFor: '',
      testDate: '',
      readiness: ''
    });
  };

  const handlePromotionFormChange = (field, value) => {
    setPromotionForm(prev => {
      const newForm = {
        ...prev,
        [field]: value
      };
      
      // Handle student name autocomplete
      if (field === 'studentName') {
        if (value.trim() === '') {
          setPromotionStudentSuggestions([]);
          setShowPromotionSuggestions(false);
          newForm.fromBelt = '';
        } else {
          // Filter students by name
          const filtered = students.filter(s => 
            s.fullName.toLowerCase().includes(value.toLowerCase())
          );
          setPromotionStudentSuggestions(filtered);
          setShowPromotionSuggestions(true);
          
          // Check for exact match and auto-populate belt
          const exactMatch = students.find(s => s.fullName === value);
          if (exactMatch && exactMatch.currentBelt) {
            // Map student's currentBelt enum to belt name
            const beltMapping = {
              'white': 'White Belt',
              'yellow': 'Yellow Belt',
              'green': 'Green Belt',
              'blue': 'Blue Belt',
              'red': 'Red Belt',
              'black-1st': 'Black Belt 1st Dan',
              'black-2nd': 'Black Belt 2nd Dan',
              'black-3rd': 'Black Belt 3rd Dan'
            };
            
            const mappedBeltName = beltMapping[exactMatch.currentBelt];
            
            // Find the exact belt name from beltLevels
            const matchingBelt = beltLevels.find(belt => 
              belt.name === mappedBeltName || 
              belt.color === exactMatch.currentBelt.split('-')[0]
            );
            
            if (matchingBelt) {
              newForm.fromBelt = matchingBelt.name;
            }
          } else {
            newForm.fromBelt = '';
          }
        }
      }
      
      return newForm;
    });
  };
  
  const selectPromotionStudent = (student) => {
    setPromotionForm(prev => {
      const newForm = {
        ...prev,
        studentName: student.fullName
      };
      
      // Auto-populate belt
      if (student.currentBelt) {
        const beltMapping = {
          'white': 'White Belt',
          'yellow': 'Yellow Belt',
          'green': 'Green Belt',
          'blue': 'Blue Belt',
          'red': 'Red Belt',
          'black-1st': 'Black Belt 1st Dan',
          'black-2nd': 'Black Belt 2nd Dan',
          'black-3rd': 'Black Belt 3rd Dan'
        };
        
        const mappedBeltName = beltMapping[student.currentBelt];
        const matchingBelt = beltLevels.find(belt => 
          belt.name === mappedBeltName || 
          belt.color === student.currentBelt.split('-')[0]
        );
        
        if (matchingBelt) {
          newForm.fromBelt = matchingBelt.name;
        }
      }
      
      return newForm;
    });
    setShowPromotionSuggestions(false);
  };

  const handleTestFormChange = (field, value) => {
    setTestForm(prev => {
      const newForm = {
        ...prev,
        [field]: value
      };
      
      // Handle student name autocomplete
      if (field === 'studentName') {
        if (value.trim() === '') {
          setTestStudentSuggestions([]);
          setShowTestSuggestions(false);
          newForm.currentBelt = '';
        } else {
          // Filter students by name
          const filtered = students.filter(s => 
            s.fullName.toLowerCase().includes(value.toLowerCase())
          );
          setTestStudentSuggestions(filtered);
          setShowTestSuggestions(true);
          
          // Check for exact match and auto-populate belt
          const exactMatch = students.find(s => s.fullName === value);
          if (exactMatch) {
            // First, check if student has any promotions
            const studentPromotions = recentPromotions.filter(p => p.studentName === exactMatch.fullName);
            
            if (studentPromotions.length > 0) {
              // Sort by date to get the most recent promotion
              const sortedPromotions = studentPromotions.sort((a, b) => {
                const dateA = new Date(a.promotionDate || a.date);
                const dateB = new Date(b.promotionDate || b.date);
                return dateB - dateA; // Most recent first
              });
              
              // Use the "toBelt" from the most recent promotion
              newForm.currentBelt = sortedPromotions[0].toBelt;
            } else if (exactMatch.currentBelt) {
              // Fallback to student's currentBelt if no promotions found
              const beltMapping = {
                'white': 'White Belt',
                'yellow': 'Yellow Belt',
                'green': 'Green Belt',
                'blue': 'Blue Belt',
                'red': 'Red Belt',
                'black-1st': 'Black Belt 1st Dan',
                'black-2nd': 'Black Belt 2nd Dan',
                'black-3rd': 'Black Belt 3rd Dan'
              };
              
              const mappedBeltName = beltMapping[exactMatch.currentBelt];
              
              // Find the exact belt name from beltLevels
              const matchingBelt = beltLevels.find(belt => 
                belt.name === mappedBeltName || 
                belt.color === exactMatch.currentBelt.split('-')[0]
              );
              
              if (matchingBelt) {
                newForm.currentBelt = matchingBelt.name;
              }
            }
          } else {
            newForm.currentBelt = '';
          }
        }
      }
      
      return newForm;
    });
  };
  
  const selectTestStudent = (student) => {
    setTestForm(prev => {
      const newForm = {
        ...prev,
        studentName: student.fullName
      };
      
      // First, check if student has any promotions
      const studentPromotions = recentPromotions.filter(p => p.studentName === student.fullName);
      
      if (studentPromotions.length > 0) {
        // Sort by date to get the most recent promotion
        const sortedPromotions = studentPromotions.sort((a, b) => {
          const dateA = new Date(a.promotionDate || a.date);
          const dateB = new Date(b.promotionDate || b.date);
          return dateB - dateA; // Most recent first
        });
        
        // Use the "toBelt" from the most recent promotion
        newForm.currentBelt = sortedPromotions[0].toBelt;
      } else if (student.currentBelt) {
        // Fallback to student's currentBelt if no promotions found
        const beltMapping = {
          'white': 'White Belt',
          'yellow': 'Yellow Belt',
          'green': 'Green Belt',
          'blue': 'Blue Belt',
          'red': 'Red Belt',
          'black-1st': 'Black Belt 1st Dan',
          'black-2nd': 'Black Belt 2nd Dan',
          'black-3rd': 'Black Belt 3rd Dan'
        };
        
        const mappedBeltName = beltMapping[student.currentBelt];
        const matchingBelt = beltLevels.find(belt => 
          belt.name === mappedBeltName || 
          belt.color === student.currentBelt.split('-')[0]
        );
        
        if (matchingBelt) {
          newForm.currentBelt = matchingBelt.name;
        }
      }
      
      return newForm;
    });
    setShowTestSuggestions(false);
  };

  const handleAddBelt = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!beltForm.name || !beltForm.level) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate requirements
    const validRequirements = beltForm.requirements.filter(req => req.trim() !== '');
    if (validRequirements.length === 0) {
      alert('Please add at least one requirement');
      return;
    }

    console.log('➕ Adding new belt:', beltForm);

    try {
      const response = await fetch(`${API_BASE_URL}/belts/levels`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...beltForm,
          requirements: validRequirements
        })
      });

      const data = await response.json();
      console.log('📥 Add belt response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create belt level');
      }

      if (data.status === 'success') {
        console.log('✅ Belt added successfully, refreshing list...');
        alert('Belt level added successfully!');
        setShowAddModal(false);
        resetForm();
        
        // Wait for the fetch to complete before showing success
        await fetchBeltLevels();
        await fetchStatistics();
        
        console.log('🔄 Belt list refreshed, current count:', beltLevels.length);
      }
    } catch (error) {
      console.error('❌ Error adding belt:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleRecordPromotion = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!promotionForm.studentName || !promotionForm.fromBelt || !promotionForm.toBelt || !promotionForm.date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/belts/promotions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          studentName: promotionForm.studentName,
          fromBelt: promotionForm.fromBelt,
          toBelt: promotionForm.toBelt,
          promotionDate: promotionForm.date,
          instructor: promotionForm.instructor
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to record promotion');
      }

      if (data.status === 'success') {
        alert('Promotion recorded successfully!');
        setShowPromotionModal(false);
        resetPromotionForm();
        fetchPromotions();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error recording promotion:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleScheduleTest = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!testForm.studentName || !testForm.currentBelt || !testForm.testingFor || !testForm.testDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/belts/tests`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(testForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to schedule test');
      }

      if (data.status === 'success') {
        alert('Test scheduled successfully!');
        setShowTestModal(false);
        resetTestForm();
        fetchBeltTests();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error scheduling test:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditBelt = (belt) => {
    setSelectedBelt(belt);
    setBeltForm({
      name: belt.name,
      level: belt.level,
      color: belt.color,
      hex: belt.hex,
      requirements: belt.requirements || ['']
    });
    setShowEditModal(true);
  };

  const handleUpdateBelt = async (e) => {
    e.preventDefault();
    
    if (!selectedBelt) return;
    
    // Basic validation
    if (!beltForm.name || !beltForm.level) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate requirements
    const validRequirements = beltForm.requirements.filter(req => req.trim() !== '');
    if (validRequirements.length === 0) {
      alert('Please add at least one requirement');
      return;
    }

    console.log('✏️ Updating belt:', selectedBelt._id, beltForm);

    try {
      const response = await fetch(`${API_BASE_URL}/belts/levels/${selectedBelt._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...beltForm,
          requirements: validRequirements
        })
      });

      const data = await response.json();
      console.log('📥 Update belt response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update belt level');
      }

      if (data.status === 'success') {
        console.log('✅ Belt updated successfully');
        alert('Belt level updated successfully!');
        setShowEditModal(false);
        setSelectedBelt(null);
        resetForm();
        
        await fetchBeltLevels();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('❌ Error updating belt:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleViewBelt = (belt) => {
    setSelectedBelt(belt);
    setShowViewModal(true);
  };

  const handleDeleteBelt = async (beltId) => {
    if (!confirm('Are you sure you want to delete this belt level?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/belts/levels/${beltId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete belt level');
      }

      if (data.status === 'success') {
        alert('Belt level deleted successfully!');
        await fetchBeltLevels();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting belt:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Promotion handlers
  const handleViewPromotion = (promotion) => {
    setSelectedPromotion(promotion);
    setShowViewPromotionModal(true);
  };

  const handleEditPromotion = (promotion) => {
    setSelectedPromotion(promotion);
    // Format date to YYYY-MM-DD for input type="date"
    const dateValue = promotion.promotionDate || promotion.date;
    const formattedDate = dateValue ? new Date(dateValue).toISOString().split('T')[0] : '';
    
    setPromotionForm({
      studentName: promotion.studentName,
      fromBelt: promotion.fromBelt,
      toBelt: promotion.toBelt,
      date: formattedDate,
      instructor: promotion.instructor || ''
    });
    setShowEditPromotionModal(true);
  };

  const handleDeletePromotion = async (promotionId) => {
    if (!confirm('Are you sure you want to delete this promotion record?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/belts/promotions/${promotionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete promotion');
      }

      if (data.status === 'success') {
        alert('Promotion deleted successfully!');
        await fetchPromotions();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdatePromotion = async (e) => {
    e.preventDefault();
    
    if (!selectedPromotion) return;
    
    // Basic validation
    if (!promotionForm.studentName || !promotionForm.fromBelt || !promotionForm.toBelt || !promotionForm.date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/belts/promotions/${selectedPromotion._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          studentName: promotionForm.studentName,
          fromBelt: promotionForm.fromBelt,
          toBelt: promotionForm.toBelt,
          promotionDate: promotionForm.date,
          instructor: promotionForm.instructor
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update promotion');
      }

      if (data.status === 'success') {
        alert('Promotion updated successfully!');
        setShowEditPromotionModal(false);
        setSelectedPromotion(null);
        resetPromotionForm();
        await fetchPromotions();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error updating promotion:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Test handlers
  const handleViewTest = (test) => {
    setSelectedTest(test);
    setShowViewTestModal(true);
  };

  const handleEditTest = (test) => {
    setSelectedTest(test);
    // Format date to YYYY-MM-DD for input type="date"
    const formattedDate = test.testDate ? new Date(test.testDate).toISOString().split('T')[0] : '';
    
    setTestForm({
      studentName: test.studentName,
      currentBelt: test.currentBelt,
      testingFor: test.testingFor,
      testDate: formattedDate,
      readiness: test.readiness || ''
    });
    setShowEditTestModal(true);
  };

  const handleDeleteTest = async (testId) => {
    if (!confirm('Are you sure you want to delete this belt test?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/belts/tests/${testId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete test');
      }

      if (data.status === 'success') {
        alert('Belt test deleted successfully!');
        await fetchBeltTests();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdateTest = async (e) => {
    e.preventDefault();
    
    if (!selectedTest) return;
    
    // Basic validation
    if (!testForm.studentName || !testForm.currentBelt || !testForm.testingFor || !testForm.testDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/belts/tests/${selectedTest._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(testForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update test');
      }

      if (data.status === 'success') {
        alert('Belt test updated successfully!');
        setShowEditTestModal(false);
        setSelectedTest(null);
        resetTestForm();
        await fetchBeltTests();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error updating test:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const renderBeltLevels = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold text-slate-900">{statistics.totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Recent Promotions</p>
              <p className="text-3xl font-bold text-slate-900">{statistics.recentPromotions}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaAward className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Upcoming Tests</p>
              <p className="text-3xl font-bold text-slate-900">{statistics.upcomingTests}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <FaCalendarAlt className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Black Belts</p>
              <p className="text-3xl font-bold text-slate-900">{statistics.blackBelts}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <FaMedal className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Belt Level Management</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              fetchBeltLevels();
              fetchStatistics();
            }}
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FaHistory className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add Belt Level</span>
          </button>
        </div>
      </div>

      {/* Belt Levels Table */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-5xl">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-center py-3 px-3 font-semibold text-slate-700" style={{ width: '70px' }}>Color</th>
              <th className="text-left py-3 px-3 font-semibold text-slate-700" style={{ width: '180px' }}>Belt Name</th>
              <th className="text-center py-3 px-3 font-semibold text-slate-700" style={{ width: '70px' }}>Level</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Requirements</th>
              <th className="text-center py-3 px-4 font-semibold text-slate-700" style={{ width: '140px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {beltLevels.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center">
                  <FaMedal className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500 font-medium">No belt levels found</p>
                  <p className="text-slate-400 text-sm mt-1">Click "Add Belt Level" to create one</p>
                </td>
              </tr>
            ) : (
              beltLevels.map((belt) => (
                <tr key={belt._id || belt.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex justify-center">
                      <div 
                        className="w-9 h-9 rounded-full border-2 border-slate-300 shadow-sm"
                        style={{ backgroundColor: getBeltColor(belt.color, belt.hex) }}
                        title={`${belt.color} belt`}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 text-sm">{belt.name}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex justify-center">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {belt.level}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {belt.requirements && belt.requirements.length > 0 ? (
                      <div className="text-xs text-slate-600 space-y-1">
                        {belt.requirements.map((req, index) => (
                          <div key={index}>
                            • {req}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">No requirements</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleViewBelt(belt)}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                          title="View"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditBelt(belt)}
                          className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteBelt(belt._id)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
  );

  const renderPromotions = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Recent Promotions</h3>
        <button 
          onClick={() => setShowPromotionModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <FaPlus className="w-4 h-4" />
          <span>Record Promotion</span>
        </button>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Student</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">From</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">To</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Instructor</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentPromotions.slice(0, 5).map((promotion) => (
                <tr key={promotion._id || promotion.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-slate-600">
                          {promotion.studentName.split(' ').reduce((initials, name) => initials + name[0], '')}
                        </span>
                      </div>
                      <span className="font-medium text-slate-900">{promotion.studentName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                      {promotion.fromBelt}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {promotion.toBelt}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600">{new Date(promotion.promotionDate || promotion.date).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-slate-600">{promotion.instructor}</td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleViewPromotion(promotion)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                        title="View"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditPromotion(promotion)}
                        className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center"
                        title="Edit"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeletePromotion(promotion._id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                        title="Delete"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUpcomingTests = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Upcoming Belt Tests</h3>
        <button 
          onClick={() => setShowTestModal(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <FaCalendarAlt className="w-4 h-4" />
          <span>Schedule Test</span>
        </button>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Student</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Current Belt</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Testing For</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Test Date</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Readiness</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {upcomingTests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <FaCalendarAlt className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500 font-medium">No upcoming tests scheduled</p>
                    <p className="text-slate-400 text-sm mt-1">Click "Schedule Test" to add one</p>
                  </td>
                </tr>
              ) : (
                upcomingTests.map((test) => (
                  <tr key={test._id || test.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-slate-600">
                            {test.studentName.split(' ').reduce((initials, name) => initials + name[0], '')}
                          </span>
                        </div>
                        <span className="font-medium text-slate-900">{test.studentName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                        {test.currentBelt}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {test.testingFor}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {new Date(test.testDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              test.readiness >= 90 ? 'bg-green-500' : 
                              test.readiness >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${test.readiness}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-semibold ${
                          test.readiness >= 90 ? 'text-green-600' : 
                          test.readiness >= 80 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {test.readiness}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleViewTest(test)}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                          title="View"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditTest(test)}
                          className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTest(test._id)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <FaMedal className="mr-3 text-amber-500" />
            Belt Management System
          </h1>
          <p className="text-slate-600 mt-2">Manage student belt levels, promotions, and testing schedules</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-1">
        <div className="flex space-x-1">
          {[
            { id: 'levels', name: 'Belt Levels', icon: FaMedal },
            { id: 'promotions', name: 'Promotions', icon: FaHistory },
            { id: 'tests', name: 'Upcoming Tests', icon: FaCalendarAlt }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'levels' && renderBeltLevels()}
        {activeTab === 'promotions' && renderPromotions()}
        {activeTab === 'tests' && renderUpcomingTests()}
      </div>

      {/* Add Belt Level Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
            {/* Modal Header */}
            <div className="bg-blue-600 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Add New Belt Level</h2>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleAddBelt} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Belt Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={beltForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      placeholder="e.g., White Belt"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Belt Level <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={beltForm.level}
                      onChange={(e) => handleFormChange('level', e.target.value)}
                      placeholder="e.g., 1"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Belt Color <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={beltForm.color}
                    onChange={(e) => handleFormChange('color', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {beltColors.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.name} Belt
                      </option>
                    ))}
                  </select>
                  {/* Color Preview */}
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Preview:</span>
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ 
                        backgroundColor: beltColors.find(c => c.value === beltForm.color)?.hex || '#FFFFFF' 
                      }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">
                      {beltColors.find(c => c.value === beltForm.color)?.name || 'White'} Belt
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Belt Requirements
                    </label>
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition-colors"
                    >
                      <FaPlus className="w-3 h-3 inline mr-1" />
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {beltForm.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                        <input
                          type="text"
                          value={requirement}
                          onChange={(e) => handleRequirementChange(index, e.target.value)}
                          placeholder={`Requirement ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {beltForm.requirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRequirement(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    Add Belt Level
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Belt Level Modal */}
      {showEditModal && selectedBelt && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
            {/* Modal Header */}
            <div className="bg-amber-600 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Edit Belt Level</h2>
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedBelt(null);
                    resetForm();
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleUpdateBelt} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Belt Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={beltForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      placeholder="e.g., White Belt"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Belt Level <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={beltForm.level}
                      onChange={(e) => handleFormChange('level', e.target.value)}
                      placeholder="e.g., 1"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Belt Color <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={beltForm.color}
                    onChange={(e) => handleFormChange('color', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  >
                    {beltColors.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.name} Belt
                      </option>
                    ))}
                  </select>
                  {/* Color Preview */}
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Preview:</span>
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ 
                        backgroundColor: beltColors.find(c => c.value === beltForm.color)?.hex || '#FFFFFF' 
                      }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">
                      {beltColors.find(c => c.value === beltForm.color)?.name || 'White'} Belt
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Belt Requirements
                    </label>
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition-colors"
                    >
                      <FaPlus className="w-3 h-3 inline mr-1" />
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {beltForm.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                        <input
                          type="text"
                          value={requirement}
                          onChange={(e) => handleRequirementChange(index, e.target.value)}
                          placeholder={`Requirement ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        {beltForm.requirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRequirement(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedBelt(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-amber-600 text-white py-2 rounded-md font-medium hover:bg-amber-700 transition-colors"
                  >
                    Update Belt Level
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Record Promotion Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
            {/* Modal Header */}
            <div className="bg-green-600 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Record Promotion</h2>
                <button 
                  onClick={() => {
                    setShowPromotionModal(false);
                    resetPromotionForm();
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleRecordPromotion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative autocomplete-container">
                    <input
                      type="text"
                      value={promotionForm.studentName}
                      onChange={(e) => handlePromotionFormChange('studentName', e.target.value)}
                      onFocus={() => {
                        if (promotionForm.studentName && promotionStudentSuggestions.length > 0) {
                          setShowPromotionSuggestions(true);
                        }
                      }}
                      placeholder="Type student name..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      autoComplete="off"
                    />
                    
                    {/* Autocomplete Dropdown */}
                    {showPromotionSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {promotionStudentSuggestions.length > 0 ? (
                          promotionStudentSuggestions.map((student) => (
                            <div
                              key={student._id}
                              onClick={() => selectPromotionStudent(student)}
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
                            <p className="text-xs text-gray-500 mt-1">No student matches "{promotionForm.studentName}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {promotionForm.studentName && !students.find(s => s.fullName === promotionForm.studentName) && !showPromotionSuggestions && (
                    <p className="text-xs text-red-600 mt-1">⚠️ This student is not in Student Management</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Belt <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={promotionForm.fromBelt}
                      onChange={(e) => handlePromotionFormChange('fromBelt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Current Belt</option>
                      {beltLevels.map((belt) => (
                        <option key={belt._id} value={belt.name}>
                          {belt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Belt <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={promotionForm.toBelt}
                      onChange={(e) => handlePromotionFormChange('toBelt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select New Belt</option>
                      {beltLevels.map((belt) => (
                        <option key={belt._id} value={belt.name}>
                          {belt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Promotion Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={promotionForm.date}
                      onChange={(e) => handlePromotionFormChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructor <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={promotionForm.instructor}
                      onChange={(e) => handlePromotionFormChange('instructor', e.target.value)}
                      placeholder="e.g., Master Kim"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowPromotionModal(false);
                      resetPromotionForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-md font-medium hover:bg-green-700 transition-colors"
                  >
                    Record Promotion
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Promotion Modal */}
      {showViewPromotionModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
            {/* Modal Header */}
            <div className="bg-slate-600 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Promotion Details</h2>
                <button 
                  onClick={() => {
                    setShowViewPromotionModal(false);
                    setSelectedPromotion(null);
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Student Name</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedPromotion.studentName}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">From Belt</label>
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                      {selectedPromotion.fromBelt}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">To Belt</label>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {selectedPromotion.toBelt}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Promotion Date</label>
                    <p className="text-gray-900">{new Date(selectedPromotion.promotionDate || selectedPromotion.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Instructor</label>
                    <p className="text-gray-900">{selectedPromotion.instructor}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button 
                  onClick={() => {
                    setShowViewPromotionModal(false);
                    setSelectedPromotion(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Promotion Modal */}
      {showEditPromotionModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
            {/* Modal Header */}
            <div className="bg-amber-600 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Edit Promotion</h2>
                <button 
                  onClick={() => {
                    setShowEditPromotionModal(false);
                    setSelectedPromotion(null);
                    resetPromotionForm();
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleUpdatePromotion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={promotionForm.studentName}
                    onChange={(e) => handlePromotionFormChange('studentName', e.target.value)}
                    placeholder="Student name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Belt <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={promotionForm.fromBelt}
                      onChange={(e) => handlePromotionFormChange('fromBelt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Current Belt</option>
                      {beltLevels.map((belt) => (
                        <option key={belt._id} value={belt.name}>
                          {belt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Belt <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={promotionForm.toBelt}
                      onChange={(e) => handlePromotionFormChange('toBelt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select New Belt</option>
                      {beltLevels.map((belt) => (
                        <option key={belt._id} value={belt.name}>
                          {belt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Promotion Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={promotionForm.date}
                      onChange={(e) => handlePromotionFormChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructor
                    </label>
                    <input
                      type="text"
                      value={promotionForm.instructor}
                      onChange={(e) => handlePromotionFormChange('instructor', e.target.value)}
                      placeholder="Instructor name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowEditPromotionModal(false);
                      setSelectedPromotion(null);
                      resetPromotionForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-amber-600 text-white py-2 rounded-md font-medium hover:bg-amber-700 transition-colors"
                  >
                    Update Promotion
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
            {/* Modal Header */}
            <div className="bg-amber-600 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Schedule Belt Test</h2>
                <button 
                  onClick={() => {
                    setShowTestModal(false);
                    resetTestForm();
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleScheduleTest} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative autocomplete-container">
                      <input
                        type="text"
                        value={testForm.studentName}
                        onChange={(e) => handleTestFormChange('studentName', e.target.value)}
                        onFocus={() => {
                          if (testForm.studentName && testStudentSuggestions.length > 0) {
                            setShowTestSuggestions(true);
                          }
                        }}
                        placeholder="Type student name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        required
                        autoComplete="off"
                      />
                      
                      {/* Autocomplete Dropdown */}
                      {showTestSuggestions && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {testStudentSuggestions.length > 0 ? (
                            testStudentSuggestions.map((student) => (
                              <div
                                key={student._id}
                                onClick={() => selectTestStudent(student)}
                                className="px-3 py-2 hover:bg-amber-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">{student.fullName}</p>
                                  </div>
                                  <div className="text-xs text-amber-600 font-semibold">Select</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-4 text-center text-red-600">
                              <p className="font-medium">Student not found</p>
                              <p className="text-xs text-gray-500 mt-1">No student matches "{testForm.studentName}"</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {testForm.studentName && !students.find(s => s.fullName === testForm.studentName) && !showTestSuggestions && (
                      <p className="text-xs text-red-600 mt-1">⚠️ This student is not in Student Management</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Belt <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={testForm.currentBelt}
                      onChange={(e) => handleTestFormChange('currentBelt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Current Belt</option>
                      {beltLevels.map((belt) => (
                        <option key={belt._id} value={belt.name}>
                          {belt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Testing For <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={testForm.testingFor}
                      onChange={(e) => handleTestFormChange('testingFor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Target Belt</option>
                      {beltLevels.map((belt) => (
                        <option key={belt._id} value={belt.name}>
                          {belt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={testForm.testDate}
                      onChange={(e) => handleTestFormChange('testDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Readiness Level (%)
                  </label>
                  <input
                    type="number"
                    value={testForm.readiness}
                    onChange={(e) => handleTestFormChange('readiness', e.target.value)}
                    placeholder="e.g., 85"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowTestModal(false);
                      resetTestForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-amber-600 text-white py-2 rounded-md font-medium hover:bg-amber-700 transition-colors"
                  >
                    Schedule Test
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Belt Details Modal */}
      {showViewModal && selectedBelt && (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: getBeltColor(selectedBelt.color, selectedBelt.hex) }}
                  >
                    <FaMedal className="w-6 h-6 text-white drop-shadow" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedBelt.name}</h2>
                    <p className="text-blue-100 text-sm">Level {selectedBelt.level}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedBelt(null);
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Belt Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 mb-1">Belt Color</p>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-slate-300"
                      style={{ backgroundColor: getBeltColor(selectedBelt.color, selectedBelt.hex) }}
                    ></div>
                    <span className="font-semibold text-slate-900 capitalize">{selectedBelt.color}</span>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 mb-1">Belt Level</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedBelt.level}</p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedBelt.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedBelt.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Requirements Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                  <FaCheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  Belt Requirements
                </h3>
                {selectedBelt.requirements && selectedBelt.requirements.length > 0 ? (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <ul className="space-y-2">
                      {selectedBelt.requirements.map((req, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-600 font-bold mt-1">{index + 1}.</span>
                          <span className="text-slate-700 flex-1">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                    <p className="text-slate-500 italic">No requirements specified</p>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              {(selectedBelt.createdAt || selectedBelt.updatedAt) && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {selectedBelt.createdAt && (
                      <div>
                        <span className="text-slate-600">Created: </span>
                        <span className="text-slate-900 font-medium">
                          {new Date(selectedBelt.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedBelt.updatedAt && (
                      <div>
                        <span className="text-slate-600">Last Updated: </span>
                        <span className="text-slate-900 font-medium">
                          {new Date(selectedBelt.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedBelt.createdBy && (
                      <div>
                        <span className="text-slate-600">Created By: </span>
                        <span className="text-slate-900 font-medium">
                          {selectedBelt.createdBy.name || selectedBelt.createdBy.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-slate-200">
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedBelt(null);
                    handleEditBelt(selectedBelt);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <FaEdit className="w-4 h-4" />
                  <span>Edit Belt</span>
                </button>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedBelt(null);
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                >
                  Close
                </button>
              </div>
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
              <p className="text-slate-600 mt-2">Please login to access belt management system</p>
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

export default BeltManagement;
