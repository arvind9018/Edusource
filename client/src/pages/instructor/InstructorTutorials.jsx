import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    Grid,
    IconButton
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    School as TutorialIcon,
    ContentPaste as ContentIcon,
    Image as ImageIcon,
    CalendarToday as DateIcon,
    RemoveCircle as RemoveIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const InstructorTutorials = ({ user, instructorData, onError, onSuccess }) => {
    const [isAddingTutorial, setIsAddingTutorial] = useState(false);
    const [newTutorial, setNewTutorial] = useState({ title: '', description: '', imageUrl: '', categories: [{ name: '', subcategories: [{ name: '', content: '' }] }] });
    const [tutorialImageFile, setTutorialImageFile] = useState(null);
    const [uploadingTutorialImage, setUploadingTutorialImage] = useState(false);
    const [selectedTutorialForEdit, setSelectedTutorialForEdit] = useState(null);
    const [previewImageUrl, setPreviewImageUrl] = useState(null);
    const [myTutorials, setMyTutorials] = useState([]);
    const [loadingTutorials, setLoadingTutorials] = useState(true);
    const [authUser] = useAuthState(auth);

    // Fetch tutorials created by current user
    const fetchMyTutorials = async () => {
        if (!authUser) return;

        try {
            setLoadingTutorials(true);
            const tutorialsRef = collection(db, 'tutorials');
            const q = query(tutorialsRef, where('authorId', '==', authUser.uid));
            const querySnapshot = await getDocs(q);

            const tutorialsData = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                // Normalize categories and subcategories structure
                const categories = Array.isArray(data.categories) ? data.categories.map(cat => ({
                    name: cat.name || '',
                    subcategories: Array.isArray(cat.subcategories) ? cat.subcategories.map(sub => ({
                        name: sub.name || '',
                        content: sub.content || ''
                    })) : [{ name: '', content: '' }]
                })) : [{ name: '', subcategories: [{ name: '', content: '' }] }];
                return {
                    id: doc.id,
                    ...data,
                    categories
                };
            });
            setMyTutorials(tutorialsData);
            setLoadingTutorials(false);
        } catch (error) {
            console.error('Error fetching tutorials:', error);
            setLoadingTutorials(false);
            onError('Failed to fetch your tutorials.');
            toast.error('Failed to fetch your tutorials.');
        }
    };

    useEffect(() => {
        fetchMyTutorials();
    }, [authUser]);

    // Effect to manage image preview URL
    useEffect(() => {
        if (tutorialImageFile) {
            const objectUrl = URL.createObjectURL(tutorialImageFile);
            setPreviewImageUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (selectedTutorialForEdit?.imageUrl) {
            setPreviewImageUrl(selectedTutorialForEdit.imageUrl);
        } else {
            setPreviewImageUrl(null);
        }
    }, [tutorialImageFile, selectedTutorialForEdit]);

    // Effect to reset/set form data when selectedTutorialForEdit changes
    useEffect(() => {
        if (selectedTutorialForEdit) {
            const categories = Array.isArray(selectedTutorialForEdit.categories) ? selectedTutorialForEdit.categories.map(cat => ({
                name: cat.name || '',
                subcategories: Array.isArray(cat.subcategories) ? cat.subcategories.map(sub => ({
                    name: sub.name || '',
                    content: sub.content || ''
                })) : [{ name: '', content: '' }]
            })) : [{ name: '', subcategories: [{ name: '', content: '' }] }];
            setNewTutorial({ ...selectedTutorialForEdit, categories });
            setTutorialImageFile(null);
        } else {
            setNewTutorial({ title: '', description: '', imageUrl: '', categories: [{ name: '', subcategories: [{ name: '', content: '' }] }] });
            setTutorialImageFile(null);
        }
    }, [selectedTutorialForEdit]);

    const handleTutorialImageChange = (e) => {
        const file = e.target.files[0];
        setTutorialImageFile(file);

        if (!file) {
            setNewTutorial(prev => ({ ...prev, imageUrl: '' }));
            return;
        }

        if (!file.type.match('image.*')) {
            onError('Please select an image file (JPEG, PNG) for the tutorial.');
            toast.error('Please select an image file (JPEG, PNG) for the tutorial.');
            setTutorialImageFile(null);
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            onError('Tutorial image must be less than 5MB.');
            toast.error('Tutorial image must be less than 5MB.');
            setTutorialImageFile(null);
            return;
        }

        uploadTutorialImage(file);
    };

    const uploadTutorialImage = async (file) => {
        setUploadingTutorialImage(true);
        onError(null);
        onSuccess(null);
        try {
            const imageUrl = await uploadImageToCloudinary(file);
            if (imageUrl) {
                setNewTutorial(prev => ({ ...prev, imageUrl: imageUrl }));
                onSuccess('Tutorial image uploaded successfully!');
                toast.success('Tutorial image uploaded successfully!');
            } else {
                onError("Tutorial image upload failed: No URL returned.");
                toast.error("Tutorial image upload failed: No URL returned.");
                setNewTutorial(prev => ({ ...prev, imageUrl: selectedTutorialForEdit?.imageUrl || '' }));
            }
        } catch (error) {
            console.error('Tutorial image upload failed:', error);
            onError('Failed to upload tutorial image. Please try again.');
            toast.error('Failed to upload tutorial image. Please try again.');
            setNewTutorial(prev => ({ ...prev, imageUrl: selectedTutorialForEdit?.imageUrl || '' }));
        } finally {
            setUploadingTutorialImage(false);
        }
    };

    const handleAddOrUpdateTutorial = async (e) => {
        e.preventDefault();
        onError(null);
        onSuccess(null);

        if (!authUser) {
            onError("User not authenticated.");
            toast.error("User not authenticated.");
            return;
        }
        if (!newTutorial.title || newTutorial.categories.some(cat => !cat.name || cat.subcategories.some(sub => !sub.name || !sub.content))) {
            onError("Tutorial title, category names, subcategory names, and their contents are required.");
            toast.error("Tutorial title, category names, subcategory names, and their contents are required.");
            return;
        }
        if (uploadingTutorialImage) {
            onError("Please wait for the image upload to complete before saving.");
            toast.error("Please wait for the image upload to complete before saving.");
            return;
        }

        const tutorialData = {
            ...newTutorial,
            authorId: authUser.uid,
            authorName: instructorData?.name || authUser.email,
            createdAt: selectedTutorialForEdit?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        try {
            if (selectedTutorialForEdit) {
                await updateDoc(doc(db, 'tutorials', selectedTutorialForEdit.id), tutorialData);
                onSuccess('Tutorial updated successfully!');
                toast.success('Tutorial updated successfully!');
            } else {
                await addDoc(collection(db, 'tutorials'), tutorialData);
                onSuccess('Tutorial added successfully!');
                toast.success('Tutorial added successfully!');
            }
            resetTutorialForm();
            setIsAddingTutorial(false);
            fetchMyTutorials(); // Refresh the tutorials list
        } catch (err) {
            console.error("Error saving tutorial:", err);
            onError(`Failed to save tutorial: ${err.message || "An unexpected error occurred."}`);
            toast.error(`Failed to save tutorial: ${err.message || "An unexpected error occurred."}`);
        }
    };

    const handleEditTutorial = (tutorial) => {
        setSelectedTutorialForEdit(tutorial);
        setIsAddingTutorial(true);
        onError(null);
        onSuccess(null);
    };

    const handleDeleteTutorial = async (tutorialId) => {
        if (!window.confirm("Are you sure you want to delete this tutorial? This action cannot be undone.")) return;
        onError(null);
        onSuccess(null);
        try {
            await deleteDoc(doc(db, 'tutorials', tutorialId));
            onSuccess('Tutorial deleted successfully!');
            toast.success('Tutorial deleted successfully!');
            fetchMyTutorials(); // Refresh the tutorials list
        } catch (err) {
            console.error("Error deleting tutorial:", err);
            onError("Failed to delete tutorial. Please try again.");
            toast.error("Failed to delete tutorial. Please try again.");
        }
    };

    const resetTutorialForm = () => {
        setNewTutorial({ title: '', description: '', imageUrl: '', categories: [{ name: '', subcategories: [{ name: '', content: '' }] }] });
        setTutorialImageFile(null);
        setSelectedTutorialForEdit(null);
        onError(null);
        onSuccess(null);
    };

    const openAddTutorialForm = () => {
        resetTutorialForm();
        setIsAddingTutorial(true);
    };

    const closeTutorialForm = () => {
        resetTutorialForm();
        setIsAddingTutorial(false);
    };

    const addCategory = () => {
        setNewTutorial(prev => ({
            ...prev,
            categories: [...prev.categories, { name: '', subcategories: [{ name: '', content: '' }] }]
        }));
    };

    const removeCategory = (index) => {
        setNewTutorial(prev => {
            const newCategories = prev.categories.filter((_, i) => i !== index);
            return { ...prev, categories: newCategories };
        });
    };

    const updateCategory = (index, value) => {
        const newCategories = [...newTutorial.categories];
        newCategories[index] = { ...newCategories[index], name: value };
        setNewTutorial(prev => ({ ...prev, categories: newCategories }));
    };

    const addSubcategory = (categoryIndex) => {
        setNewTutorial(prev => {
            const newCategories = [...prev.categories];
            newCategories[categoryIndex].subcategories = [...newCategories[categoryIndex].subcategories, { name: '', content: '' }];
            return { ...prev, categories: newCategories };
        });
    };

    const removeSubcategory = (categoryIndex, subIndex) => {
        setNewTutorial(prev => {
            const newCategories = [...prev.categories];
            newCategories[categoryIndex].subcategories = newCategories[categoryIndex].subcategories.filter((_, i) => i !== subIndex);
            return { ...prev, categories: newCategories };
        });
    };

    const updateSubcategoryName = (categoryIndex, subIndex, value) => {
        const newCategories = [...newTutorial.categories];
        newCategories[categoryIndex].subcategories[subIndex] = { ...newCategories[categoryIndex].subcategories[subIndex], name: value };
        setNewTutorial(prev => ({ ...prev, categories: newCategories }));
    };

    const updateSubcategoryContent = (categoryIndex, subIndex, value) => {
        const newCategories = [...newTutorial.categories];
        newCategories[categoryIndex].subcategories[subIndex] = { ...newCategories[categoryIndex].subcategories[subIndex], content: value };
        setNewTutorial(prev => ({ ...prev, categories: newCategories }));
    };

    return (
        <Card sx={{
            mt: 3, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.01)' },
            backgroundColor: 'background.paper', boxShadow: 3
        }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" color="primary.main">My Tutorials</Typography>
                    <Button
                        variant="contained"
                        onClick={isAddingTutorial ? closeTutorialForm : openAddTutorialForm}
                        color={isAddingTutorial ? "error" : "primary"}
                        startIcon={isAddingTutorial ? <CancelIcon /> : <AddIcon />}
                    >
                        {isAddingTutorial ? 'Cancel' : 'Add New Tutorial'}
                    </Button>
                </Box>

                {loadingTutorials ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {isAddingTutorial && (
                            <Paper elevation={3} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h6" gutterBottom color="secondary.main">
                                    {selectedTutorialForEdit ? 'Edit Tutorial' : 'Create New Tutorial'}
                                </Typography>
                                <form onSubmit={handleAddOrUpdateTutorial}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Tutorial Title"
                                                name="title"
                                                value={newTutorial.title}
                                                onChange={(e) => setNewTutorial({ ...newTutorial, title: e.target.value })}
                                                fullWidth
                                                margin="normal"
                                                required
                                                InputProps={{ startAdornment: <TutorialIcon sx={{ mr: 1, color: 'action.active' }} /> }}
                                            />
                                        </Grid>
                                         <Grid item xs={12}>
                                            <TextField
                                                label="Short Description"
                                                name="description"
                                                value={newTutorial.description}
                                                onChange={(e) => setNewTutorial({ ...newTutorial, description: e.target.value })}
                                                fullWidth
                                                multiline
                                                rows={2}
                                                margin="normal"
                                                required
                                                InputProps={{ startAdornment: <ContentIcon sx={{ mr: 1, color: 'action.active' }} /> }}
                                            />
                                        </Grid>
                                        {newTutorial.categories.map((category, categoryIndex) => (
                                            <Grid item xs={12} key={categoryIndex} container alignItems="center" spacing={1}>
                                                <Grid item xs={10}>
                                                    <TextField
                                                        label={`Category ${categoryIndex + 1}`}
                                                        value={category.name}
                                                        onChange={(e) => updateCategory(categoryIndex, e.target.value)}
                                                        fullWidth
                                                        margin="normal"
                                                        required
                                                    />
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <IconButton onClick={() => removeCategory(categoryIndex)} color="error">
                                                        <RemoveIcon />
                                                    </IconButton>
                                                </Grid>
                                                {category.subcategories.map((subcategory, subIndex) => (
                                                    <Grid item xs={12} key={subIndex} container alignItems="center" spacing={1} sx={{ pl: 4 }}>
                                                        <Grid item xs={5}>
                                                            <TextField
                                                                label={`Subcategory ${subIndex + 1} Name`}
                                                                value={subcategory.name}
                                                                onChange={(e) => updateSubcategoryName(categoryIndex, subIndex, e.target.value)}
                                                                fullWidth
                                                                margin="normal"
                                                                required
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <TextField
                                                                label={`Subcategory ${subIndex + 1} Content`}
                                                                value={subcategory.content}
                                                                onChange={(e) => updateSubcategoryContent(categoryIndex, subIndex, e.target.value)}
                                                                fullWidth
                                                                margin="normal"
                                                                multiline
                                                                rows={3}
                                                                required
                                                            />
                                                        </Grid>
                                                        <Grid item xs={1}>
                                                            <IconButton onClick={() => removeSubcategory(categoryIndex, subIndex)} color="error">
                                                                <RemoveIcon />
                                                            </IconButton>
                                                        </Grid>
                                                    </Grid>
                                                ))}
                                                <Grid item xs={12}>
                                                    <Button onClick={() => addSubcategory(categoryIndex)} variant="outlined" size="small">
                                                        Add Subcategory
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        ))}
                                        <Grid item xs={12}>
                                            <Button onClick={addCategory} variant="outlined" size="small" sx={{ mb: 2 }}>
                                                Add Category
                                            </Button>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box mb={2}>
                                                <Typography variant="body2" gutterBottom color="text.primary">
                                                    <ImageIcon sx={{ fontSize: 'small', verticalAlign: 'middle', mr: 0.5 }} />
                                                    Tutorial Image (Optional)
                                                </Typography>
                                                <input type="file" onChange={handleTutorialImageChange} accept="image/*" />
                                                {(previewImageUrl) && (
                                                    <Box mt={1}>
                                                        <Typography variant="caption" color="text.secondary">Image Preview:</Typography>
                                                        <img src={previewImageUrl} alt="Tutorial preview" style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain', marginTop: 8, border: '1px solid #ccc' }} />
                                                    </Box>
                                                )}
                                                {uploadingTutorialImage && <CircularProgress size={20} sx={{ ml: 2 }} />}
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                                <Button
                                                    type="button"
                                                    onClick={closeTutorialForm}
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
                                                    disabled={uploadingTutorialImage}
                                                >
                                                    {uploadingTutorialImage ? 'Uploading...' : (selectedTutorialForEdit ? 'Update Tutorial' : 'Add Tutorial')}
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </form>
                            </Paper>
                        )}
                        {!isAddingTutorial && (
                            <>
                                {myTutorials.length === 0 ? (
                                    <Typography variant="body1" textAlign="center" py={4} color="text.secondary">You haven't created any tutorials yet. Start by adding a new tutorial!</Typography>
                                ) : (
                                    <Grid container spacing={2}>
                                        {myTutorials.map(tutorial => (
                                            <Grid item xs={12} sm={6} lg={3} key={tutorial.id}>
                                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' }, boxShadow: 2 }}>
                                                    {tutorial.imageUrl && (<Box sx={{ height: 140, backgroundImage: `url(${tutorial.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid', borderColor: 'divider' }} />)}
                                                    <CardContent sx={{ flexGrow: 1 }}>
                                                        <Typography variant="h6" gutterBottom color="primary.dark">{tutorial.title}</Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                            {tutorial.description?.substring(0, 100) || 'No description available.'}
                                                        </Typography>
                                                        {tutorial.categories.map((category, catIndex) => (
                                                            <Box key={catIndex} sx={{ mb: 2 }}>
                                                                <Typography variant="subtitle1" color="text.primary">Category: {category.name}</Typography>
                                                                {category.subcategories.map((subcategory, subIndex) => (
                                                                    <Box key={subIndex} sx={{ pl: 2, mt: 1 }}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Subcategory: {subcategory.name} - {subcategory.content.substring(0, 50) + (subcategory.content.length > 50 ? '...' : '')}
                                                                        </Typography>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        ))}
                                                        <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                                                            <DateIcon sx={{ fontSize: 'small', verticalAlign: 'middle', mr: 0.5 }} />
                                                            Created: {new Date(tutorial.createdAt).toLocaleDateString()}
                                                        </Typography>
                                                    </CardContent>
                                                    <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Button size="small" onClick={() => handleEditTutorial(tutorial)} startIcon={<EditIcon />} color="secondary">Edit</Button>
                                                        <Button size="small" color="error" onClick={() => handleDeleteTutorial(tutorial.id)} startIcon={<DeleteIcon />}>Delete</Button>
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

export default InstructorTutorials;