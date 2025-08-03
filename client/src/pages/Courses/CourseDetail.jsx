import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'; // Import updateDoc and arrayUnion
import { db } from '../../firebase'; // Assuming this path is correct
import { useCourse } from '../../context/CourseContext'; // Assuming this path is correct

// CORRECTED PATHS FOR IMPORTS BELOW:
import { enrollFreeCourse } from '../../utils/paymentHelper'; // Corrected path
import RazorpayCheckoutButton from '../../components/RazorpayCheckoutButton'; // Corrected path

import {
    Container, Typography, Box, Chip, Button, CircularProgress, Alert, Paper,
    Accordion, AccordionSummary, AccordionDetails, Grid, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LoginIcon from '@mui/icons-material/Login';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import LockIcon from '@mui/icons-material/Lock';


const CourseDetailPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { currentUser, userRole, loading: userLoading } = useCourse();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentProcessing, setEnrollmentProcessing] = useState(false);

    // Function to fetch course details and check enrollment status
    const fetchCourseAndEnrollment = async () => {
        if (!courseId) {
            setError("Course ID is missing.");
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const courseDocRef = doc(db, 'courses', courseId);
            const courseDocSnap = await getDoc(courseDocRef);

            if (courseDocSnap.exists()) {
                const courseData = { id: courseDocSnap.id, ...courseDocSnap.data() };
                setCourse(courseData);
                if (currentUser && currentUser.uid && courseData.enrolledUsers?.includes(currentUser.uid)) {
                    setIsEnrolled(true);
                } else {
                    setIsEnrolled(false);
                }
            } else {
                setError('Course not found.');
            }
        } catch (err) {
            console.error("Error fetching course:", err);
            setError("Failed to load course details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userLoading) {
            fetchCourseAndEnrollment();
        }
    }, [courseId, currentUser, userLoading]);

    // Callback for when payment or free enrollment is successful
    const handleEnrollmentSuccess = async () => {
        await fetchCourseAndEnrollment(); // Re-fetch course data to update enrollment status
        setError(''); // Clear any previous errors
        // You might want to display a toast message here
    };

    const handleFreeEnroll = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        if (userRole === 'instructor') {
            setError('Instructors cannot enroll in courses.');
            return;
        }
        setEnrollmentProcessing(true);
        setError('');
        try {
            await enrollFreeCourse(currentUser.uid, course.id, course.title);
            // setIsEnrolled(true); // handleEnrollmentSuccess will set this
            setEnrollmentProcessing(false);
            alert('Successfully enrolled in the free course!'); // You might replace this with a more sophisticated notification
            handleEnrollmentSuccess();
        } catch (err) {
            console.error("Error enrolling in free course:", err);
            setError("Failed to enroll in the free course. Please try again.");
            setEnrollmentProcessing(false);
        }
    };

    if (loading || userLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress color="primary" size={60} />
                <Typography variant="h6" color="text.secondary" sx={{ ml: 2 }}>Loading Course Details...</Typography>
            </Box>
        );
    }

    if (error) {
        return <Container sx={{ py: 8 }}><Alert severity="error" sx={{ boxShadow: 2 }}>{error}</Alert></Container>;
    }

    if (!course) {
        return <Container sx={{ py: 8 }}><Alert severity="warning" sx={{ boxShadow: 2 }}>Course not found.</Alert></Container>;
    }

    const isPaidCourse = course.type === 'Paid';
    const canEnroll = !!currentUser && userRole !== 'instructor' && !isEnrolled;
    const showLoginPrompt = !currentUser && !userLoading;


    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* Top Banner */}
            <Box sx={{ bgcolor: '#0d47a1', color: 'white', py: 6, px: 2, boxShadow: 3 }}>
                <Container maxWidth="lg">
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {course.title}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.9, maxWidth: '70ch' }}>
                        {course.shortDescription}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
                        <Chip
                            icon={<SchoolIcon />}
                            label={`By ${course.authorName || 'Edusource'}`}
                            variant="filled"
                            sx={{ bgcolor: 'info.main', color: 'white', fontWeight: 'bold' }}
                        />
                        <Chip
                            icon={<AccessTimeIcon />}
                            label={course.duration || 'Self-paced'}
                            variant="filled"
                            sx={{ bgcolor: 'info.main', color: 'white', fontWeight: 'bold' }}
                        />
                        <Chip
                            icon={<CurrencyRupeeIcon />}
                            label={isPaidCourse ? `₹${course.price}` : 'Free'}
                            variant="filled"
                            sx={{ bgcolor: isPaidCourse ? 'success.main' : 'warning.main', color: 'white', fontWeight: 'bold' }}
                        />
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Grid container spacing={4}>
                    {/* Left Column - Course Details */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 4, borderRadius: '16px', boxShadow: 3 }}>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark', display: 'flex', alignItems: 'center' }}>
                                <AssignmentIcon sx={{ mr: 1 }} /> About this Course
                            </Typography>
                            <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.primary', mb: 3 }}>
                                {course.description}
                            </Typography>

                            <Divider sx={{ my: 4 }} />

                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark', display: 'flex', alignItems: 'center' }}>
                                <PlayCircleOutlineIcon sx={{ mr: 1 }} /> Course Content
                            </Typography>

                            <Grid container spacing={2}>
                                {course.lectures && course.lectures.length > 0 ? (
                                    course.lectures.map((lecture, index) => (
                                        <Grid item xs={12} key={index}>
                                            <Accordion sx={{
                                                border: '1px solid #e0e0e0',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                borderRadius: 2,
                                                '&:before': { display: 'none' },
                                                my: 1
                                            }}>
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    aria-controls={`panel-${index}-content`}
                                                    sx={{
                                                        bgcolor: isEnrolled || course.type === 'Free' ? 'primary.light' : 'grey.200',
                                                        color: isEnrolled || course.type === 'Free' ? 'primary.contrastText' : 'text.primary',
                                                        fontWeight: 'medium',
                                                        borderRadius: '8px 8px 0 0',
                                                        '& .MuiAccordionSummary-content': { alignItems: 'center' }
                                                    }}
                                                >
                                                    {isEnrolled || course.type === 'Free' ? (
                                                        <PlayCircleOutlineIcon sx={{ mr: 1 }} />
                                                    ) : (
                                                        <LockIcon sx={{ mr: 1 }} />
                                                    )}
                                                    <Typography sx={{ fontWeight: 'medium', color: isEnrolled || course.type === 'Free' ? 'white' : 'text.primary' }}>
                                                        {index + 1}. {lecture.title}
                                                    </Typography>
                                                </AccordionSummary>
                                                <AccordionDetails sx={{ bgcolor: 'grey.50', py: 3, px: 2 }}>
                                                    {isEnrolled || course.type === 'Free' ? (
                                                        <Box
                                                            component="iframe"
                                                            width="100%"
                                                            height="315"
                                                            src={lecture.videoUrl}
                                                            title={lecture.title}
                                                            frameBorder="0"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                            sx={{ borderRadius: 1, boxShadow: 1 }}
                                                        />
                                                    ) : (
                                                        <Alert severity="info" icon={<LockIcon fontSize="inherit" />}>
                                                            Enroll in the course to unlock this lecture.
                                                        </Alert>
                                                    )}
                                                </AccordionDetails>
                                            </Accordion>
                                        </Grid>
                                    ))
                                ) : (
                                    <Grid item xs={12}>
                                        <Typography color="text.secondary">No lectures available yet for this course.</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Right Column - Enrollment/Payment */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: 3, position: 'sticky', top: '20px' }}>
                            <Box
                                sx={{
                                    height: 200,
                                    backgroundImage: `url(${course.bannerImage || 'https://via.placeholder.com/400x200?text=Course+Banner'})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                }}
                            >
                                {!course.bannerImage && 'Course Banner'}
                            </Box>
                            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center', color: 'primary.main' }}>
                                    {isPaidCourse ? `₹${(course.price || 0).toFixed(2)}` : 'Free'}
                                </Typography>

                                {isEnrolled ? (
                                    <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="inherit" />} sx={{ width: '100%', mb: 2, boxShadow: 1 }}>
                                        You are already enrolled!
                                    </Alert>
                                ) : (
                                    <>
                                        {isPaidCourse && canEnroll && (
                                            <RazorpayCheckoutButton
                                                course={course}
                                                onPaymentSuccess={handleEnrollmentSuccess}
                                            />
                                        )}
                                        {!isPaidCourse && canEnroll && (
                                            <Button
                                                variant="contained"
                                                size="large"
                                                fullWidth
                                                onClick={handleFreeEnroll}
                                                disabled={enrollmentProcessing}
                                                startIcon={enrollmentProcessing ? <CircularProgress size={20} color="inherit" /> : <PlayCircleOutlineIcon />}
                                                color="success"
                                                sx={{ mt: 2 }}
                                            >
                                                {enrollmentProcessing ? 'Enrolling...' : 'Enroll for Free'}
                                            </Button>
                                        )}
                                        {showLoginPrompt && (
                                            <Button
                                                variant="contained"
                                                size="large"
                                                fullWidth
                                                onClick={() => navigate('/login')}
                                                startIcon={<LoginIcon />}
                                                color="secondary"
                                                sx={{ mt: 2 }}
                                            >
                                                Login to Enroll
                                            </Button>
                                        )}
                                        {userRole === 'instructor' && currentUser && (
                                            <Alert severity="info" sx={{ mt: 2, width: '100%', boxShadow: 1 }}>
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <LockIcon sx={{ mr: 1 }} /> Instructors cannot enroll in courses.
                                                </Typography>
                                            </Alert>
                                        )}
                                        {error && !isEnrolled && (
                                            <Alert severity="error" sx={{ mt: 2, width: '100%', boxShadow: 1 }}>
                                                {error}
                                            </Alert>
                                        )}
                                    </>
                                )}

                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                                    Lifetime access to all materials.
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default CourseDetailPage;