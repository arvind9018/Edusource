// src/pages/Specializations/SpecializationDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore'; // Removed unnecessary imports
import { db } from '../../firebase';
import { Container, Typography, Box, Grid, CircularProgress, Alert } from '@mui/material';
import CourseCard from '../../components/CourseCard';
import FilterBar from '../../components/FilterBar';

const SpecializationDetail = () => {
    const { id } = useParams();
    const [specialization, setSpecialization] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchKeyword, setSearchKeyword] = useState('');

    useEffect(() => {
        const fetchSpecializationAndCourses = async () => {
            setLoading(true);
            setError('');

            try {
                const specDocRef = doc(db, 'specializations', id);
                const specDocSnap = await getDoc(specDocRef);

                if (!specDocSnap.exists()) {
                    setError('Specialization not found.');
                    setLoading(false);
                    return;
                }
                
                const specializationData = { id: specDocSnap.id, ...specDocSnap.data() };
                setSpecialization(specializationData);
                
                // FIX: Get courses directly from the 'courses' array in the specialization document
                let fetchedCourses = specializationData.courses || [];

                // --- Client-side Filtering ---
                let filteredAndSearchedCourses = fetchedCourses;

                // Apply category filter (assuming courses have a 'category' field)
                if (filterCategory !== 'All') {
                    filteredAndSearchedCourses = filteredAndSearchedCourses.filter(course =>
                        course.category === filterCategory
                    );
                }

                // Apply client-side search for keyword
                if (searchKeyword) {
                    const lowerCaseKeyword = searchKeyword.toLowerCase();
                    filteredAndSearchedCourses = filteredAndSearchedCourses.filter(course =>
                        (course.title && course.title.toLowerCase().includes(lowerCaseKeyword)) ||
                        (course.shortDescription && course.shortDescription.toLowerCase().includes(lowerCaseKeyword)) ||
                        (course.tags && course.tags.some(tag => tag.toLowerCase().includes(lowerCaseKeyword)))
                    );
                }

                // Sort courses alphabetically by title
                filteredAndSearchedCourses.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

                setCourses(filteredAndSearchedCourses);
            } catch (err) {
                console.error("SpecializationDetail: Error fetching specialization or courses:", err);
                setError("Failed to load specialization details or courses. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchSpecializationAndCourses();
    }, [id, filterCategory, searchKeyword]); // Re-run effect when ID or filters change

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 8 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!specialization) {
        return (
            <Container sx={{ mt: 8 }}>
                <Typography variant="h5" color="text.secondary" align="center">
                    Specialization not found.
                </Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 8, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        height: 250,
                        backgroundImage: `url(${specialization.image || 'https://via.placeholder.com/800x250/34495e/ffffff?text=Specialization+Banner'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: 2,
                        mb: 3
                    }}
                />
                <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
                    {specialization.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph align="center">
                    {specialization.description}
                </Typography>
            </Box>

            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 6, mb: 3 }}>
                Courses in this Specialization
            </Typography>

            <FilterBar
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                searchKeyword={searchKeyword}
                setSearchKeyword={setSearchKeyword}
                categories={['All', 'AI & ML', 'Data Science', 'Web Development', 'Data Structures']} // Example categories
            />

            {courses.length === 0 ? (
                <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
                    No courses found for this specialization with the current filters.
                </Typography>
            ) : (
                <Grid container spacing={4} sx={{ mt: 3 }}>
                    {courses.map((course) => (
                        <Grid item key={course.id} xs={12} sm={6} md={4}>
                            <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
                                <CourseCard course={course} />
                            </Link>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default SpecializationDetail;