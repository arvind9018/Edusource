import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'student');
          } else {
            setUserRole('student');
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole('student');
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    userRole,
    loading
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};