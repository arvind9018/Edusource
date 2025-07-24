// src/components/RazorpayCheckoutButton.jsx
import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, Box, Alert, Typography } from '@mui/material';
import { useCourse } from '../context/CourseContext';
import usedRazorpay from '../hooks/useRazorpay';

// IMPORTANT: Replace with the actual URL of your deployed external serverless function
const RAZORPAY_BACKEND_ENDPOINT = 'http://localhost:3001/api/razorpay'; // Use your local dev server for testing
// const RAZORPAY_BACKEND_ENDPOINT = 'https://your-deployed-serverless-url/api/razorpay'; // For deployment


const RazorpayCheckoutButton = ({ course, onPaymentSuccess }) => {
  const { currentUser } = useCourse();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { loadRazorpayScript, isScriptLoaded } = usedRazorpay();

  useEffect(() => {
    loadRazorpayScript();
  }, [loadRazorpayScript]);

  const handlePayment = async () => {
    setError('');
    setSuccessMessage('');

    if (!currentUser) {
      setError('You must be logged in to make a payment.');
      return;
    }

    if (!isScriptLoaded) {
      setError('Razorpay script not loaded. Please wait a moment or refresh.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Call your EXTERNAL backend to create a Razorpay order
      const orderResponse = await fetch(RAZORPAY_BACKEND_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await currentUser.getIdToken()}`, // Pass user token for auth on your custom backend
        },
        body: JSON.stringify({
          action: 'create_order', // Action for your unified backend endpoint
          amount: course.price * 100, // Razorpay expects amount in paisa
          currency: 'INR',
          courseId: course.id,
          userId: currentUser.uid, // Pass userId for backend order notes/receipts
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success || !orderData.orderId) {
        throw new Error(orderData.error || 'Failed to create Razorpay order from backend.');
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Use React environment variable for public key
        amount: orderData.amount, // Amount from backend order
        currency: orderData.currency,
        name: 'EduSource',
        description: course.title,
        order_id: orderData.orderId,
        handler: async function (response) {
          // This function is called after successful payment on Razorpay's popup
          setLoading(true); // Re-set loading for post-payment processing

          try {
            // Step 3: Call your EXTERNAL backend to verify payment and enroll user
            const verificationResponse = await fetch(RAZORPAY_BACKEND_ENDPOINT, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await currentUser.getIdToken()}`, // Still good to pass token
              },
              body: JSON.stringify({
                action: 'verify_payment', // Action for your unified backend endpoint
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                courseId: course.id,
                courseTitle: course.title, // Pass title for enrollment record
                userId: currentUser.uid, // Pass userId for backend verification/enrollment
              }),
            });

            const verificationResult = await verificationResponse.json();

            if (!verificationResponse.ok || !verificationResult.success) {
                throw new Error(verificationResult.message || 'Payment verification failed on backend.');
            }

            if (verificationResult.status === 'success' || verificationResult.status === 'already_enrolled') {
              setSuccessMessage(verificationResult.message);
              if (onPaymentSuccess) {
                onPaymentSuccess(); // Notify parent (CourseDetailPage) to update enrollment status
              }
            } else {
              setError(verificationResult.message || 'Payment verification failed unexpectedly.');
            }

          } catch (err) {
            console.error("Error storing enrollment after payment:", err);
            setError("Payment successful, but enrollment failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
          contact: currentUser.phoneNumber || '',
        },
        notes: {
          courseId: course.id,
          userId: currentUser.uid,
          userEmail: currentUser.email,
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error("Razorpay Payment Failed:", response.error);
        setError(response.error.description || "Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      console.error("Razorpay initiation error:", err);
      setError(err.message || "Failed to initiate payment. Please try again.");
    } finally {
        setLoading(false); // Ensure loading stops if pop-up doesn't open
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={24} color="primary" />
        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>Processing Payment...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {error && <Alert severity="error" sx={{ mb: 1, width: '100%', boxShadow: 1 }} onClose={() => setError('')}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 1, width: '100%', boxShadow: 1 }} onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}
      <Button
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        onClick={handlePayment}
        // Disable if loading, script not loaded, or user not logged in
        disabled={loading || !isScriptLoaded || !currentUser}
        sx={{
          bgcolor: '#3399cc',
          '&:hover': { bgcolor: '#2b7db1' },
          mt: 2
        }}
      >
        {isScriptLoaded ? `Buy Now (₹${course.price})` : 'Loading Payment Gateway...'}
      </Button>
      {!isScriptLoaded && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Please wait while payment gateway loads.
        </Typography>
      )}
      {!currentUser && (
        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
          Login to make a purchase.
        </Typography>
      )}
    </Box>
  );
};

export default RazorpayCheckoutButton;