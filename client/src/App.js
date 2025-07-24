import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { CourseProvider } from './context/CourseContext';

// Pages
import Home from "./pages/Home";
import HeroPage from "./pages/HeroPage";
import SelectRole from "./pages/SelectRole";
import Login from "./pages/Login";
import StudentDashboard from "./pages/Student/StudentDashboard";
import InstructorDashboard from "./pages/instructor/InstructordashBoard";
import SpecializationsPage from "./pages/Specializations/index";
import SpecializationDetail from "./pages/Specializations/SpecializationDetail";
import Courses from "./pages/Courses/index";
import CourseDetail from "./pages/Courses/CourseDetail";
import Forum from './pages/Forum';

import ChatBot from './pages/chatbot/index';
import AllBlogsPage from './pages/AllBlogsPage';
import BlogDetailPage from './pages/BlogDetailPage';
import Footer from './pages/Footer';
// Static Pages
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";
import TermsPage from "./pages/Terms";
import PrivacyPage from "./pages/Privacy";

// Components
import Navbar from "./components/Navbar";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center mt-20 text-lg font-semibold font-sans text-gray-700">Loading...</div>;

  return (
    <Router>
      <CourseProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hero-page" element={<HeroPage />} />
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/login" element={<Login />} />
          <Route path="/specializations" element={<SpecializationsPage />} />
          <Route path="/specialization/:id" element={<SpecializationDetail />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />

          {/* Blog Pages */}
          <Route path="/blogs" element={<AllBlogsPage />} />
          <Route path="/blogs/:blogId" element={<BlogDetailPage />} />

          {/* Static Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/forum" element={<Forum />} />
          {/*Chatbot */}
          
          {/* Protected Routes */}
          <Route path="/student-dashboard" element={user ? <StudentDashboard /> : <Navigate to="/login" replace />} />
          <Route path="/instructor-dashboard" element={user ? <InstructorDashboard /> : <Navigate to="/login" replace />} />
          
          
        </Routes>
        <ChatBot/>
        <Footer/>
      </CourseProvider>
    </Router>
  );
};

export default App;
