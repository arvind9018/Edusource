// src/hooks/useRazorpay.js
import React, { useState, useEffect, useCallback } from 'react';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

const useRazorpay = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [error, setError] = useState(null);

  const loadRazorpayScript = useCallback(() => {
    if (window.Razorpay) {
      setIsScriptLoaded(true);
      setError(null); // Clear any previous error if script is found
      return;
    }

    const existingScript = document.getElementById('razorpay-checkout-script');
    if (existingScript) {
        // Script already exists, but might not be loaded. Wait for it or assume it will load.
        // For simplicity, we just return if it's already in the DOM.
        // A more robust solution might track its load state via events.
        return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script'; // Give it an ID to check for existence
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      setError(null);
    };
    script.onerror = () => {
      setIsScriptLoaded(false);
      setError('Failed to load Razorpay script. Please check your internet connection.');
      console.error('Failed to load Razorpay script.');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove the script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []); // Empty dependency array means this function is created once

  // No automatic useEffect call for loadRazorpayScript here,
  // the RazorpayCheckoutButton will explicitly call it.

  return { isScriptLoaded, error, loadRazorpayScript };
};

export default useRazorpay;