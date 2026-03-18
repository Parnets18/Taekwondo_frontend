import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import {
  MdAttachMoney,
  MdCheckCircle,
  MdPending,
  MdPerson,
  MdAccountBalanceWallet,
  MdCalendarToday,
  MdReceiptLong,
} from "react-icons/md";

const StudentFees = () => {
  const navigate = useNavigate();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
  });

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://taekwondo-backend-j8w4.onrender.com/api";

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      navigate("/verify-certificate");
      return;
    }
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("studentToken");

      const response = await fetch(`${API_BASE_URL}/student-portal/fees`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === "success") {
          const feesList = data.data?.fees || [];

          // Transform fees to match mobile app format
          const transformedFees = feesList.map((fee) => {
            const amount = parseFloat(fee.amount || 0);
            const totalPaidAmount = parseFloat(fee.totalPaidAmount || 0);
            const lateFeeAmount = parseFloat(fee.lateFee?.amount || 0);
            const discountAmount = parseFloat(fee.discount?.amount || 0);

            // Calculate total amount including late fee and discount
            const totalAmount = amount + lateFeeAmount - discountAmount;

            // Calculate pending amount
            const pendingAmount = Math.max(0, totalAmount - totalPaidAmount);

            return {
              ...fee,
              amount: totalAmount,
              paidAmount: totalPaidAmount,
              pendingAmount: pendingAmount,
            };
          });

          setFees(transformedFees);
          calculateStats(transformedFees);
        }
      }
    } catch (error) {
      console.error("Error loading fees:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (feesList) => {
    const totals = feesList.reduce(
      (acc, fee) => {
        const amount = parseFloat(fee?.amount || 0);
        const paidAmount = parseFloat(fee?.paidAmount || 0);
        const pendingAmount = parseFloat(
          fee?.pendingAmount || amount - paidAmount,
        );

        acc.totalAmount += amount;
        acc.paidAmount += paidAmount;
        acc.pendingAmount += Math.max(0, pendingAmount);

        return acc;
      },
      { totalAmount: 0, paidAmount: 0, pendingAmount: 0 },
    );

    setStats(totals);
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "paid") return "#4CAF50";
    if (statusLower === "pending") return "#FF9800";
    if (statusLower === "overdue") return "#F44336";
    if (statusLower === "partial") return "#2196F3";
    return "#666";
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "paid") return <MdCheckCircle />;
    if (statusLower === "pending" || statusLower === "overdue")
      return <MdPending />;
    if (statusLower === "partial") return <MdAccountBalanceWallet />;
    return <MdPending />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
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
            <h1 className="text-2xl font-bold text-white">My Fees</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <MdAttachMoney className="w-5 h-5 mx-auto text-gray-600 mb-2" />
            <p className="text-xl font-bold text-gray-900 mb-1">
              ₹{stats.totalAmount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 font-semibold">Total Fees</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <MdCheckCircle className="w-5 h-5 mx-auto text-green-500 mb-2" />
            <p className="text-xl font-bold text-green-600 mb-1">
              ₹{stats.paidAmount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 font-semibold">Paid</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <MdPending className="w-5 h-5 mx-auto text-blue-500 mb-2" />
            <p className="text-xl font-bold text-blue-600 mb-1">
              ₹{stats.pendingAmount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 font-semibold">Pending</p>
          </div>
        </div>

        {/* Fees List */}
        {fees.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <MdReceiptLong className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-bold text-gray-600 mb-2">No Fees</p>
            <p className="text-gray-500">No fees data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fees.map((fee, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-4">
                {/* Fee Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {fee.course || "Course"}
                    </p>
                    <p className="text-xs text-gray-600 font-medium">
                      ID: {fee.feeId || "N/A"}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl"
                    style={{ backgroundColor: getStatusColor(fee.status) }}
                  >
                    <span className="text-white text-sm">
                      {getStatusIcon(fee.status)}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {fee.status || "Pending"}
                    </span>
                  </div>
                </div>

                {/* Fee Details */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center">
                    <MdPerson className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-600 font-medium flex-1">
                      Student:
                    </span>
                    <span className="text-sm text-gray-900 font-semibold">
                      {fee.studentName || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <MdAttachMoney className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-600 font-medium flex-1">
                      Total:
                    </span>
                    <span className="text-sm text-gray-900 font-semibold">
                      ₹{parseFloat(fee.amount || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <MdAccountBalanceWallet className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600 font-medium flex-1">
                      Paid:
                    </span>
                    <span className="text-sm text-green-600 font-semibold">
                      ₹{parseFloat(fee.paidAmount || 0).toLocaleString()}
                    </span>
                  </div>

                  {(fee.pendingAmount || 0) > 0 && (
                    <div className="flex items-center">
                      <MdPending className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-600 font-medium flex-1">
                        Pending:
                      </span>
                      <span className="text-sm text-blue-600 font-semibold">
                        ₹{parseFloat(fee.pendingAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <MdCalendarToday className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-600 font-medium flex-1">
                      Due Date:
                    </span>
                    <span className="text-sm text-gray-900 font-semibold">
                      {formatDate(fee.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFees;
