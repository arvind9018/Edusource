import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
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
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [popupAction, setPopupAction] = useState(null);
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

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password);

    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long.`;
    }
    if (!hasUppercase) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!hasLowercase) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!hasNumber) {
      return "Password must contain at least one number.";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special symbol (e.g., !@#$%^&*).";
    }
    return null;
  };

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

    if (!isLogin) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        displayMessage(passwordError, "error");
        return;
      }
    }

    try {
      let userCred;
      if (isLogin) {
        // --- LOGIN LOGIC ---
        userCred = await signInWithEmailAndPassword(auth, email, password);

        // Check email verification first
        if (!userCred.user.emailVerified) {
          await signOut(auth);
          setVerificationMessage(
            "Please verify your email address before logging in. A verification link has been sent to your email."
          );
          setShowVerificationPopup(true);
          return;
        }

        const userRef = doc(db, "users", userCred.user.uid);
        const userSnap = await getDoc(userRef);
        let fetchedRole = "student"; // Default role

        if (userSnap.exists()) {
          fetchedRole = userSnap.data().role || "student";
        } else {
          console.warn("User document not found for existing user. Defaulting role to 'student'.");
        }

        // --- Instructor Verification Check for Login ---
        if (fetchedRole === 'instructor_pending') {
            await signOut(auth);
            setVerificationMessage("Your instructor account is pending approval. Please wait for admin approval before logging in.");
            setShowVerificationPopup(true);
            return;
        }

        localStorage.setItem("role", fetchedRole);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        
        setVerificationMessage(`Login successful! Welcome back as ${fetchedRole}.`);
        setShowVerificationPopup(true);

      } else {
        // --- SIGN UP LOGIC ---
        userCred = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCred.user);

        const roleToSave = currentRole === 'instructor' ? 'instructor_pending' : currentRole;

        await setDoc(doc(db, "users", userCred.user.uid), {
          name,
          dob,
          email,
          role: roleToSave,
          createdAt: new Date().toISOString(),
        }, { merge: true });

        await signOut(auth);

        if (roleToSave === 'instructor_pending') {
            setVerificationMessage(
                "Your instructor account is pending approval. You'll be able to login once admin approves your request. A verification email has also been sent."
            );
        } else {
            setVerificationMessage(
                "A verification link has been sent to your email address. Please verify your email before logging in."
            );
        }
        
        setShowVerificationPopup(true);
        setEmail("");
        setPassword("");
        setName("");
        setDob("");
        setIsLogin(true);
      }
    } catch (err) {
      console.error("Email auth error:", err);
      
      if (err.code === 'auth/invalid-credential') {
        setVerificationMessage("Account not found. Please create an account first.");
        setPopupAction(() => () => setIsLogin(false));
        setShowVerificationPopup(true);
      } else {
        displayMessage(err.message, "error");
      }
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
        const roleToSave = currentRole === 'instructor' ? 'instructor_pending' : currentRole;
        await setDoc(userRef, {
          email: result.user.email,
          createdAt: new Date().toISOString(),
          role: roleToSave,
        }, { merge: true });
        fetchedRole = roleToSave;
      }

      if (fetchedRole === 'instructor_pending') {
          await signOut(auth);
          setVerificationMessage("Your instructor account is pending approval. Please wait for admin approval before logging in.");
          setShowVerificationPopup(true);
          return;
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", fetchedRole);
      localStorage.setItem("userEmail", result.user.email);
      
      setVerificationMessage(`Login successful! Welcome back as ${fetchedRole}.`);
      setShowVerificationPopup(true);
    } catch (err) {
      console.error("Google login error:", err);
      displayMessage(err.message, "error");
    }
  };

  const handlePopupClose = () => {
    setShowVerificationPopup(false);
    if (popupAction) {
      popupAction();
      setPopupAction(null);
    }
    if (verificationMessage.includes("successful") || verificationMessage.includes("Welcome back")) {
      navigate("/hero-page");
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
                <div className="flex justify-center w-full">
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full sm:w-auto bg-white text-gray-700 py-2 px-4 border border-gray-300 rounded-full font-medium shadow-sm hover:bg-gray-50 transition flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.55-.2-2.31H12v4.39h6.14a5.11 5.11 0 01-2.23 3.39v2.87h3.69c2.16-2 3.42-4.94 3.42-8.29z" fill="#4285F4"/>
                      <path d="M12 23c3.07 0 5.65-1.01 7.54-2.74l-3.69-2.87c-1 .73-2.27 1.16-3.85 1.16-2.95 0-5.46-1.99-6.36-4.66H1.67v2.96C3.56 21.01 7.48 23 12 23z" fill="#34A853"/>
                      <path d="M5.64 14.1c-.27-1.09-.27-2.12 0-3.21V8.04H1.67a10.02 10.02 0 000 7.92L5.64 14.1z" fill="#FBBC04"/>
                      <path d="M12 4.67c1.67 0 3.12.68 4.16 1.63L19.06 3C17.06 1.14 14.73 0 12 0 7.48 0 3.56 1.99 1.67 5.95l3.97 3.09C6.54 6.66 9.05 4.67 12 4.67z" fill="#EA4335"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
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
            <h3 className="text-xl font-bold mb-4" style={{ 
              color: verificationMessage.includes("not found") ? "#DC2626" : 
                     verificationMessage.includes("pending") ? "#F59E0B" : 
                     "#10B981"
            }}>
              {verificationMessage.includes("not found") ? "Account Not Found" :
               verificationMessage.includes("successful") ? "Success!" :
               verificationMessage.includes("pending") ? "Pending Approval" :
               "Verification Required"}
            </h3>
            <p className="text-gray-700 mb-6">
              {verificationMessage}
            </p>
            <button
              onClick={handlePopupClose}
              className="w-full bg-blue-600 text-white py-2 rounded-full font-bold hover:bg-blue-700 transition"
            >
              {verificationMessage.includes("not found") ? "Go to Sign Up" :
               verificationMessage.includes("successful") ? "Continue" :
               "Got it!"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
