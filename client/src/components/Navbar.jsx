import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { auth, db } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import { debounce } from "lodash";

const Navbar = () => {
  const [isDark, setIsDark] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [courses, setCourses] = useState([]); // State to store courses from Firestore

  const [userRole, setUserRole] = useState(null);
  const [userProfilePicture, setUserProfilePicture] = useState(null);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  // Effect to fetch courses from Firestore
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesCollectionRef = collection(db, "courses");
        const querySnapshot = await getDocs(coursesCollectionRef);
        const coursesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesList);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Effect for user authentication and profile data
  useEffect(() => {
    const darkMode = localStorage.getItem("dark") === "true";
    setIsDark(darkMode);
    document.documentElement.classList.toggle("dark", darkMode);

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
        const userDocRef = doc(db, "users", currentUser.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const fetchedRole = userData.role || "student";
            const fetchedProfilePicture = userData.profilePicture || null;
            setUserRole(fetchedRole);
            setUserProfilePicture(fetchedProfilePicture);
            localStorage.setItem("role", fetchedRole);
            if (!userData.role) {
              navigate("/select-role");
            }
          } else {
            setUserRole(null);
            setUserProfilePicture(null);
            localStorage.removeItem("role");
            navigate("/select-role");
          }
        });
        return () => unsubscribeFirestore();
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserProfilePicture(null);
        localStorage.clear();
      }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  // Effect for handling click outside menus
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToDashboard = () => {
    if (isLoggedIn) {
      if (userRole === "instructor") {
        navigate("/instructor-dashboard");
      } else if (userRole === "student") {
        navigate("/student-dashboard");
      } else {
        navigate("/select-role");
      }
    } else {
      navigate("/login");
    }
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const performSearch = useCallback(
    debounce((query) => {
      if (query.length >= 3) {
        const filtered = courses.filter(course => 
          course.title.toLowerCase().includes(query.toLowerCase()) ||
          course.description.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300),
    [courses]
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.length >= 3) {
      navigate(`/courses?search=${searchQuery}`);
      setMobileMenuOpen(false);
      setShowResults(false);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold tracking-wide hover:text-yellow-300 transform transition-transform duration-300 hover:-translate-y-1">
          🎓 Edusource
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <div className="relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-full px-3 py-1 w-64">
              <FaSearch className="text-gray-500" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-transparent outline-none px-2 py-1 w-full text-black"
              />
            </form>
            {showResults && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white text-black rounded-lg shadow-lg z-50">
                {searchResults.length > 0 ? (
                  searchResults.map(course => (
                    <Link
                      key={course.id}
                      to={`/courses/${course.id}`}
                      onClick={() => setShowResults(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      {course.title}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No results found.</div>
                )}
              </div>
            )}
          </div>

          <Link to="/hero-page" className="hover:text-yellow-300">Home</Link>
          <Link to="/specializations" className="hover:text-yellow-300">Specializations</Link>
          <Link to="/courses" className="hover:text-yellow-300">Courses</Link>

          {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
              {userProfilePicture ? (
                <img src={userProfilePicture} alt="User Profile" className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-yellow-300" onClick={() => setUserMenuOpen((prev) => !prev)} />
              ) : (
                <FaUserCircle className="text-2xl cursor-pointer hover:text-yellow-300" onClick={() => setUserMenuOpen((prev) => !prev)} />
              )}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg z-50">
                  <button onClick={goToDashboard} className="block w-full text-left px-4 py-2 hover:bg-gray-100">User Dashboard</button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="bg-white text-slate-900 font-semibold px-4 py-2 rounded-full hover:bg-yellow-200">Login</Link>
          )}
        </div>

        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-4 bg-white text-black p-4 rounded-lg">
          <div className="relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
              <FaSearch className="text-gray-500" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-transparent outline-none px-2 py-1 w-full"
              />
            </form>
            {showResults && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white text-black rounded-lg shadow-lg z-50">
                {searchResults.length > 0 ? (
                  searchResults.map(course => (
                    <Link
                      key={course.id}
                      to={`/courses/${course.id}`}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowResults(false);
                      }}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      {course.title}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No results found.</div>
                )}
              </div>
            )}
          </div>

          <Link to="/hero-page" className="hover:text-indigo-600" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/specializations" className="hover:text-indigo-600" onClick={() => setMobileMenuOpen(false)}>Specializations</Link>
          <Link to="/courses" className="hover:text-indigo-600" onClick={() => setMobileMenuOpen(false)}>Courses</Link>

          {isLoggedIn ? (
            <>
              <button onClick={goToDashboard} className="text-left hover:text-indigo-600">User Dashboard</button>
              <button onClick={handleLogout} className="text-red-600 text-left">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-blue-600 font-semibold">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;