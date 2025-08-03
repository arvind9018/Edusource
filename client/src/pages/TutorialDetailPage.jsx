import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
    Box, Typography, CircularProgress, Alert, Paper, Link as MuiLink, Breadcrumbs,
    List, ListItem, ListItemText, useMediaQuery, useTheme, Grid
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CodeIcon from '@mui/icons-material/Code';

// A helper component for the "Get Started" section with a dynamic title
const GetStartedContent = ({ tutorialTitle }) => (
    <Box mt={4}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Get Started
        </Typography>
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
            Welcome to the {tutorialTitle} series! To begin learning:
        </Typography>
        <List sx={{ listStyleType: 'decimal', pl: 4 }}>
            <ListItem sx={{ display: 'list-item' }}>
                <ListItemText primary="Select a lesson from the sidebar on the left" sx={{ color: 'text.secondary' }} />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
                <ListItemText primary="Work through the lessons in order for the best learning experience" sx={{ color: 'text.secondary' }} />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
                <ListItemText primary="Each lesson contains detailed explanations and examples" sx={{ color: 'text.secondary' }} />
            </ListItem>
        </List>
    </Box>
);

const TutorialDetailPage = () => {
    const { tutorialId } = useParams();
    const [tutorial, setTutorial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSubcategory, setActiveSubcategory] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const fetchTutorial = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const tutorialDocRef = doc(db, 'tutorials', tutorialId);
            const docSnap = await getDoc(tutorialDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const normalizedTutorial = {
                    id: docSnap.id,
                    title: data.title || 'Untitled Tutorial',
                    authorName: data.authorName || 'Unknown Author',
                    imageUrl: data.imageUrl || '',
                    description: data.description || '',
                    categories: Array.isArray(data.categories) ? data.categories.map(cat => ({
                        name: cat.name || 'Unnamed Category',
                        subcategories: Array.isArray(cat.subcategories) ? cat.subcategories.map(sub => ({
                            name: sub.name || 'Unnamed Subcategory',
                            content: sub.content || ''
                        })) : [{ name: 'Unnamed Subcategory', content: '' }]
                    })) : [{ name: 'Unnamed Category', subcategories: [{ name: 'Unnamed Subcategory', content: '' }] }]
                };
                setTutorial(normalizedTutorial);
                setActiveSubcategory(null);
            } else {
                setError("Tutorial not found. It might have been deleted or the link is incorrect.");
            }
        } catch (err) {
            console.error("Error fetching tutorial:", err);
            setError("Failed to load tutorial. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [tutorialId]);

    useEffect(() => {
        fetchTutorial();
    }, [fetchTutorial]);

    // Handle a click on a subcategory in the sidebar
    const handleSubcategoryClick = (subcategory) => {
        setActiveSubcategory(subcategory);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: 'linear-gradient(to bottom right, #e3f2fd, #e0f7fa)' }}>
                <CircularProgress color="primary" />
                <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>Loading Tutorial...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, mt: 4, background: 'linear-gradient(to bottom right, #e3f2fd, #e0f7fa)', color: 'text.primary' }}>
                <Alert severity="error" sx={{ backgroundColor: 'error.main', color: 'white' }}>{error}</Alert>
                <MuiLink component={Link} to="/tutorials" sx={{ mt: 2, display: 'block', color: 'primary.main' }}>
                    Go back to Tutorials List
                </MuiLink>
            </Box>
        );
    }

    if (!tutorial) {
        return null;
    }

    const sidebarWidth = 250;

    return (
        <Box sx={{
            display: 'flex',
            minHeight: '100vh',
            background: 'linear-gradient(to bottom right, #e3f2fd, #e0f7fa)',
            color: 'text.primary',
            p: 0,
        }}>
            {/* Left Navigation Sidebar */}
            <Box
                component="aside"
                sx={{
                    width: sidebarWidth,
                    flexShrink: 0,
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    overflowY: 'auto',
                    backgroundColor: '#ffffff',
                    boxShadow: '4px 0px 10px rgba(0,0,0,0.1)',
                    borderRight: '1px solid #e0e0e0',
                    p: 2,
                    zIndex: 10,
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, pt: 1, px: 1, color: 'primary.main' }}>
                    {tutorial.title}
                </Typography>
                <List component="nav">
                    {tutorial.categories.map((category, catIndex) => (
                        <Box key={catIndex}>
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 'bold',
                                    color: 'text.secondary',
                                    textTransform: 'uppercase',
                                    my: 2,
                                    pl: 1
                                }}
                            >
                                {category.name}
                            </Typography>
                            <List component="div" disablePadding>
                                {category.subcategories.map((subcategory, subIndex) => (
                                    <ListItem
                                        key={subIndex}
                                        button
                                        onClick={() => handleSubcategoryClick(subcategory)}
                                        sx={{
                                            mb: 0.5,
                                            borderRadius: 1,
                                            backgroundColor: activeSubcategory?.name === subcategory.name ? 'rgba(2, 136, 209, 0.05)' : 'transparent',
                                            borderLeft: activeSubcategory?.name === subcategory.name ? '3px solid #0288d1' : 'none',
                                            color: activeSubcategory?.name === subcategory.name ? 'primary.main' : 'text.primary',
                                            '&:hover': {
                                                backgroundColor: 'rgba(2, 136, 209, 0.03)',
                                                color: 'primary.dark'
                                            }
                                        }}
                                    >
                                        <ListItemText primary={subcategory.name} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    ))}
                </List>
            </Box>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, md: 4 },
                    width: `calc(100% - ${sidebarWidth}px)`,
                    ml: { md: 0 },
                    backgroundColor: 'transparent',
                }}
            >
                <Box>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                        <MuiLink component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                            Home
                        </MuiLink>
                        <MuiLink component={Link} to="/tutorials" sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                            <CodeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                            Tutorials
                        </MuiLink>
                        <Typography sx={{ color: 'text.primary' }}>{tutorial.title}</Typography>
                    </Breadcrumbs>
                </Box>
                
                {/* Conditional rendering for hero section and content */}
                {activeSubcategory ? (
                    <Box>
                        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
                            {activeSubcategory.name}
                        </Typography>
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, backgroundColor: '#f5f5f5', color: 'text.primary', border: '1px solid #e0e0e0' }}>
                            <Typography
                                variant="body1"
                                component="div"
                                sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
                            >
                                {activeSubcategory.content || <span style={{ color: '#999', fontStyle: 'italic' }}>No content provided for this section.</span>}
                            </Typography>
                        </Paper>
                    </Box>
                ) : (
                    <>
                        <Box
                            sx={{
                                position: 'relative',
                                height: 300,
                                backgroundImage: `url(${tutorial.imageUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: 2,
                                mb: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                color: 'black',
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                                backdropFilter: 'blur(0.5px)',
                                borderRadius: 2,
                                zIndex: 0
                            }} />
                            <Box sx={{ zIndex: 1 }}>
                                <Typography
                                    variant="h3"
                                    component="h1"
                                    gutterBottom
                                    sx={{
                                        fontWeight: 'bold',
                                        background: 'linear-gradient(90deg, #0288d1, #26c6da)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        textShadow: '0 0 5px rgba(0, 0, 0, 0.7)' // Added text shadow for readability
                                    }}
                                >
                                    {tutorial.title}
                                </Typography>
                                {tutorial.description && (
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            maxWidth: 600,
                                            mx: 'auto',
                                            color: 'text.secondary',
                                            textShadow: '0 0 5px rgba(0, 0, 0, 0.7)' // Added text shadow for readability
                                        }}
                                    >
                                        {tutorial.description}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        <GetStartedContent tutorialTitle={tutorial.title} />
                    </>
                )}
            </Box>
        </Box>
    );
};

export default TutorialDetailPage;