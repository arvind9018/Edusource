// src/pages/Specializations/SpecializationDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  Container, Typography, Box, Grid, CircularProgress, Alert,
  Breadcrumbs, Link as MuiLink, Paper
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
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
    window.scrollTo(0, 0);
  }, []);

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

        const courseIds = specializationData.courses || [];

        const fullCourseData = await Promise.all(
          courseIds.map(async (c) => {
            const courseSnap = await getDoc(doc(db, 'courses', c.id));
            return { id: courseSnap.id, ...courseSnap.data() };
          })
        );

        // Apply filtering
        let filteredCourses = fullCourseData;

        if (filterCategory !== 'All') {
          filteredCourses = filteredCourses.filter(
            (course) => course.category === filterCategory
          );
        }

        if (searchKeyword) {
          const lowerKeyword = searchKeyword.toLowerCase();
          filteredCourses = filteredCourses.filter(
            (course) =>
              (course.title && course.title.toLowerCase().includes(lowerKeyword)) ||
              (course.shortDescription && course.shortDescription.toLowerCase().includes(lowerKeyword)) ||
              (course.tags && course.tags.some(tag => tag.toLowerCase().includes(lowerKeyword)))
          );
        }

        filteredCourses.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        setCourses(filteredCourses);
      } catch (err) {
        console.error("Error fetching specialization or courses:", err);
        setError("Failed to load specialization details or courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecializationAndCourses();
  }, [id, filterCategory, searchKeyword]);

  if (loading) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        minHeight: '80vh',
        background: 'linear-gradient(to bottom right, #e0e7ff, #bfdbfe)',
        py: 4
      }}>
        <CircularProgress color="primary" sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">Loading Specialization...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 8, py: 4, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Typography variant="body1" align="center" sx={{ mt: 2 }}>
          Please check the URL or go back to <MuiLink component={RouterLink} to="/specializations">Specializations</MuiLink>.
        </Typography>
      </Container>
    );
  }

  const availableCategories = ['All', 'Data Science', 'Machine Learning', 'Web Development', 'Mobile Development',
    'Cloud Computing', 'Cybersecurity', 'Game Development', 'Digital Marketing',
    'UI/UX Design', 'Artificial Intelligence', 'Networking', 'Database Management'];

  return (
    <Box sx={{
      minHeight: '100vh',
      pt: 4,
      pb: 6,
      background: 'linear-gradient(to bottom right, #e0e7ff, #bfdbfe)',
      px: { xs: 2, sm: 4, md: 6 },
    }}>
      <Container maxWidth="lg" sx={{ backgroundColor: 'transparent', boxShadow: 'none', borderRadius: 2 }}>
        {/* Breadcrumbs could be added here if needed */}

        <Paper class = "bg-blue-100 p-8 rounded-xl shadow-lg border border-blue-500">
          <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.dark' }}>
            Courses in this Specialization
          </Typography>

          <FilterBar
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
            categories={availableCategories}
          />

          {courses.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 2 }}>
                No courses found for this specialization with the current filters.
              </Typography>
              {(filterCategory !== 'All' || searchKeyword) && (
                <MuiLink component="button" onClick={() => { setFilterCategory('All'); setSearchKeyword(''); }} sx={{ mt: 1 }}>
                  Clear all filters
                </MuiLink>
              )}
            </Box>
          ) : (
            <Grid container spacing={4} sx={{ mt: 2 }}>
              {courses.map((course) => (
                <Grid item key={course.id} xs={12} sm={6} md={4}>
                  <CourseCard course={course} />
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default SpecializationDetail;
