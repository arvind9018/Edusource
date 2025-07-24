import React, { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { uploadImageToCloudinary } from '../../utils/cloudinary';
import {
    Box,
    Typography,
    Avatar,
    Card,
    CardContent,
    TextField,
    Button,
    Input,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Grid,
    Paper,
    Divider,
    LinearProgress,
    Chip
} from '@mui/material';
import {
    AccountCircle, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon,
    CloudUpload as CloudUploadIcon, Cake as CakeIcon, PhoneIphone as PhoneIcon,
    Transgender as TransgenderIcon, Email as EmailIcon, School as SchoolIcon,
    Assignment as AssignmentIcon, PlayCircleOutline as PlayCircleIcon,
    Person as PersonIcon, Book as CourseIcon, CheckCircleOutline as CompletedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();

    const [studentData, setStudentData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [loadingImage, setLoadingImage] = useState(false);
    const [tempImage, setTempImage] = useState(null);

    const [formData, setFormData] = useState({
        name: '', dob: '', mobile: '', gender: '', email: '',
        studentId: '', role: 'student'
    });

    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loadingEnrolledCourses, setLoadingEnrolledCourses] = useState(true);
    const [loadingStudentData, setLoadingStudentData] = useState(true);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const displayError = useCallback((msg) => {
        setError(msg);
        toast.error(msg);
        setTimeout(() => setError(null), 5000);
    }, []);

    const displaySuccess = useCallback((msg) => {
        setSuccess(msg);
        toast.success(msg);
        setTimeout(() => setSuccess(null), 5000);
    }, []);

    // Fetch Student Profile Data
    const fetchStudentProfileData = useCallback(async () => {
        if (!user) {
            setLoadingStudentData(false);
            return;
        }
        try {
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.role !== 'student') {
                    navigate(`/${data.role}-dashboard`);
                    return;
                }
                setStudentData(data);
                setFormData({
                    name: data.name || '', dob: data.dob || '', mobile: data.mobile || '',
                    gender: data.gender || '', email: data.email || user.email || '',
                    studentId: data.studentId || '', role: data.role || 'student'
                });
            } else {
                // If document does not exist, create it with a 'student' role
                await setDoc(docRef, {
                    email: user.email, createdAt: new Date().toISOString(),
                    name: '', dob: '', mobile: '', gender: '', 
                    studentId: user.uid, // ✅ Student ID is automatically set to Firebase UID
                    role: 'student'
                });
                setStudentData({ email: user.email, createdAt: new Date().toISOString(), role: 'student' });
                setFormData(prev => ({ ...prev, email: user.email, role: 'student', studentId: user.uid }));
            }
        } catch (err) {
            console.error("Error fetching student profile:", err);
            displayError("Failed to load student profile data.");
        } finally {
            setLoadingStudentData(false);
        }
    }, [user, navigate, displayError]);

    // Fetch Enrolled Courses
    const fetchEnrolledCourses = useCallback(async () => {
        if (!user) {
            setLoadingEnrolledCourses(false);
            return;
        }
        try {
            setLoadingEnrolledCourses(true);
            const coursesRef = collection(db, 'courses');
            const q = query(coursesRef, where('enrolledUsers', 'array-contains', user.uid));
            const querySnapshot = await getDocs(q);

            const coursesData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                const totalLectures = data.lectures?.length || 0;
                const completedLectures = Math.floor(Math.random() * (totalLectures + 1));
                const progressValue = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;

                return {
                    id: doc.id,
                    ...data,
                    totalLectures,
                    completedLectures,
                    progressValue: parseFloat(progressValue.toFixed(0))
                };
            });
            setEnrolledCourses(coursesData);
        } catch (err) {
            console.error("Error fetching enrolled courses:", err);
            displayError("Failed to load enrolled courses.");
        } finally {
            setLoadingEnrolledCourses(false);
        }
    }, [user, displayError]);

    useEffect(() => {
        if (!loading) {
            fetchStudentProfileData();
            fetchEnrolledCourses();
        }
    }, [user, loading, fetchStudentProfileData, fetchEnrolledCourses]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            displayError('Please select an image file (JPEG, PNG).');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            displayError('Image must be less than 2MB.');
            return;
        }

        setLoadingImage(true);
        setError(null);
        let currentTempUrl = null;
        try {
            currentTempUrl = URL.createObjectURL(file);
            setTempImage(currentTempUrl);

            const imageUrl = await uploadImageToCloudinary(file);
            await setDoc(
                doc(db, 'users', user.uid),
                { profilePicture: imageUrl },
                { merge: true }
            );
            setStudentData(prev => ({ ...prev, profilePicture: imageUrl }));
            displaySuccess('Profile picture updated successfully!');
        } catch (error) {
            console.error('Image upload failed:', error);
            displayError('Failed to upload image. Please try again.');
            setTempImage(null);
        } finally {
            setLoadingImage(false);
            if (currentTempUrl) URL.revokeObjectURL(currentTempUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            await setDoc(doc(db, 'users', user.uid), formData, { merge: true });
            setStudentData(prev => ({ ...prev, ...formData }));
            setEditMode(false);
            displaySuccess('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating student data:', error);
            displayError('Failed to update profile. Please try again.');
        }
    };

    if (loading || loadingStudentData) {
        return (
            <Box sx={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
                bgcolor: 'background.default'
            }}>
                <CircularProgress color="primary" size={60} />
                <Typography variant="h6" color="text.secondary" sx={{ ml: 2 }}>Loading Student Dashboard...</Typography>
            </Box>
        );
    }

    if (!user) {
        return (
            <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, mt: 4, bgcolor: 'background.default' }}>
                <Alert severity="error" sx={{ boxShadow: 1 }}>Please log in to view your dashboard</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{
            maxWidth: 1400, mx: 'auto', p: 3, minHeight: '100vh',
            bgcolor: 'grey.100', borderRadius: 2, boxShadow: 3
        }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}
                sx={{
                    pb: 1, borderBottom: '2px solid', borderColor: 'primary.light',
                    bgcolor: 'white', borderRadius: '8px 8px 0 0', p: 2, boxShadow: 1
                }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                    <SchoolIcon sx={{ fontSize: '2.5rem', verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
                    Student Dashboard
                </Typography>
                <Chip
                    label={`Role: ${studentData?.role ? studentData.role.charAt(0).toUpperCase() + studentData.role.slice(1) : 'Student'}`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: '1rem', p: 1, fontWeight: 'bold' }}
                />
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, boxShadow: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3, boxShadow: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={4} sx={{ p: 3, height: '100%', bgcolor: 'white', borderRadius: 2 }}>
                        <Typography variant="h5" color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ mr: 1 }} /> Your Profile
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                            <Box position="relative">
                                <Avatar
                                    src={tempImage || (studentData?.profilePicture || '')}
                                    sx={{ width: 120, height: 120, mb: 2, border: '2px solid', borderColor: 'secondary.main' }}
                                >
                                    {!studentData?.profilePicture && !tempImage &&
                                        (studentData?.name?.charAt(0)?.toUpperCase() || <AccountCircle sx={{ fontSize: '3rem' }} />)}
                                </Avatar>
                                {loadingImage && (
                                    <CircularProgress
                                        size={48}
                                        sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-24px', ml: '-24px' }}
                                    />
                                )}
                            </Box>
                            <Input
                                type="file"
                                id="profile-image-upload"
                                onChange={handleImageChange}
                                inputProps={{ accept: 'image/*' }}
                                sx={{ display: 'none' }}
                            />
                            <label htmlFor="profile-image-upload">
                                <Button variant="contained" component="span" startIcon={<CloudUploadIcon />} color="secondary">
                                    Upload Profile Picture
                                </Button>
                            </label>
                            <Typography variant="caption" display="block" mt={1} color="text.secondary">
                                JPG, PNG up to 2MB
                            </Typography>
                        </Box>

                        {editMode ? (
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    label="Full Name" name="name" value={formData.name} onChange={handleInputChange}
                                    fullWidth margin="normal" required InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} /> }}
                                />
                                <TextField
                                    label="Date of Birth (YYYY-MM-DD)" name="dob" type="date" value={formData.dob}
                                    onChange={handleInputChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }}
                                    InputProps={{ startAdornment: <CakeIcon sx={{ mr: 1, color: 'action.active' }} /> }}
                                />
                                <TextField
                                    label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleInputChange}
                                    fullWidth margin="normal" InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} /> }}
                                />
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Gender</InputLabel>
                                    <Select name="gender" value={formData.gender} onChange={handleInputChange} label="Gender">
                                        <MenuItem value="male">Male</MenuItem>
                                        <MenuItem value="female">Female</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                        <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange}
                                    fullWidth margin="normal" required disabled InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} /> }}
                                />
                                <TextField
                                    label="Student ID" name="studentId" value={formData.studentId} onChange={handleInputChange}
                                    fullWidth margin="normal" required
                                    disabled // ✅ Student ID is now read-only
                                    InputProps={{ startAdornment: <AssignmentIcon sx={{ mr: 1, color: 'action.active' }} /> }}
                                />
                                <TextField
                                    label="Role" name="role" value={formData.role} fullWidth margin="normal" disabled
                                    InputProps={{ startAdornment: <SchoolIcon sx={{ mr: 1, color: 'action.active' }} /> }}
                                />
                                <Box mt={2} display="flex" gap={2}>
                                    <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />}>
                                        Save Changes
                                    </Button>
                                    <Button variant="outlined" onClick={() => setEditMode(false)} startIcon={<CancelIcon />} color="error">
                                        Cancel
                                    </Button>
                                </Box>
                            </form>
                        ) : (
                            <>
                                <Typography variant="h6" color="primary.dark" sx={{ mb: 1 }}>
                                    <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                    {studentData?.name || 'No name provided'}
                                </Typography>
                                <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <AssignmentIcon sx={{ fontSize: 'small', mr: 1, color: 'info.main' }} />
                                    Student ID: {studentData?.studentId || 'Not set'}
                                </Typography>
                                <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <EmailIcon sx={{ fontSize: 'small', mr: 1, color: 'info.main' }} />
                                    Email: {studentData?.email || user.email}
                                </Typography>
                                <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <CakeIcon sx={{ fontSize: 'small', mr: 1, color: 'info.main' }} />
                                    Date of Birth: {studentData?.dob || 'Not set'}
                                </Typography>
                                <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <PhoneIcon sx={{ fontSize: 'small', mr: 1, color: 'info.main' }} />
                                    Mobile: {studentData?.mobile || 'Not provided'}
                                </Typography>
                                <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <TransgenderIcon sx={{ fontSize: 'small', mr: 1, color: 'info.main' }} />
                                    Gender: {studentData?.gender || 'Not specified'}
                                </Typography>
                                <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <SchoolIcon sx={{ fontSize: 'small', mr: 1, color: 'info.main' }} />
                                    Role: <Typography component="span" color="primary.main" sx={{ fontWeight: 'bold', ml: 0.5 }}>{studentData?.role || 'Not specified'}</Typography>
                                </Typography>

                                <Button
                                    variant="contained"
                                    sx={{ mt: 3 }}
                                    onClick={() => setEditMode(true)}
                                    startIcon={<EditIcon />}
                                    color="primary"
                                    fullWidth
                                >
                                    Edit Profile
                                </Button>
                            </>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper elevation={4} sx={{ p: 3, height: '100%', bgcolor: 'white', borderRadius: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h5" color="primary.main" sx={{ display: 'flex', alignItems: 'center' }}>
                                <CourseIcon sx={{ mr: 1 }} /> My Enrolled Courses
                            </Typography>
                            <Chip
                                label={`Enrolled: ${enrolledCourses.length}`}
                                color="secondary"
                                variant="filled"
                                sx={{ fontSize: '1rem', p: 1, fontWeight: 'bold' }}
                            />
                        </Box>
                        <Divider sx={{ mb: 3 }} />

                        {loadingEnrolledCourses ? (
                            <Box display="flex" justifyContent="center" py={4}>
                                <CircularProgress color="secondary" />
                                <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>Loading courses...</Typography>
                            </Box>
                        ) : enrolledCourses.length === 0 ? (
                            <Typography variant="body1" textAlign="center" color="text.secondary" py={4}>
                                You are not enrolled in any courses yet.
                            </Typography>
                        ) : (
                            <Grid container spacing={3}>
                                {enrolledCourses.map(course => (
                                    <Grid item xs={12} sm={6} lg={4} key={course.id}>
                                        <Card
                                            sx={{
                                                height: '100%', display: 'flex', flexDirection: 'column',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                                '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
                                                borderRadius: 2, boxShadow: 3
                                            }}
                                        >
                                            {course.bannerImage && (
                                                <Box
                                                    sx={{
                                                        height: 140,
                                                        backgroundImage: `url(${course.bannerImage})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        borderBottom: '1px solid', borderColor: 'divider'
                                                    }}
                                                />
                                            )}
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" gutterBottom color="primary.dark">
                                                    {course.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                    {course.shortDescription}
                                                </Typography>
                                                <Typography variant="caption" color="text.primary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <AssignmentIcon sx={{ fontSize: 'small', mr: 0.5 }} />
                                                    Total Lectures: {course.totalLectures}
                                                </Typography>
                                                <Typography variant="caption" color="text.primary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <CompletedIcon sx={{ fontSize: 'small', mr: 0.5, color: 'success.main' }} />
                                                    Completed: {course.completedLectures}
                                                </Typography>

                                                <Box sx={{ width: '100%', mt: 1 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={course.progressValue}
                                                        sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.300' }}
                                                        color="primary"
                                                    />
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                        {course.progressValue}% Complete
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                            <Box sx={{ p: 2, pt: 0 }}>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    onClick={() => navigate(`/course-detail/${course.id}`)}
                                                    startIcon={<PlayCircleIcon />}
                                                    color="primary"
                                                >
                                                    Go to Course
                                                </Button>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default StudentDashboard;