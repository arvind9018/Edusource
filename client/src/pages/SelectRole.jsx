// src/pages/SelectRole.jsx - Your code is already correct, no changes needed here.
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import image2 from "../assets/image2.jpg";

const SelectRole = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            const userRole = data.role || "student";
            setRole(userRole);
            localStorage.setItem("selectedRole", userRole); // This is the key line
          } else {
            setRole("student");
          }
        } catch (err) {
          console.error("Error fetching role:", err);
          setRole("student");
        }
      } else {
        setUser(null);
        setRole("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRoleSelect = (selectedRole) => {
    localStorage.setItem("selectedRole", selectedRole);
    navigate("/login");
  };

  const goToDashboard = () => {
    if (role === "instructor") {
      navigate("/instructor-dashboard");
    } else {
      navigate("/student-dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c5a84] to-[#1a3c60] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-[#f2e7dc] rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row items-center border-4 border-[#1e2a3a]">
          <img
            src={image2}
            alt="Illustration"
            className="rounded-xl w-full max-w-sm object-cover"
          />

          <div className="md:w-1/2 p-8 flex flex-col justify-center items-center text-center">
            {user ? (
              <>
                <h2 className="text-2xl font-semibold text-green-700 mb-2">
                  ✅ You are already logged in
                </h2>
                <p className="text-lg text-gray-800 mb-2">
                  Role:{" "}
                  <span className="font-bold capitalize text-blue-800">
                    {role}
                  </span>
                </p>
                <button
                  onClick={goToDashboard}
                  className="mt-4 px-6 py-2 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition"
                >
                  Go to Dashboard
                </button>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-[#1e2a3a] mb-6">
                  Select Your Role
                </h2>
                <div className="flex gap-6 flex-wrap justify-center">
                  <button
                    onClick={() => handleRoleSelect("student")}
                    className="px-6 py-2 rounded-full border-2 border-blue-700 text-blue-700 font-semibold hover:bg-blue-700 hover:text-white transition-all duration-300"
                  >
                    Student
                  </button>
                  <button
                    onClick={() => handleRoleSelect("instructor")}
                    className="px-6 py-2 rounded-full border-2 border-green-700 text-green-700 font-semibold hover:bg-green-700 hover:text-white transition-all duration-300"
                  >
                    Instructor
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;