import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaInstagram, FaGithub, FaTwitter, FaYoutube } from "react-icons/fa";
import { ReactTyped } from "react-typed";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// Firebase Imports
import { collection, query, getDocs, limit, orderBy, doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "../firebase";

import HeroImage from "../assets/image5.jpg";

// Skeleton Card component
const SkeletonCard = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-lg h-full w-full flex flex-col animate-pulse">
        <div className="bg-slate-200 dark:bg-slate-700 rounded mb-4 h-32 sm:h-40 flex-shrink-0"></div>
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-3/4"></div>
        <div className="space-y-2 flex-grow">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
        </div>
        <div className="mt-4 sm:mt-6 h-9 sm:h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
    </div>
);

// SpecializationCard component
const SpecializationCard = ({ spec }) => {
    const navigate = useNavigate();

    const imageUrl = spec.courses && spec.courses.length > 0
        ? spec.courses[0].bannerImage
        : `https://source.unsplash.com/300x200/?${(spec.name || 'technology').split(' ')[0]}`;

    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-red-500 transition-all duration-300 overflow-hidden group h-full flex flex-col min-h-[380px] sm:min-h-[420px]">
            <div className="relative overflow-hidden rounded mb-3 sm:mb-4 h-32 sm:h-40 flex-shrink-0">
                <img
                    src={imageUrl}
                    alt={spec.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/300x200/e2e8f0/475569?text=Image+Error';
                    }}
                />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {spec.name}
            </h3>
            {/* Added short description here */}
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 flex-grow line-clamp-3">
                {spec.shortDescription || 'No description available.'}
            </p>
            <button
                onClick={() => navigate(`/specialization/${spec.id}`)}
                className="w-full bg-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors mt-auto text-sm sm:text-base"
            >
                View Specialization
            </button>
        </div>
    );
};

// CourseCard component
const CourseCard = ({ course }) => {
    const navigate = useNavigate();
    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 overflow-hidden group h-full flex flex-col min-h-[380px] sm:min-h-[420px]">
            <div className="relative overflow-hidden rounded mb-3 sm:mb-4 h-32 sm:h-40 flex-shrink-0">
                <img
                    src={course.bannerImage || `https://source.unsplash.com/300x200/?${(course.title || '').split(' ')[0]}`}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/300x200/e2e8f0/475569?text=Image+Error';
                    }}
                />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {course.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 flex-grow line-clamp-3">
                {course.shortDescription}
            </p>
            <button
                onClick={() => navigate(`/courses/${course.id}`)}
                className="w-full bg-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors mt-auto text-sm sm:text-base"
            >
                Start Learning
            </button>
        </div>
    );
};

// BlogCard component
const BlogCard = ({ blog }) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/blogs/${blog.id}`)}
            className="bg-white dark:bg-slate-700 p-4 sm:p-6 w-full rounded-xl shadow-lg border border-transparent hover:border-pink-400 dark:hover:border-pink-500 transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col min-h-[380px] sm:min-h-[420px]"
        >
            <div className="relative overflow-hidden rounded mb-3 sm:mb-4 h-32 sm:h-40 flex-shrink-0">
                <img
                    src={blog.imageUrl || `https://source.unsplash.com/300x200/?${(blog.title || '').split(' ')[0]}`}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/300x200/e2e8f0/475569?text=Image+Error'; }}
                />
            </div>
            <h4 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-2">
                {blog.title}
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 flex-grow line-clamp-3">
                {blog.content.substring(0, 80)}...
            </p>
            <span className="text-pink-600 dark:text-pink-400 text-sm font-medium hover:underline mt-auto">
                Read Article →
            </span>
        </div>
    );
};


const HeroPage = () => {
    const navigate = useNavigate();
    const [user, loadingAuth] = useAuthState(auth);
    const [userRole, setUserRole] = useState(null);
    const [loadingRole, setLoadingRole] = useState(true);

    const [specializations, setSpecializations] = useState([]);
    const [topCourses, setTopCourses] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (user) {
                setLoadingRole(true);
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        setUserRole(userDocSnap.data().role);
                    } else {
                        console.warn("User document not found for UID:", user.uid);
                        setUserRole(null);
                    }
                } catch (err) {
                    console.error("Error fetching user role:", err);
                    setUserRole(null);
                } finally {
                    setLoadingRole(false);
                }
            } else {
                setUserRole(null);
                setLoadingRole(false);
            }
        };

        fetchUserRole();
    }, [user]);

    useEffect(() => {
        const fetchHomepageData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const [specsSnapshot, coursesSnapshot, blogsSnapshot] = await Promise.all([
                    getDocs(query(collection(db, 'specializations'), orderBy('name'))),
                    getDocs(query(collection(db, 'courses'), orderBy('createdAt', 'desc'), limit(6))),
                    getDocs(query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(4)))
                ]);

                const fetchedSpecializations = specsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    if (!data.courses || data.courses.length === 0) {
                        console.warn(`Specialization '${data.name}' has no courses.`);
                    }
                    return { id: doc.id, ...data };
                });

                setSpecializations(fetchedSpecializations);
                setTopCourses(coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setBlogs(blogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (err) {
                console.error("Error fetching homepage data:", err);
                setError("We couldn't load the page content. Please check your connection and try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchHomepageData();
    }, []);

    const handleGoToDashboard = () => {
        if (userRole === 'student') {
            navigate('/student-dashboard');
        } else if (userRole === 'instructor') {
            navigate('/instructor-dashboard');
        } else {
            console.warn("User role not determined or invalid. Navigating to select-role.");
            navigate('/select-role');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-white">

            {/* 🖼 Hero Section */}
            <section className="relative h-[60vh] sm:h-[80vh]">
                <img src={HeroImage} alt="Hero" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 text-white">
                        Welcome,&nbsp;
                        <ReactTyped
                            strings={["Future Innovator!", "AI Enthusiast!", "Web Developer!", "Cyber Hero!"]}
                            typeSpeed={50}
                            backSpeed={30}
                            loop
                        />
                    </h1>
                    <p className="text-sm sm:text-lg mb-4 sm:mb-6 text-white">Learn Web Dev, AI, Cybersecurity and more</p>
                    <a href="#courses" className="bg-white text-slate-900 px-5 py-1.5 sm:px-6 sm:py-2 font-bold rounded-full hover:scale-105 transition text-sm sm:text-base">
                        Explore Courses
                    </a>
                </div>
            </section>

            {error && (
                <section className="py-8 px-4 text-center bg-red-50 dark:bg-red-900/20">
                    <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">{error}</p>
                </section>
            )}

            {/* 📚 Specializations Section */}
            <section id="specializations" className="py-12 sm:py-16 px-4 sm:px-2 text-center bg-white dark:bg-slate-900">
                <div className="text-center mb-8 sm:mb-10">
                    <h2 className="text-xl sm:text-3xl font-bold">Explore Specializations</h2>
                    <p className="max-w-xl mx-auto text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                        Choose a focus area and dive into expert-designed learning paths.
                    </p>
                </div>
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
                            {Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)}
                        </div>
                    ) : specializations.length > 0 && specializations.length < 4 ? (
                        <div className="flex flex-wrap justify-center gap-6 px-4 sm:px-0">
                            {specializations.map(spec => <div key={spec.id} className="w-full sm:w-auto md:max-w-sm flex-shrink-0"><SpecializationCard spec={spec} /></div>)}
                        </div>
                    ) : specializations.length >= 4 ? (
                        <Swiper
                            spaceBetween={20}
                            autoplay={{ delay: 3000, disableOnInteraction: false, reverseDirection: true }}
                            modules={[Autoplay]}
                            loop={true}
                            slidesPerView={1}
                            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
                            className="pb-10"
                        >
                            {specializations.map((spec) => <SwiperSlide key={spec.id}><SpecializationCard spec={spec} /></SwiperSlide>)}
                        </Swiper>
                    ) : (
                        <p className="text-center text-gray-500 text-sm sm:text-base">No specializations found.</p>
                    )}
                </div>
                <div className="text-center mt-6 sm:mt-8">
                    <a href="/specializations" className="text-indigo-600 font-medium hover:underline text-sm sm:text-base">
                        View All Specializations
                    </a>
                </div>
            </section>

            {/* 📘 Courses Section */}
            <section id="courses" className="py-12 sm:py-16 px-4 sm:px-2 text-center bg-blue dark:bg-slate-700">
                <h2 className="text-xl sm:text-3xl font-bold mb-8 sm:mb-10">Top Courses</h2>
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
                            {Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)}
                        </div>
                    ) : topCourses.length > 0 && topCourses.length < 4 ? (
                        <div className="flex flex-wrap justify-center gap-6 px-4 sm:px-0">
                            {topCourses.map(course => <div key={course.id} className="w-full sm:w-auto md:max-w-sm flex-shrink-0"><CourseCard course={course} /></div>)}
                        </div>
                    ) : topCourses.length >= 4 ? (
                        <Swiper
                            spaceBetween={20}
                            autoplay={{ delay: 3000, disableOnInteraction: false }}
                            modules={[Autoplay]}
                            loop={true}
                            slidesPerView={1}
                            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
                            className="pb-10"
                        >
                            {topCourses.map((course) => <SwiperSlide key={course.id}><CourseCard course={course} /></SwiperSlide>)}
                        </Swiper>
                    ) : (
                        <p className="text-center text-gray-500 text-sm sm:text-base">No courses found.</p>
                    )}
                </div>
                <div className="text-center mt-6 sm:mt-8">
                    <a href="/courses" className="text-indigo-400 font-medium hover:underline text-sm sm:text-base">
                        View All Courses
                    </a>
                </div>
            </section>

            {/* 📝 Blog Section */}
            <section className="py-12 sm:py-16 px-4 bg-blue-50 dark:bg-slate-800">
                <h2 className="text-xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">From the Blog</h2>
                <div className={`max-w-6xl mx-auto gap-6 ${!loading && blogs.length > 0 && blogs.length < 4 ? 'flex flex-wrap justify-center' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
                    ) : blogs.length > 0 ? (
                        blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)
                    ) : (
                        <p className="text-center text-gray-500 col-span-full text-sm sm:text-base">No blogs found.</p>
                    )}
                </div>
                <div className="text-center mt-6 sm:mt-8">
                    <a href="/blogs" className="text-indigo-600 font-medium hover:underline text-sm sm:text-base">
                        View All Blogs
                    </a>
                </div>
            </section>

            {/* 📣 Call to Action Section - Conditional Rendering */}
            {!loadingAuth && (
                !user ? (
                    <section className="py-12 sm:py-20 text-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4">
                        <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">
                            Start Your Learning Journey Today
                        </h2>
                        <a
                            href="/login"
                            className="mt-3 sm:mt-4 inline-block bg-white text-slate-900 px-5 py-1.5 sm:px-6 sm:py-2 rounded-full font-semibold hover:scale-105 transition-transform text-sm sm:text-base"
                        >
                            Sign Up Now
                        </a>
                    </section>
                ) : (
                    <section className="py-12 sm:py-20 text-center bg-gradient-to-r from-green-500 to-teal-600 text-white px-4">
                        <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">
                            Welcome Back, {user.displayName || 'Learner'}!
                        </h2>
                        <p className="text-sm sm:text-lg mb-4 sm:mb-6">Ready to continue your learning journey?</p>
                        <button
                            onClick={handleGoToDashboard}
                            disabled={loadingRole}
                            className="mt-3 sm:mt-4 inline-block bg-white text-slate-900 px-5 py-1.5 sm:px-6 sm:py-2 rounded-full font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                            {loadingRole ? 'Loading Dashboard...' : 'Go to My Dashboard'}
                        </button>
                    </section>
                )
            )}

            {/* 👨‍🏫 About Section */}
            <section className="py-12 sm:py-20 px-4 sm:px-6 text-center bg-white dark:bg-slate-900">
                <h2 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4">About Edusource</h2>
                <p className="max-w-2xl mx-auto text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    Edusource is dedicated to bringing quality tech education. Whether you're learning AI, Web Dev, or Security — we help you grow.
                </p>
            </section>
        </div>
    );
};

export default HeroPage;
