// src/components/InstructorDashboard/InstructorDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
    doc, getDoc, setDoc,
    collection, query, where, getDocs, orderBy
} from 'firebase/firestore';
import { auth, db } from '../../firebase';

import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Chip,
    Grid,
    Paper
} from '@mui/material';
import { Dashboard as DashboardIcon, School as CoursesIcon, Article as BlogsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import InstructorProfile from './InstructorProfile';
import InstructorCourses from './InstructorCourses';
import InstructorBlogs from './InstructorBlogs';


const InstructorDashboard = () => {
    const [user, loading] = useAuthState(auth);
    const [instructorData, setInstructorData] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [myCourses, setMyCourses] = useState([]); // This state is still needed for the list of courses
    // Removed myBlogs state because InstructorBlogs now manages its own state
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [specializations, setSpecializations] = useState([]);
    const navigate = useNavigate();

    const displayError = useCallback((msg) => {
        setError(msg);
        setTimeout(() => setError(null), 5000);
    }, []);

    const displaySuccess = useCallback((msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(null), 5000);
    }, []);

    const fetchSpecializationsData = useCallback(async () => {
        try {
            const specializationsCollectionRef = collection(db, 'specializations');
            const specializationsQuery = query(specializationsCollectionRef, orderBy('name'));
            const specializationsSnapshot = await getDocs(specializationsQuery);
            const fetchedSpecializations = specializationsSnapshot.docs.map(doc => {
                const data = doc.data();
                return (data && typeof data.name === 'string' && data.name.trim() !== '') ? data.name : null;
            }).filter(name => name !== null);
            setSpecializations(fetchedSpecializations);
        } catch (err) {
            console.error("Error fetching specializations:", err);
            displayError("Failed to load specializations.");
        }
    }, [displayError]);

    const fetchCoursesData = useCallback(async () => {
        if (!user) return;
        try {
            const coursesQuery = query(
                collection(db, 'courses'),
                where('authorId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
            const coursesSnapshot = await getDocs(coursesQuery);
            setMyCourses(coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error("Error fetching courses:", err);
            displayError("Failed to load courses.");
        }
    }, [user, displayError]);


    const fetchUserData = useCallback(async () => {
        if (!user) {
            setLoadingData(false);
            return;
        }

        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                const role = data.role;
                setUserRole(role);

                if (role !== 'instructor') {
                    navigate(`/${role}-dashboard`);
                    return;
                }
                setInstructorData(data);
            } else {
                await setDoc(userDocRef, {
                    email: user.email, createdAt: new Date().toISOString(),
                    name: '', dob: '', mobile: '', gender: '', qualifications: '', specialization: '',
                    role: 'instructor'
                });
                setInstructorData({ email: user.email, createdAt: new Date().toISOString(), role: 'instructor' });
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
            displayError("Failed to load user data.");
        } finally {
            setLoadingData(false);
        }
    }, [user, navigate, displayError]);

    // Use a single effect to fetch all data
    useEffect(() => {
        if (user) {
            fetchUserData();
            fetchCoursesData();
            fetchSpecializationsData();
        }
    }, [user, fetchUserData, fetchCoursesData, fetchSpecializationsData]);


    const handleProfileUpdateFromChild = useCallback((updatedProfileData) => {
        setInstructorData(prev => ({ ...prev, ...updatedProfileData }));
    }, []);

    // Callback to re-fetch courses and specializations
    const handleCoursesAndSpecializationsUpdated = useCallback(() => {
        fetchCoursesData();
        fetchSpecializationsData();
    }, [fetchCoursesData, fetchSpecializationsData]);


    if (loading || loadingData) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: 'background.default'
            }}>
                <CircularProgress color="primary" />
                <Typography variant="h6" color="text.secondary" sx={{ ml: 2 }}>Loading Dashboard...</Typography>
            </Box>
        );
    }

    if (!user) {
        return (
            <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, mt: 4, backgroundColor: 'background.default' }}>
                <Alert severity="error" sx={{ boxShadow: 1 }} onClose={() => setError(null)}>
                    Please log in to view your dashboard.
                </Alert>
            </Box>
        );
    }

    if (userRole !== 'instructor') {
        return (
            <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, mt: 4, backgroundColor: 'background.default' }}>
                <Alert severity="error" sx={{ boxShadow: 1 }} onClose={() => setError(null)}>
                    Access Denied: This dashboard is for instructors only.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{
            maxWidth: 1400,
            mx: 'auto',
            p: 3,
            minHeight: '100vh',
            backgroundColor: 'grey.100',
            borderRadius: 2,
            boxShadow: 3
        }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}
                sx={{
                    pb: 1,
                    borderBottom: '2px solid',
                    borderColor: 'primary.light',
                    backgroundColor: 'white',
                    borderRadius: '8px 8px 0 0',
                    p: 2,
                    boxShadow: 1
                }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                    <DashboardIcon sx={{ fontSize: '2.5rem', verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
                    Instructor Dashboard
                </Typography>
                <Chip
                    label={`Role: ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`}
                    color="secondary"
                    variant="outlined"
                    sx={{ fontSize: '1rem', p: 1, fontWeight: 'bold' }}
                />
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, boxShadow: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3, boxShadow: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Profile Section */}
                
                    <Paper elevation={4} sx={{ p: 2, height: '100%', backgroundColor: 'white', borderRadius: 2 }}>
                        <Typography variant="h5" color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <DashboardIcon sx={{ mr: 1 }} /> Your Profile
                        </Typography>
                        <InstructorProfile
                            instructorData={instructorData}
                            specializations={specializations}
                            onProfileUpdate={handleProfileUpdateFromChild}
                            onError={displayError}
                            onSuccess={displaySuccess}
                            user={user}
                        />
                    </Paper>
                

                {/* Main Content Area (Courses and Blogs) */}
                
                    <Paper elevation={4} sx={{ p: 2, height: '100%', backgroundColor: 'white', borderRadius: 2 }}>
                        <Typography variant="h5" color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <CoursesIcon sx={{ mr: 1 }} /> Course Management
                        </Typography>
                        <InstructorCourses
                            user={user}
                            instructorData={instructorData}
                            myCourses={myCourses}
                            setMyCourses={setMyCourses} // Retain this for optimistic updates from child
                            specializations={specializations}
                            onError={displayError}
                            onSuccess={displaySuccess}
                            onCoursesUpdated={handleCoursesAndSpecializationsUpdated} // New callback to trigger a full re-fetch
                            fetchSpecializationsData={fetchSpecializationsData} // New prop for InstructorCourseForm
                        />

                        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h5" color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <BlogsIcon sx={{ mr: 1 }} /> Blog Management
                            </Typography>
                            {/* Removed myBlogs prop as InstructorBlogs is now self-contained */}
                            <InstructorBlogs
                                user={user}
                                instructorData={instructorData}
                                onError={displayError}
                                onSuccess={displaySuccess}
                                // onBlogsUpdated is no longer needed as the component fetches its own data
                            />
                        </Box>
                    </Paper>
                </Grid>
            
        </Box>
    );
};

export default InstructorDashboard;