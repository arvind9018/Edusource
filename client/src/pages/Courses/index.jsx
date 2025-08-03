import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import {
    Container,
    Typography,
    Grid,
    CircularProgress,
    Box,
    Alert,
    Pagination // Added Pagination import
} from '@mui/material';
import CourseCard from '../../components/CourseCard';

const AllCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 12; // Set the number of courses per page

    useEffect(() => {
        const fetchAllCourses = async () => {
            setLoading(true);
            try {
                const coursesQuery = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(coursesQuery);
                const fetchedCourses = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCourses(fetchedCourses);
            } catch (err) {
                console.error("Error fetching courses:", err);
                setError("Failed to load courses. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllCourses();
    }, []);

    // Pagination logic
    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
    };

    // Calculate courses to display on the current page
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);
    const totalPages = Math.ceil(courses.length / coursesPerPage);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(to bottom right, #e3f2fd, #e0f7fa)',
                py: { xs: 4, sm: 6, md: 8 },
            }}
        >
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography
                        variant="h3"
                        component="h1"
                        sx={{
                            fontWeight: 'bold',
                            mb: 1,
                            background: 'linear-gradient(90deg, #0288d1, #26c6da)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                        }}
                    >
                        All Courses
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Expand your skills with our complete catalog of expert-led courses.
                    </Typography>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
                        <CircularProgress size={60} />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
                ) : courses.length === 0 ? (
                    <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 8 }}>
                        No courses are available at the moment. Please check back soon!
                    </Typography>
                ) : (
                    <>
                        <Grid
                            container
                            spacing={4}
                            // This centers the grid items if the count is less than a full row
                            justifyContent={currentCourses.length > 0 && currentCourses.length < 4 ? 'center' : 'flex-start'}
                        >
                            {currentCourses.map((course) => (
                                <Grid item key={course.id} xs={12} sm={6} md={4} lg={3}>
                                    <Box
                                        sx={{
                                            height: '100%',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                            borderRadius: 3,
                                            boxShadow: 4,
                                            overflow: 'hidden',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: 8,
                                            },
                                            bgcolor: '#ffffff',
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <CourseCard course={course} />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Pagination component */}
                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={handleChangePage}
                                    color="primary"
                                    size="large"
                                    showFirstButton
                                    showLastButton
                                />
                            </Box>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
};

export default AllCoursesPage;