// src/components/TutorialsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import {
    Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, CardMedia, CardActions, Button, Container, Pagination
} from '@mui/material';
import { Code as TutorialsIcon } from '@mui/icons-material';

const TutorialsPage = () => {
    const [tutorials, setTutorials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const tutorialsPerPage = 12;

    const fetchTutorials = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const tutorialsCollectionRef = collection(db, 'tutorials');
            const q = query(tutorialsCollectionRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const fetchedTutorials = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title || 'Untitled Tutorial',
                    imageUrl: data.imageUrl || 'https://via.placeholder.com/400x300.png?text=Tutorial+Image',
                    description: data.description?.substring(0, 100) + '...' || 'No description available.',
                    category: data.category || 'General'
                };
            });
            setTutorials(fetchedTutorials);
        } catch (err) {
            console.error("Error fetching tutorials:", err);
            setError("Failed to load tutorials. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTutorials();
    }, [fetchTutorials]);

    // Pagination logic
    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const indexOfLastTutorial = currentPage * tutorialsPerPage;
    const indexOfFirstTutorial = indexOfLastTutorial - tutorialsPerPage;
    const currentTutorials = tutorials.slice(indexOfFirstTutorial, indexOfLastTutorial);
    const totalPages = Math.ceil(tutorials.length / tutorialsPerPage);

    const pageStyles = {
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #e3f2fd, #e0f7fa)',
        py: { xs: 4, sm: 6, md: 8 },
        px: 3
    };

    const cardStyles = {
        height: 450, // Fixed height for a consistent card size
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        background: 'linear-gradient(to bottom right, #f0f4ff, #e8f0fe)',
        borderRadius: '16px',
        boxShadow: 4,
        transition: 'all 0.4s ease',
        '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            background: 'linear-gradient(to bottom right, #e0ecff, #d2e3fc)',
        },
    };

    const cardMediaStyles = {
        height: 200,
        objectFit: 'cover', // Ensures images are consistently sized without stretching
    };

    const cardContentStyles = {
        flexGrow: 1,
        p: 3,
        textAlign: 'center',
    };

    const cardActionsStyles = {
        p: 2,
        justifyContent: 'center',
    };

    if (loading) {
        return (
            <Box sx={{ ...pageStyles, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress size={60} color="primary" />
                <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>Loading Tutorials...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ ...pageStyles, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Alert severity="error" sx={{ boxShadow: 3 }}>{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={pageStyles}>
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
                        Tutorials
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Expand your skills with our comprehensive catalog of tutorials.
                    </Typography>
                </Box>
                {tutorials.length === 0 ? (
                    <Grid item xs={12}>
                        <Alert severity="info" sx={{ mx: 'auto', mt: 4 }}>
                            No tutorials are available at the moment. Please check back later!
                        </Alert>
                    </Grid>
                ) : (
                    <>
                        <Grid
                            container
                            spacing={4}
                            sx={{
                                maxWidth: 1200,
                                mx: 'auto',
                                justifyContent: currentTutorials.length > 0 && currentTutorials.length < 4 ? 'center' : 'flex-start',
                            }}
                        >
                            {currentTutorials.map((tutorial) => (
                                <Grid item key={tutorial.id} xs={12} sm={6} md={3}>
                                    <Card
                                        component={Link}
                                        to={`/tutorial/${tutorial.id}`}
                                        sx={cardStyles}
                                    >
                                        <CardMedia
                                            component="img"
                                            sx={cardMediaStyles}
                                            image={tutorial.imageUrl}
                                            alt={tutorial.title}
                                        />
                                        <CardContent sx={cardContentStyles}>
                                            <Typography 
                                                gutterBottom 
                                                variant="h5" 
                                                component="div" 
                                                sx={{ 
                                                    fontWeight: 'bold', 
                                                    mb: 1, 
                                                    color: '#1a237e' // Changed title text color to blue
                                                }}
                                            >
                                                {tutorial.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.Primary">
                                                {tutorial.description}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={cardActionsStyles}>
                                            <Button
                                                size="large"
                                                variant="contained"
                                                color="primary"
                                                sx={{
                                                    mt: 'auto',
                                                    fontWeight: 'bold',
                                                    borderRadius: '20px',
                                                    px: 4,
                                                    py: 1,
                                                    transition: '0.2s',
                                                    '&:hover': {
                                                        backgroundColor: 'primary.dark',
                                                        transform: 'scale(1.05)'
                                                    }
                                                }}
                                            >
                                                Start Learning!
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        
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

export default TutorialsPage;