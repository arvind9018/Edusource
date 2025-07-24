// src/pages/Specializations/index.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Container, Typography, Grid, CircularProgress, Box, Alert } from '@mui/material';
import SpecializationCard from '../../components/SpecializationCard';

const SpecializationsPage = () => {
    const [specializations, setSpecializations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSpecializations = async () => {
            try {
                const q = query(collection(db, 'specializations'), orderBy('name'));
                const querySnapshot = await getDocs(q);
                const fetchedSpecializations = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setSpecializations(fetchedSpecializations);
            } catch (err) {
                console.error("Error fetching specializations:", err);
                setError("Failed to load specializations. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchSpecializations();
    }, []);

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh',
                    background: 'linear-gradient(to bottom right, #e3f2fd, #e0f7fa)',
                }}
            >
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
                        Our Specializations
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Expand your skills with our complete catalog of expert-designed specializations.
                    </Typography>
                </Box>
                {specializations.length === 0 ? (
                    <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 8 }}>
                        No specializations available at the moment.
                    </Typography>
                ) : (
                    <Grid container spacing={4} justifyContent="center">
                        {specializations.map((spec) => (
                            <Grid item key={spec.id} xs={12} sm={6} md={4}>
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
                                    <SpecializationCard specialization={spec} />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default SpecializationsPage;