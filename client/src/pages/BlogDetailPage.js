// src/pages/AllBlogsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import {
    Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, CardMedia, Button
} from '@mui/material';
import { Article as BlogsIcon, CalendarToday as DateIcon, Person as AuthorIcon } from '@mui/icons-material';

const BLOGS_PER_PAGE = 8; // Define how many blogs to load per "page"

const AllBlogsPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastDoc, setLastDoc] = useState(null); // State to store the last document for pagination
    const [hasMore, setHasMore] = useState(true); // State to check if there are more blogs to load

    const fetchBlogs = useCallback(async (isInitialFetch = true) => {
        setLoading(true);
        setError(null);

        try {
            let blogsQuery;
            if (isInitialFetch) {
                // Initial query: order by creation date, limit to first page
                blogsQuery = query(
                    collection(db, 'blogs'),
                    orderBy('createdAt', 'desc'),
                    limit(BLOGS_PER_PAGE)
                );
                console.log("Fetching initial blogs...");
            } else {
                // Subsequent queries: start after the last document fetched, limit
                if (!lastDoc) { // Should not happen if hasMore is true
                    setLoading(false);
                    setHasMore(false);
                    console.warn("Attempted to load more blogs but lastDoc is null.");
                    return;
                }
                blogsQuery = query(
                    collection(db, 'blogs'),
                    orderBy('createdAt', 'desc'),
                    startAfter(lastDoc), // Start after the last document from previous fetch
                    limit(BLOGS_PER_PAGE)
                );
                console("Loading more blogs...");
            }

            const querySnapshot = await getDocs(blogsQuery);
            const fetchedBlogs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (isInitialFetch) {
                setBlogs(fetchedBlogs);
            } else {
                setBlogs(prevBlogs => [...prevBlogs, ...fetchedBlogs]); // Append new blogs
            }

            // Check if there are more documents than the limit, to determine `hasMore`
            if (fetchedBlogs.length < BLOGS_PER_PAGE) {
                setHasMore(false); // No more blogs to load
                console.log("No more blogs to load.");
            } else {
                setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]); // Set the last document
                setHasMore(true);
                console.log("More blogs available. Last document set.");
            }

        } catch (err) {
            console.error("Error fetching blogs:", err);
            setError("Failed to load blog posts. Please try again later.");
            setHasMore(false); // Stop trying to load more on error
        } finally {
            setLoading(false);
        }
    }, [lastDoc]); // lastDoc is a dependency for subsequent fetches

    useEffect(() => {
        // Initial fetch when component mounts
        fetchBlogs(true);
    }, [fetchBlogs]); // fetchBlogs is a dependency

    // Helper function to format the date (copied from BlogDetailPage)
    const formatDate = (isoString) => {
        if (!isoString) return 'Date not available';
        return new Date(isoString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, mt: 4, mb: 4 }}>
            <Typography variant="h3" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 4, color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BlogsIcon sx={{ fontSize: '3rem', mr: 1 }} /> All Blog Posts
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            )}

            <Grid container spacing={4}>
                {blogs.length === 0 && !loading ? (
                    <Grid item xs={12}>
                        <Alert severity="info" sx={{ textAlign: 'center' }}>No blog posts available at the moment.</Alert>
                    </Grid>
                ) : (
                    blogs.map((blog) => (
                        <Grid item key={blog.id} xs={12} sm={6} md={4} lg={3}> {/* Responsive grid for cards */}
                            <Card
                                component={Link}
                                to={`/blogs/${blog.id}`}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    textDecoration: 'none',
                                    '&:hover': {
                                        boxShadow: 6,
                                        transform: 'translateY(-5px)',
                                    },
                                    transition: '0.3s',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    boxShadow: 3
                                }}
                            >
                                {blog.imageUrl && (
                                    <CardMedia
                                        component="img"
                                        height="180"
                                        image={blog.imageUrl}
                                        alt={blog.title}
                                        sx={{ objectFit: 'cover' }}
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x180/e2e8f0/475569?text=Blog+Image'; }}
                                    />
                                )}
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.3 }}>
                                        {blog.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, maxHeight: 60, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                        {blog.content}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 1, borderTop: '1px solid #eee' }}>
                                        <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center' }}>
                                            <AuthorIcon sx={{ fontSize: 'small', mr: 0.5 }} /> {blog.authorName || 'Unknown Author'}
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center' }}>
                                            <DateIcon sx={{ fontSize: 'small', mr: 0.5 }} /> {formatDate(blog.createdAt)}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* Load More Button & Loading Indicator for Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                {loading ? (
                    <CircularProgress />
                ) : hasMore ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => fetchBlogs(false)} // Call fetchBlogs for next page
                        disabled={loading}
                    >
                        Load More Blogs
                    </Button>
                ) : (
                    blogs.length > 0 && ( // Only show this message if there are blogs already displayed
                        <Typography variant="body1" color="text.secondary">You've reached the end of the blog posts!</Typography>
                    )
                )}
            </Box>
        </Box>
    );
};

export default AllBlogsPage;