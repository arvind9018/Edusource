// src/components/InstructorDashboard/InstructorCourses.jsx
import React, { useState } from 'react';
import {
    collection, doc, updateDoc, deleteDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import {
    Box, Typography, Card, CardContent, Button, Paper, Grid
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, School as CourseIcon, CalendarToday as DateIcon, AttachMoney as PriceIcon } from '@mui/icons-material';
import InstructorCourseForm from './InstructorCourseForm'; // Import the new component

const InstructorCourses = ({ user, instructorData, myCourses, setMyCourses, specializations, onError, onSuccess, fetchSpecializationsData }) => {
    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [selectedCourseForEdit, setSelectedCourseForEdit] = useState(null);

    const handleEditCourse = (course) => {
        setSelectedCourseForEdit(course);
        setIsAddingCourse(true);
        onError(null);
        onSuccess(null);
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
        onError(null);
        onSuccess(null);
        try {
            await deleteDoc(doc(db, 'courses', courseId));
            // Optimistic update: remove the course from local state
            setMyCourses(myCourses.filter(c => c.id !== courseId));
            onSuccess('Course deleted successfully!');
        } catch (err) {
            console.error("Error deleting course:", err);
            onError("Failed to delete course. Please try again.");
        }
    };

    const openAddCourseForm = () => {
        setSelectedCourseForEdit(null); // Reset selected course when adding a new one
        setIsAddingCourse(true);
    };

    const closeCourseForm = () => {
        setSelectedCourseForEdit(null);
        setIsAddingCourse(false);
    };

    const handleCourseSaved = (newOrUpdatedCourse) => {
        if (selectedCourseForEdit) {
            // Update the state for the edited course
            setMyCourses(myCourses.map(c => c.id === newOrUpdatedCourse.id ? newOrUpdatedCourse : c));
            onSuccess('Course updated successfully!');
        } else {
            // Add the new course to the state
            setMyCourses([...myCourses, newOrUpdatedCourse]);
            onSuccess('Course added successfully!');
        }
        closeCourseForm();
        fetchSpecializationsData(); // Trigger a re-fetch of specializations
    };

    return (
        <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.01)' }, backgroundColor: 'background.paper', boxShadow: 3 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" color="primary.main">My Courses</Typography>
                    <Button
                        variant="contained"
                        onClick={isAddingCourse ? closeCourseForm : openAddCourseForm}
                        color={isAddingCourse ? "error" : "primary"}
                        startIcon={isAddingCourse ? <DeleteIcon /> : <AddIcon />}
                    >
                        {isAddingCourse ? 'Cancel' : 'Add New Course'}
                    </Button>
                </Box>

                {isAddingCourse && (
                    <InstructorCourseForm
                        user={user}
                        instructorData={instructorData}
                        specializations={specializations}
                        selectedCourseForEdit={selectedCourseForEdit}
                        onSuccess={onSuccess}
                        onError={onError}
                        onClose={closeCourseForm}
                        onCourseSaved={handleCourseSaved}
                        onCoursesUpdated={fetchSpecializationsData} // Correct prop for re-fetching data
                    />
                )}

                {!isAddingCourse && (
                    <>
                        {myCourses.length === 0 ? (
                            <Typography variant="body1" textAlign="center" py={4} color="text.secondary">
                                You haven't created any courses yet. Start by adding a new course!
                            </Typography>
                        ) : (
                            <Grid container spacing={2}>
                                {myCourses.map(course => (
                                    <Grid item xs={12} sm={6} lg={4} key={course.id}>
                                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' }, boxShadow: 2 }}>
                                            {course.bannerImage && (
                                                <Box
                                                    sx={{
                                                        height: 140,
                                                        backgroundImage: `url(${course.bannerImage})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center'
                                                    }}
                                                />
                                            )}
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" gutterBottom color="primary.dark">{course.title}</Typography>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>{course.shortDescription}</Typography>
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <PriceIcon sx={{ mr: 0.5, color: 'text.secondary', fontSize: 'small' }} />
                                                    {course.type === 'Paid' ? `₹${parseFloat(course.price || 0).toFixed(2)}` : 'Free'}
                                                </Typography>
                                                {course.specialization && (
                                                    <Typography variant="caption" color="text.primary" sx={{ mt: 1, display: 'block' }}>
                                                        <CourseIcon sx={{ mr: 0.5, fontSize: 'small', verticalAlign: 'middle' }} />
                                                        Specialization: {course.specialization}
                                                    </Typography>
                                                )}
                                                {course.lectures && course.lectures.length > 0 && (
                                                    <Typography variant="caption" color="text.primary" sx={{ mt: 1, display: 'block' }}>
                                                        <DateIcon sx={{ mr: 0.5, fontSize: 'small', verticalAlign: 'middle' }} />
                                                        {course.lectures.length} Lectures
                                                    </Typography>
                                                )}
                                            </CardContent>
                                            <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Button size="small" onClick={() => handleEditCourse(course)} startIcon={<EditIcon />} color="secondary">Edit</Button>
                                                <Button size="small" color="error" onClick={() => handleDeleteCourse(course.id)} startIcon={<DeleteIcon />}>Delete</Button>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default InstructorCourses;