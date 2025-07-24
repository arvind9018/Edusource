// src/components/InstructorDashboard/InstructorCourseForm.jsx
import React, { useState, useEffect } from 'react';
import {
    collection, addDoc, updateDoc, doc, getDocs, query, where, arrayUnion, arrayRemove, getDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadImageToCloudinary } from '../../utils/cloudinary';
import {
    Box, Typography, TextField, Button, CircularProgress, Paper, Grid, MenuItem, IconButton
} from '@mui/material';
import {
    Save as SaveIcon, School as CourseIcon, Description as DescIcon,
    MonetizationOn as PriceIcon, AccessTime as TimeIcon, Image as ImageIcon,
    VideoLibrary as VideoIcon, Note as NoteIcon, AddCircleOutline as AddIcon,
    RemoveCircleOutline as RemoveIcon
} from '@mui/icons-material';

// Predefined list of specializations
const PREDEFINED_SPECIALIZATIONS = [
    'Data Science',
    'Machine Learning',
    'Web Development',
    'Mobile Development',
    'Cloud Computing',
    'Cybersecurity',
    'Game Development',
    'Digital Marketing',
    'UI/UX Design',
    'Artificial Intelligence'
];

const InstructorCourseForm = ({
    user, instructorData, selectedCourseForEdit, onSuccess, onError, onClose, onCourseSaved, onCoursesUpdated
}) => {
    const [course, setCourse] = useState({
        title: '',
        shortDescription: '',
        description: '',
        price: '',
        type: 'Free',
        specialization: '',
        duration: '',
        bannerImage: '',
        // Initialize with a default lecture entry
        lectures: [{ title: '', videoUrl: '', notesUrl: '' }],
    });
    const [bannerImageFile, setBannerImageFile] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Populate form for editing
    useEffect(() => {
        if (selectedCourseForEdit) {
            setCourse(selectedCourseForEdit);
            setPreviewImageUrl(selectedCourseForEdit.bannerImage);
        } else {
            setCourse({
                title: '',
                shortDescription: '',
                description: '',
                price: '',
                type: 'Free',
                specialization: '',
                duration: '',
                bannerImage: '',
                lectures: [{ title: '', videoUrl: '', notesUrl: '' }], // Reset lectures
            });
            setPreviewImageUrl(null);
        }
    }, [selectedCourseForEdit]);

    // Handle image preview
    useEffect(() => {
        if (bannerImageFile) {
            const objectUrl = URL.createObjectURL(bannerImageFile);
            setPreviewImageUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (selectedCourseForEdit?.bannerImage) {
            setPreviewImageUrl(selectedCourseForEdit.bannerImage);
        } else {
            setPreviewImageUrl(null);
        }
    }, [bannerImageFile, selectedCourseForEdit]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourse({ ...course, [name]: value });
    };

    const handleLectureChange = (index, e) => {
        const { name, value } = e.target;
        const updatedLectures = course.lectures.map((lecture, i) =>
            i === index ? { ...lecture, [name]: value } : lecture
        );
        setCourse({ ...course, lectures: updatedLectures });
    };

    const handleAddLecture = () => {
        setCourse({
            ...course,
            lectures: [...course.lectures, { title: '', videoUrl: '', notesUrl: '' }],
        });
    };

    const handleRemoveLecture = (index) => {
        const updatedLectures = course.lectures.filter((_, i) => i !== index);
        setCourse({ ...course, lectures: updatedLectures });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setBannerImageFile(file);

        if (!file) {
            setCourse(prev => ({ ...prev, bannerImage: selectedCourseForEdit?.bannerImage || '' }));
            return;
        }
        if (!file.type.match('image.*')) {
            onError('Please select an image file (JPEG, PNG) for the banner.');
            setBannerImageFile(null);
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            onError('Banner image must be less than 5MB.');
            setBannerImageFile(null);
            return;
        }

        uploadBannerImage(file);
    };

    const uploadBannerImage = async (file) => {
        setUploadingImage(true);
        onError(null);
        try {
            const imageUrl = await uploadImageToCloudinary(file);
            if (imageUrl) {
                setCourse(prev => ({ ...prev, bannerImage: imageUrl }));
                onSuccess('Image uploaded successfully!');
            } else {
                onError("Image upload failed: No URL returned.");
                setCourse(prev => ({ ...prev, bannerImage: selectedCourseForEdit?.bannerImage || '' }));
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            onError('Failed to upload banner image. Please try again.');
            setCourse(prev => ({ ...prev, bannerImage: selectedCourseForEdit?.bannerImage || '' }));
        } finally {
            setUploadingImage(false);
        }
    };

    const handleAddOrUpdateCourse = async (e) => {
        e.preventDefault();
        onError(null); onSuccess(null);
        setIsSaving(true);

        if (!user) { onError("User not authenticated."); setIsSaving(false); return; }
        if (!course.title || !course.shortDescription || !course.specialization || !course.type) {
            onError("Title, description, type, and specialization are required.");
            setIsSaving(false);
            return;
        }
        if (course.type === 'Paid' && (!course.price || isNaN(parseFloat(course.price)) || parseFloat(course.price) <= 0)) {
            onError("Paid courses require a valid price.");
            setIsSaving(false);
            return;
        }
        if (uploadingImage) {
            onError("Please wait for the image upload to complete before saving.");
            setIsSaving(false);
            return;
        }
        if (!course.bannerImage) {
            onError("Please upload a banner image for the course.");
            setIsSaving(false);
            return;
        }

        const courseData = {
            ...course,
            authorId: user.uid,
            authorName: instructorData?.name || user.email,
            createdAt: selectedCourseForEdit?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            price: course.type === 'Paid' ? parseFloat(course.price) : 0,
        };

        let courseId = selectedCourseForEdit?.id;

        try {
            // If specialization is changed, remove the course from the old one first
            if (selectedCourseForEdit && selectedCourseForEdit.specialization !== courseData.specialization) {
                await removeCourseFromSpecialization(selectedCourseForEdit.id, selectedCourseForEdit.specialization);
            }

            // Save the course document and get its ID
            if (selectedCourseForEdit) {
                await updateDoc(doc(db, 'courses', selectedCourseForEdit.id), courseData);
                courseId = selectedCourseForEdit.id;
            } else {
                const docRef = await addDoc(collection(db, 'courses'), courseData);
                courseId = docRef.id;
            }

            // Prepare the course details object for the specialization's `courses` array
            const courseDetails = {
                id: courseId,
                title: courseData.title,
                shortDescription: courseData.shortDescription,
                authorName: courseData.authorName,
                bannerImage: courseData.bannerImage,
            };

            // Now, add or update the course within the specialization document
            await updateSpecializationWithDetails(courseDetails, courseData.specialization);

            onCourseSaved({ ...courseData, id: courseId });
            onCoursesUpdated();
            onClose();
        } catch (err) {
            console.error("Error saving course:", err);
            onError(`Failed to save course: ${err.message || "An unexpected error occurred."}`);
        } finally {
            setIsSaving(false);
        }
    };

    const removeCourseFromSpecialization = async (courseId, specializationName) => {
        try {
            if (!specializationName) return;

            const specializationsRef = collection(db, 'specializations');
            const q = query(specializationsRef, where('name', '==', specializationName));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const specializationDocRef = doc(db, 'specializations', querySnapshot.docs[0].id);
                const oldCourseData = await getDoc(doc(db, 'courses', courseId));
                if (oldCourseData.exists()) {
                    const oldCourseDetails = {
                        id: courseId,
                        title: oldCourseData.data().title,
                        shortDescription: oldCourseData.data().shortDescription,
                        authorName: oldCourseData.data().authorName,
                        bannerImage: oldCourseData.data().bannerImage,
                    };

                    await updateDoc(specializationDocRef, {
                        courses: arrayRemove(oldCourseDetails),
                    });
                }
            }
        } catch (error) {
            console.error("Error removing course from old specialization:", error);
            throw new Error("Failed to remove course from old specialization.");
        }
    };

    // This is the core function where the array logic is fixed
    const updateSpecializationWithDetails = async (courseDetails, specializationName) => {
        try {
            const specializationsRef = collection(db, 'specializations');
            const q = query(specializationsRef, where('name', '==', specializationName));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // If specialization doesn't exist, create it with the new course
                await addDoc(specializationsRef, {
                    name: specializationName,
                    courses: [courseDetails], // Start a new array with the course
                });
            } else {
                // If specialization exists, get the document reference
                const specializationDocRef = doc(db, 'specializations', querySnapshot.docs[0].id);

                // Fetch the existing courses array to check for an existing entry
                const existingCoursesArray = querySnapshot.docs[0].data().courses || [];

                // Find and remove the old version of the course from the array
                const updatedCoursesArray = existingCoursesArray.filter(c => c.id !== courseDetails.id);

                // Add the new/updated course details to the array
                updatedCoursesArray.push(courseDetails);

                // Update the document with the new array
                await updateDoc(specializationDocRef, {
                    courses: updatedCoursesArray,
                });
            }
        } catch (error) {
            console.error("Error updating specialization:", error);
            onError("Failed to update specialization with the new course. Please check Firestore.");
            throw error; // Re-throw the error to be caught by the main handler
        }
    };


    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom color="secondary.main">
                {selectedCourseForEdit ? 'Edit Course' : 'Create New Course'}
            </Typography>
            <form onSubmit={handleAddOrUpdateCourse}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="Course Title"
                            name="title"
                            value={course.title}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: <CourseIcon sx={{ mr: 1, color: 'action.active' }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Short Description"
                            name="shortDescription"
                            value={course.shortDescription}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: <DescIcon sx={{ mr: 1, color: 'action.active' }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Detailed Description"
                            name="description"
                            value={course.description}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            multiline
                            rows={4}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Duration (e.g., 10 hours)"
                            name="duration"
                            value={course.duration}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: <TimeIcon sx={{ mr: 1, color: 'action.active' }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            label="Specialization"
                            name="specialization"
                            value={course.specialization}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                        >
                            {PREDEFINED_SPECIALIZATIONS.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            label="Course Type"
                            name="type"
                            value={course.type}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        >
                            <MenuItem value="Free">Free</MenuItem>
                            <MenuItem value="Paid">Paid</MenuItem>
                        </TextField>
                    </Grid>
                    {course.type === 'Paid' && (
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Price (in INR)"
                                name="price"
                                type="number"
                                value={course.price}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                                required
                                InputProps={{
                                    startAdornment: <PriceIcon sx={{ mr: 1, color: 'action.active' }} />
                                }}
                            />
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <Box mb={2}>
                            <Typography variant="body2" gutterBottom color="text.primary">
                                <ImageIcon sx={{ fontSize: 'small', verticalAlign: 'middle', mr: 0.5 }} />
                                Banner Image
                            </Typography>
                            <input type="file" onChange={handleImageChange} accept="image/*" />
                            {(previewImageUrl) && (
                                <Box mt={1}>
                                    <Typography variant="caption" color="text.secondary">Image Preview:</Typography>
                                    <img src={previewImageUrl} alt="Banner preview" style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain', marginTop: 8, border: '1px solid #ccc' }} />
                                </Box>
                            )}
                            {uploadingImage && <CircularProgress size={20} sx={{ ml: 2 }} />}
                        </Box>
                    </Grid>
                </Grid>
                ---
                ## Course Lectures
                <Box mt={3}>
                    {course.lectures.map((lecture, index) => (
                        <Paper key={index} elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="subtitle1">Lecture {index + 1}</Typography>
                                {course.lectures.length > 1 && (
                                    <IconButton onClick={() => handleRemoveLecture(index)} color="error" size="small">
                                        <RemoveIcon />
                                    </IconButton>
                                )}
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Lecture Title"
                                        name="title"
                                        value={lecture.title}
                                        onChange={(e) => handleLectureChange(index, e)}
                                        fullWidth
                                        required
                                        InputProps={{
                                            startAdornment: <VideoIcon sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Video URL (e.g., YouTube link)"
                                        name="videoUrl"
                                        value={lecture.videoUrl}
                                        onChange={(e) => handleLectureChange(index, e)}
                                        fullWidth
                                        required
                                        InputProps={{
                                            startAdornment: <VideoIcon sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Notes URL (e.g., Google Drive link)"
                                        name="notesUrl"
                                        value={lecture.notesUrl}
                                        onChange={(e) => handleLectureChange(index, e)}
                                        fullWidth
                                        InputProps={{
                                            startAdornment: <NoteIcon sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                    <Button
                        onClick={handleAddLecture}
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{ mt: 2 }}
                    >
                        Add Another Lecture
                    </Button>
                </Box>
                ---
                <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                    <Button type="button" onClick={onClose} variant="outlined">Cancel</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={uploadingImage || isSaving}>
                        {(uploadingImage || isSaving) ? <CircularProgress size={24} /> : (selectedCourseForEdit ? 'Update Course' : 'Add Course')}
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default InstructorCourseForm;