import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";

import authImage from "../assets/image7 copy.jpg";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const navigate = useNavigate();

  const [currentRole, setCurrentRole] = useState(
    localStorage.getItem("selectedRole") || "student"
  );
  const roleLabel = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);

  useEffect(() => {
    const roleFromStorage = localStorage.getItem("selectedRole");
    if (roleFromStorage) {
      setCurrentRole(roleFromStorage);
    }
  }, []);

  const displayMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      displayMessage("Only valid Gmail addresses are allowed.", "error");
      return;
    }
    if (!email || !password || (!isLogin && (!name || !dob))) {
      displayMessage("All fields are required.", "error");
      return;
    }

    try {
      let userCred;
      if (isLogin) {
        userCred = await signInWithEmailAndPassword(auth, email, password);

        if (!userCred.user.emailVerified) {
          await signOut(auth);
          displayMessage(
            "Please verify your email address before logging in. A verification link has been sent to your email.",
            "error"
          );
          return;
        }

        const userRef = doc(db, "users", userCred.user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const fetchedRole = userSnap.data().role || "student";
          localStorage.setItem("role", fetchedRole);
        } else {
          localStorage.setItem("role", "student");
        }
        
        displayMessage("Login successful!", "success");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        navigate("/hero-page");

      } else {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCred.user);

        await setDoc(doc(db, "users", userCred.user.uid), {
          name,
          dob,
          email,
          role: currentRole,
          createdAt: new Date().toISOString(),
        }, { merge: true });

        await signOut(auth);
        
        setShowVerificationPopup(true);

        setEmail("");
        setPassword("");
        setName("");
        setDob("");
        setIsLogin(true);
      }
    } catch (err) {
      displayMessage(err.message, "error");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);
      let fetchedRole = currentRole;

      if (userSnap.exists()) {
        fetchedRole = userSnap.data().role || currentRole;
      } else {
        await setDoc(userRef, {
          email: result.user.email,
          createdAt: new Date().toISOString(),
          role: currentRole,
        }, { merge: true });
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", fetchedRole);
      localStorage.setItem("userEmail", result.user.email);
      displayMessage("Google login successful!", "success");
      navigate("/hero-page");
    } catch (err) {
      displayMessage(err.message, "error");
    }
  };

  const handlePhoneLogin = async () => {
    try {
      window.recaptchaVerifier = new RecaptchaVerifier("recaptcha", {
        size: "invisible",
        callback: () => {},
      }, auth);

      const confirmation = await signInWithPhoneNumber(auth, `+91${mobile}`, window.recaptchaVerifier);
      window.confirmationResult = confirmation;
      setShowOtpInput(true);
      displayMessage("OTP sent to your mobile number.", "info");
    } catch (err) {
      displayMessage(err.message, "error");
    }
  };

  const verifyOtp = async () => {
    try {
      const result = await window.confirmationResult.confirm(otp);
      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);
      let fetchedRole = currentRole;

      if (userSnap.exists()) {
        fetchedRole = userSnap.data().role || currentRole;
      } else {
        await setDoc(userRef, {
          email: result.user.email || null,
          mobile: mobile,
          createdAt: new Date().toISOString(),
          role: currentRole,
        }, { merge: true });
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", fetchedRole);
      localStorage.setItem("userEmail", result.user.email || mobile);
      displayMessage("Phone login successful!", "success");
      navigate("/hero-page");
    } catch (err) {
      displayMessage("Invalid OTP", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col">
      <div className="relative flex-1 w-full">
        <img src={authImage} alt="Signup" className="w-full h-[100vh] object-cover" />
        <div className="absolute inset-y-0 left-0 w-full md:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-sm p-6 md:p-12 border-2 border-black rounded-xl bg-white shadow-2xl">
            <h2 className="text-3xl font-bold mb-4 text-center text-slate-900">
              {isLogin ? `Login as ${roleLabel}` : `Sign Up as ${roleLabel}`}
            </h2>

            {message && (
              <div
                className={`mb-4 p-3 rounded-md text-sm ${
                  messageType === "success"
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : messageType === "error"
                    ? "bg-red-100 text-red-700 border border-red-300"
                    : "bg-blue-100 text-blue-700 border border-blue-300"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleEmailAuth}>
              {!isLogin && (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mb-3 px-4 py-2 border rounded"
                  />
                  <input
                    type="date"
                    placeholder="Date of Birth"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full mb-3 px-4 py-2 border rounded"
                  />
                </>
              )}

              <input
                type="email"
                placeholder={`Enter ${roleLabel} Email (Only Gmail)`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-3 px-4 py-2 border rounded"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mb-2 px-4 py-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-blue-600 absolute right-3 top-2 hover:underline"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-full font-bold hover:bg-blue-700 transition"
              >
                {isLogin ? "Login with Email" : "Sign Up with Email"}
              </button>
            </form>

            {isLogin && (
              <>
                <p className="my-4 text-center font-semibold">OR</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="w-full sm:w-1/2">
                    {!showOtpInput ? (
                      <>
                        <input
                          type="text"
                          placeholder="Mobile Number"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          className="w-full mb-3 px-4 py-2 border rounded"
                        />
                        <button
                          onClick={handlePhoneLogin}
                          className="w-full bg-orange-500 text-white py-2 rounded-full font-bold hover:bg-orange-600 transition"
                        >
                          Send OTP
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full mb-3 px-4 py-2 border rounded"
                        />
                        <button
                          onClick={verifyOtp}
                          className="w-full bg-green-600 text-white py-2 rounded-full font-bold hover:bg-green-700 transition"
                        >
                          Verify OTP
                        </button>
                      </>
                    )}
                    <div id="recaptcha"></div>
                  </div>

                  <div className="w-full sm:w-1/2">
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full bg-red-500 text-white py-2 rounded-full font-bold hover:bg-red-600 transition"
                    >
                      Sign in with Google
                    </button>
                  </div>
                </div>
              </>
            )}

            <p
              className="mt-4 text-center text-blue-600 cursor-pointer hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </p>
          </div>
        </div>
      </div>
      {showVerificationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
            <h3 className="text-xl font-bold text-green-600 mb-4">
              Registration Successful!
            </h3>
            <p className="text-gray-700 mb-6">
              A verification link has been sent to your email address. Please click the link to verify your account and then log in.
            </p>
            <button
              onClick={() => setShowVerificationPopup(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-full font-bold hover:bg-blue-700 transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;