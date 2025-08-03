// src/components/InstructorDashboard/InstructorBlogs.jsx
import React, { useState, useEffect } from 'react';
import {
    collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { uploadImageToCloudinary } from '../../utils/cloudinary';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    CircularProgress,
    Paper,
    Grid
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Description as BlogIcon,
    Article as ContentIcon,
    Image as ImageIcon,
    CalendarToday as DateIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const InstructorBlogs = ({ user, instructorData, onError, onSuccess }) => {
    const [isAddingBlog, setIsAddingBlog] = useState(false);
    const [newBlog, setNewBlog] = useState({ title: '', content: '', imageUrl: '' });
    const [blogImageFile, setBlogImageFile] = useState(null);
    const [uploadingBlogImage, setUploadingBlogImage] = useState(false);
    const [selectedBlogForEdit, setSelectedBlogForEdit] = useState(null);
    const [previewImageUrl, setPreviewImageUrl] = useState(null);
    const [myBlogs, setMyBlogs] = useState([]);
    const [loadingBlogs, setLoadingBlogs] = useState(true);
    const [authUser] = useAuthState(auth);

    // Fetch blogs created by current user
    const fetchMyBlogs = async () => {
        if (!authUser) return;

        try {
            setLoadingBlogs(true);
            const blogsRef = collection(db, 'blogs');
            const q = query(blogsRef, where('authorId', '==', authUser.uid));
            const querySnapshot = await getDocs(q);

            const blogsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMyBlogs(blogsData);
            setLoadingBlogs(false);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setLoadingBlogs(false);
            onError('Failed to fetch your blogs.');
            toast.error('Failed to fetch your blogs.');
        }
    };

    useEffect(() => {
        fetchMyBlogs();
    }, [authUser]);

    // Effect to manage image preview URL
    useEffect(() => {
        if (blogImageFile) {
            const objectUrl = URL.createObjectURL(blogImageFile);
            setPreviewImageUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (selectedBlogForEdit?.imageUrl) {
            setPreviewImageUrl(selectedBlogForEdit.imageUrl);
        } else {
            setPreviewImageUrl(null);
        }
    }, [blogImageFile, selectedBlogForEdit]);

    // Effect to reset/set form data when selectedBlogForEdit changes
    useEffect(() => {
        if (selectedBlogForEdit) {
            setNewBlog({ ...selectedBlogForEdit });
            setBlogImageFile(null);
        } else {
            setNewBlog({ title: '', content: '', imageUrl: '' });
            setBlogImageFile(null);
        }
    }, [selectedBlogForEdit]);

    const handleBlogImageChange = (e) => {
        const file = e.target.files[0];
        setBlogImageFile(file);

        if (!file) {
            setNewBlog(prev => ({ ...prev, imageUrl: '' }));
            return;
        }

        if (!file.type.match('image.*')) {
            onError('Please select an image file (JPEG, PNG) for the blog.');
            toast.error('Please select an image file (JPEG, PNG) for the blog.');
            setBlogImageFile(null);
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            onError('Blog image must be less than 5MB.');
            toast.error('Blog image must be less than 5MB.');
            setBlogImageFile(null);
            return;
        }

        uploadBlogImage(file);
    };

    const uploadBlogImage = async (file) => {
        setUploadingBlogImage(true);
        onError(null);
        onSuccess(null);
        try {
            const imageUrl = await uploadImageToCloudinary(file);
            if (imageUrl) {
                setNewBlog(prev => ({ ...prev, imageUrl: imageUrl }));
                onSuccess('Blog image uploaded successfully!');
                toast.success('Blog image uploaded successfully!');
            } else {
                onError("Blog image upload failed: No URL returned.");
                toast.error("Blog image upload failed: No URL returned.");
                setNewBlog(prev => ({ ...prev, imageUrl: selectedBlogForEdit?.imageUrl || '' }));
            }
        } catch (error) {
            console.error('Blog image upload failed:', error);
            onError('Failed to upload blog image. Please try again.');
            toast.error('Failed to upload blog image. Please try again.');
            setNewBlog(prev => ({ ...prev, imageUrl: selectedBlogForEdit?.imageUrl || '' }));
        } finally {
            setUploadingBlogImage(false);
        }
    };

    const handleAddOrUpdateBlog = async (e) => {
        e.preventDefault();
        onError(null);
        onSuccess(null);

        if (!authUser) {
            onError("User not authenticated.");
            toast.error("User not authenticated.");
            return;
        }
        if (!newBlog.title || !newBlog.content) {
            onError("Blog title and content are required.");
            toast.error("Blog title and content are required.");
            return;
        }
        if (uploadingBlogImage) {
            onError("Please wait for the image upload to complete before saving.");
            toast.error("Please wait for the image upload to complete before saving.");
            return;
        }

        const blogData = {
            ...newBlog,
            authorId: authUser.uid,
            authorName: instructorData?.name || authUser.email,
            createdAt: selectedBlogForEdit?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        try {
            if (selectedBlogForEdit) {
                await updateDoc(doc(db, 'blogs', selectedBlogForEdit.id), blogData);
                onSuccess('Blog updated successfully!');
                toast.success('Blog updated successfully!');
            } else {
                await addDoc(collection(db, 'blogs'), blogData);
                onSuccess('Blog added successfully!');
                toast.success('Blog added successfully!');
            }
            resetBlogForm();
            setIsAddingBlog(false);
            fetchMyBlogs(); // Refresh the blogs list
        } catch (err) {
            console.error("Error saving blog:", err);
            onError(`Failed to save blog: ${err.message || "An unexpected error occurred."}`);
            toast.error(`Failed to save blog: ${err.message || "An unexpected error occurred."}`);
        }
    };

    const handleEditBlog = (blog) => {
        setSelectedBlogForEdit(blog);
        setIsAddingBlog(true);
        onError(null);
        onSuccess(null);
    };

    const handleDeleteBlog = async (blogId) => {
        if (!window.confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) return;
        onError(null);
        onSuccess(null);
        try {
            await deleteDoc(doc(db, 'blogs', blogId));
            onSuccess('Blog post deleted successfully!');
            toast.success('Blog post deleted successfully!');
            fetchMyBlogs(); // Refresh the blogs list
        } catch (err) {
            console.error("Error deleting blog:", err);
            onError("Failed to delete blog post. Please try again.");
            toast.error("Failed to delete blog post. Please try again.");
        }
    };

    const resetBlogForm = () => {
        setNewBlog({ title: '', content: '', imageUrl: '' });
        setBlogImageFile(null);
        setSelectedBlogForEdit(null);
        onError(null);
        onSuccess(null);
    };

    const openAddBlogForm = () => {
        resetBlogForm();
        setIsAddingBlog(true);
    };

    const closeBlogForm = () => {
        resetBlogForm();
        setIsAddingBlog(false);
    };

    return (
        <Card sx={{
            mt: 3, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.01)' },
            backgroundColor: 'background.paper', boxShadow: 3
        }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" color="primary.main">My Blog Posts</Typography>
                    <Button
                        variant="contained"
                        onClick={isAddingBlog ? closeBlogForm : openAddBlogForm}
                        color={isAddingBlog ? "error" : "primary"}
                        startIcon={isAddingBlog ? <CancelIcon /> : <AddIcon />}
                    >
                        {isAddingBlog ? 'Cancel' : 'Add New Blog'}
                    </Button>
                </Box>

                {loadingBlogs ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {isAddingBlog && (
                            <Paper elevation={3} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h6" gutterBottom color="secondary.main">
                                    {selectedBlogForEdit ? 'Edit Blog Post' : 'Create New Blog Post'}
                                </Typography>
                                <form onSubmit={handleAddOrUpdateBlog}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Blog Title"
                                                name="title"
                                                value={newBlog.title}
                                                onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                                                fullWidth
                                                margin="normal"
                                                required
                                                InputProps={{ startAdornment: <BlogIcon sx={{ mr: 1, color: 'action.active' }} /> }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Blog Content"
                                                name="content"
                                                value={newBlog.content}
                                                onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                                                fullWidth
                                                margin="normal"
                                                multiline
                                                rows={6}
                                                required
                                                InputProps={{ startAdornment: <ContentIcon sx={{ mr: 1, color: 'action.active' }} /> }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box mb={2}>
                                                <Typography variant="body2" gutterBottom color="text.primary">
                                                    <ImageIcon sx={{ fontSize: 'small', verticalAlign: 'middle', mr: 0.5 }} />
                                                    Blog Image (Optional)
                                                </Typography>
                                                <input type="file" onChange={handleBlogImageChange} accept="image/*" />
                                                {(previewImageUrl) && (
                                                    <Box mt={1}>
                                                        <Typography variant="caption" color="text.secondary">Image Preview:</Typography>
                                                        <img src={previewImageUrl} alt="Blog preview" style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain', marginTop: 8, border: '1px solid #ccc' }} />
                                                    </Box>
                                                )}
                                                {uploadingBlogImage && <CircularProgress size={20} sx={{ ml: 2 }} />}
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                                <Button
                                                    type="button"
                                                    onClick={closeBlogForm}
                                                    variant="outlined"
                                                    startIcon={<CancelIcon />}
                                                    color="error"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={<SaveIcon />}
                                                    disabled={uploadingBlogImage}
                                                >
                                                    {uploadingBlogImage ? 'Uploading...' : (selectedBlogForEdit ? 'Update Blog' : 'Add Blog')}
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </form>
                            </Paper>
                        )}
                        {!isAddingBlog && (
                            <>
                                {myBlogs.length === 0 ? (
                                    <Typography variant="body1" textAlign="center" py={4} color="text.secondary">You haven't created any blog posts yet. Start by adding a new blog!</Typography>
                                ) : (
                                    <Grid container spacing={2}>
                                        {myBlogs.map(blog => (
                                            <Grid item xs={12} sm={6} lg={3} key={blog.id}>
                                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' }, boxShadow: 2 }}>
                                                    {blog.imageUrl && (<Box sx={{ height: 140, backgroundImage: `url(${blog.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid', borderColor: 'divider' }} />)}
                                                    <CardContent sx={{ flexGrow: 1 }}>
                                                        <Typography variant="h6" gutterBottom color="primary.dark">{blog.title}</Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{blog.content}</Typography>
                                                        <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                                                            <DateIcon sx={{ fontSize: 'small', verticalAlign: 'middle', mr: 0.5 }} />
                                                            Created: {new Date(blog.createdAt).toLocaleDateString()}
                                                        </Typography>
                                                    </CardContent>
                                                    <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Button size="small" onClick={() => handleEditBlog(blog)} startIcon={<EditIcon />} color="secondary">Edit</Button>
                                                        <Button size="small" color="error" onClick={() => handleDeleteBlog(blog.id)} startIcon={<DeleteIcon />}>Delete</Button>
                                                    </Box>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default InstructorBlogs;