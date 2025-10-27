// Example: Payment Integration on Frontend
// This is a sample implementation for the dashboard or frontend

// ============================================
// 1. Install Razorpay checkout script in your HTML
// ============================================
// Add this to your index.html or layout component:
// <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

// ============================================
// 2. Payment Service (utils/paymentService.js)
// ============================================

class PaymentService {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
  }

  // Create payment order
  async createOrder(studentId, resourceType, resourceId) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            studentId,
            resourceType, // 'course', 'testSeries', 'webinar'
            resourceId,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data;
    } catch (error) {
      console.error("Error creating payment order:", error);
      throw error;
    }
  }

  // Verify payment
  async verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/payment/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  }

  // Initialize Razorpay checkout
  openCheckout(orderData, onSuccess, onFailure) {
    const options = {
      key: orderData.keyId,
      amount: orderData.amount * 100, // Convert to paise
      currency: orderData.currency,
      order_id: orderData.orderId,
      name: "Faculty Pedia",
      description: "Purchase",
      image: "/logo.png", // Your logo URL
      prefill: {
        name: orderData.studentName,
        email: orderData.studentEmail,
        contact: orderData.studentMobile,
      },
      theme: {
        color: "#3399cc",
      },
      handler: async (response) => {
        try {
          // Verify payment with backend
          const verificationResult = await this.verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );

          onSuccess(verificationResult);
        } catch (error) {
          onFailure(error);
        }
      },
      modal: {
        ondismiss: () => {
          onFailure(new Error("Payment cancelled by user"));
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  // Get student payment history
  async getStudentPayments(studentId, page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/payment/student/${studentId}?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching payment history:", error);
      throw error;
    }
  }

  // Get educator payments
  async getEducatorPayments(
    educatorId,
    page = 1,
    limit = 10,
    isSettled = null
  ) {
    try {
      let url = `${this.apiBaseUrl}/api/payment/educator/${educatorId}?page=${page}&limit=${limit}`;
      if (isSettled !== null) {
        url += `&isSettled=${isSettled}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching educator payments:", error);
      throw error;
    }
  }
}

// Export instance
export const paymentService = new PaymentService(
  process.env.NEXT_PUBLIC_API_URL
);

// ============================================
// 3. React Component Example
// ============================================

import React, { useState } from "react";
import { paymentService } from "../utils/paymentService";

export function CoursePaymentButton({ course, studentId }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Step 1: Create payment order
      const orderData = await paymentService.createOrder(
        studentId,
        "course",
        course._id
      );

      // Step 2: Open Razorpay checkout
      paymentService.openCheckout(
        orderData,
        // Success callback
        (verificationResult) => {
          setLoading(false);
          alert("Payment successful! You are now enrolled.");
          // Redirect to course page or refresh
          window.location.href = `/courses/${course._id}`;
        },
        // Failure callback
        (error) => {
          setLoading(false);
          alert(`Payment failed: ${error.message}`);
        }
      );
    } catch (error) {
      setLoading(false);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Processing..." : `Pay ₹${course.fees}`}
    </button>
  );
}

// ============================================
// 4. Payment History Component Example
// ============================================

export function PaymentHistory({ studentId }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, [studentId]);

  const loadPayments = async () => {
    try {
      const data = await paymentService.getStudentPayments(studentId);
      setPayments(data.payments);
      setLoading(false);
    } catch (error) {
      console.error("Error loading payments:", error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Payment History</h2>
      {payments.length === 0 ? (
        <p>No payments yet</p>
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => (
            <div
              key={payment._id}
              className="border p-4 rounded-lg flex justify-between"
            >
              <div>
                <p className="font-semibold">{payment.resourceType}</p>
                <p className="text-sm text-gray-600">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">₹{payment.amount}</p>
                <span
                  className={`text-sm ${
                    payment.status === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {payment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// 5. Educator Revenue Dashboard Component
// ============================================

export function EducatorRevenueDashboard({ educatorId }) {
  const [revenue, setRevenue] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevenueData();
  }, [educatorId]);

  const loadRevenueData = async () => {
    try {
      const data = await paymentService.getEducatorPayments(educatorId);
      setPayments(data.payments);
      setRevenue(data.revenueSummary);
      setLoading(false);
    } catch (error) {
      console.error("Error loading revenue data:", error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Revenue Dashboard</h2>

      {/* Revenue Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold">₹{revenue?.totalRevenue || 0}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold">₹{revenue?.pendingAmount || 0}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Settled</p>
          <p className="text-2xl font-bold">₹{revenue?.settledAmount || 0}</p>
        </div>
      </div>

      {/* Payment List */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Recent Payments</h3>
        {payments.map((payment) => (
          <div
            key={payment._id}
            className="border p-4 rounded-lg flex justify-between"
          >
            <div>
              <p className="font-semibold">
                {payment.studentId?.firstName} {payment.studentId?.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {payment.resourceType} -{" "}
                {new Date(payment.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">₹{payment.educatorRevenue}</p>
              <span
                className={`text-sm ${
                  payment.isSettled ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {payment.isSettled ? "Settled" : "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 6. Usage Example in Course Detail Page
// ============================================

export default function CourseDetailPage({ course, currentUser }) {
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    // Check if user is already enrolled
    checkEnrollment();
  }, [course._id, currentUser._id]);

  const checkEnrollment = async () => {
    // Check if student has this course in their courses array
    const enrolled = currentUser.courses?.includes(course._id);
    setIsEnrolled(enrolled);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-gray-600 mb-6">{course.description.longDesc}</p>

      {isEnrolled ? (
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-green-800 font-semibold">
            ✓ You are enrolled in this course
          </p>
          <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
            Continue Learning
          </button>
        </div>
      ) : (
        <div className="bg-white border p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-3xl font-bold">₹{course.fees}</p>
              <p className="text-sm text-gray-600">One-time payment</p>
            </div>
          </div>

          <CoursePaymentButton course={course} studentId={currentUser._id} />

          <p className="text-xs text-gray-500 mt-4">
            Secure payment powered by Razorpay
          </p>
        </div>
      )}
    </div>
  );
}
