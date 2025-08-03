// src/components/InstructorDashboard/InstructorProfile.jsx
import React, { useState, useEffect } from 'react';
import {
    doc, setDoc,
} from 'firebase/firestore';
import { auth, db } from '../../firebase'; // Assuming correct path
import { uploadImageToCloudinary } from '../../utils/cloudinary'; // Assuming correct path
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
    Divider,
    Grid
} from '@mui/material';
import {
    AccountCircle,
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    CloudUpload as CloudUploadIcon,
    Cake as CakeIcon,
    PhoneIphone as PhoneIcon,
    Transgender as TransgenderIcon,
    School as SchoolIcon,
    Workspaces as WorkspacesIcon, // Or a more specific specialization icon
    Email as EmailIcon,
    VerifiedUser as RoleIcon // Example for role
} from '@mui/icons-material';


const InstructorProfile = ({ instructorData, specializations, onProfileUpdate, onError, onSuccess, user }) => {
    const [editProfileMode, setEditProfileMode] = useState(false);
    const [profileFormData, setProfileFormData] = useState({
        name: '', dob: '', mobile: '', gender: '', email: '',
        qualifications: '', specialization: '', role: ''
    });
    const [loadingImage, setLoadingImage] = useState(false);
    const [tempImage, setTempImage] = useState(null); // For profile picture preview

    useEffect(() => {
        if (instructorData) {
            setProfileFormData({
                name: instructorData.name || '',
                dob: instructorData.dob || '',
                mobile: instructorData.mobile || '',
                gender: instructorData.gender || '',
                email: instructorData.email || user.email || '', // Fallback to user.email
                qualifications: instructorData.qualifications || '',
                specialization: instructorData.specialization || '', // This will be free text
                role: instructorData.role || 'instructor' // Default to instructor if not set
            });
            setTempImage(null); // Clear tempImage on data load/update
        }
    }, [instructorData, user.email]);

    const handleProfileImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            onError('Please select an image file (JPEG, PNG).');
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            onError('Image must be less than 2MB.');
            return;
        }

        setLoadingImage(true);
        onError(null);
        let currentTempUrl = null;
        try {
            currentTempUrl = URL.createObjectURL(file);
            setTempImage(currentTempUrl);
            const imageUrl = await uploadImageToCloudinary(file);
            if (imageUrl) {
                await setDoc(doc(db, 'users', user.uid), { profilePicture: imageUrl }, { merge: true });
                onSuccess('Profile picture updated successfully!');
                // Manually update instructorData for immediate UI reflection if not re-fetching parent
                onProfileUpdate({ ...instructorData, profilePicture: imageUrl });
            } else {
                onError('Image upload failed: Could not get a valid URL.');
                setTempImage(null);
            }
        } catch (error) {
            console.error('Profile image upload failed:', error);
            onError('Failed to upload image. Please try again.');
            setTempImage(null);
        } finally {
            setLoadingImage(false);
            if (currentTempUrl) URL.revokeObjectURL(currentTempUrl);
        }
    };

    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setProfileFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitProfileUpdate = async (e) => {
        e.preventDefault();
        onError(null);
        onSuccess(null);
        try {
            await setDoc(doc(db, 'users', user.uid), profileFormData, { merge: true });
            onProfileUpdate(profileFormData); // Notify parent of update
            setEditProfileMode(false);
            onSuccess('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            onError('Failed to update profile. Please try again.');
        }
    };

    return (
        <Card sx={{
            transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.01)' },
            backgroundColor: 'background.paper', boxShadow: 3
        }}>
            <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                    <Box position="relative">
                        <Avatar
                            src={tempImage || instructorData?.profilePicture || ''}
                            sx={{
                                width: 150,
                                height: 150,
                                fontSize: '3rem',
                                mb: 2,
                                border: '2px solid', borderColor: 'primary.main' // Accent border
                            }}
                        >
                            {!instructorData?.profilePicture && !tempImage &&
                                instructorData?.name?.charAt(0)?.toUpperCase()}
                            {!instructorData?.profilePicture && !tempImage && !instructorData?.name &&
                                <AccountCircle sx={{ fontSize: '3rem' }} />} {/* Default icon */}
                        </Avatar>
                        {loadingImage && (
                            <CircularProgress
                                size={48}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-24px',
                                    marginLeft: '-24px',
                                }}
                            />
                        )}
                    </Box>
                    <Input
                        type="file"
                        id="profile-image-upload"
                        onChange={handleProfileImageChange}
                        inputProps={{ accept: 'image/*' }}
                        sx={{ display: 'none' }}
                    />
                    <label htmlFor="profile-image-upload">
                        <Button
                            variant="contained"
                            component="span"
                            disabled={loadingImage}
                            startIcon={<CloudUploadIcon />}
                            color="secondary" // Use secondary color for actions
                        >
                            {loadingImage ? 'Uploading...' : 'Change Profile Picture'}
                        </Button>
                    </label>
                    <Typography variant="caption" display="block" mt={1} color="text.secondary">
                        JPG or PNG, max 2MB
                    </Typography>
                </Box>

                {editProfileMode ? (
                    <form onSubmit={handleSubmitProfileUpdate}>
                        <Grid container spacing={2}>
                            <Grid xs={12}>
                                <TextField
                                    label="Full Name"
                                    name="name"
                                    value={profileFormData.name}
                                    onChange={handleProfileInputChange}
                                    fullWidth
                                    margin="normal"
                                    required
                                />
                            </Grid>
                            <Grid xs={12} md={6}>
                                <TextField
                                    label="Date of Birth"
                                    name="dob"
                                    type="date"
                                    value={profileFormData.dob}
                                    onChange={handleProfileInputChange}
                                    fullWidth
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid xs={12} md={6}>
                                <TextField
                                    label="Mobile Number"
                                    name="mobile"
                                    value={profileFormData.mobile}
                                    onChange={handleProfileInputChange}
                                    fullWidth
                                    margin="normal"
                                />
                            </Grid>
                            <Grid xs={12}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                        name="gender"
                                        value={profileFormData.gender}
                                        onChange={handleProfileInputChange}
                                        label="Gender"
                                    >
                                        <MenuItem value="male">Male</MenuItem>
                                        <MenuItem value="female">Female</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                        <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid xs={12}>
                                <TextField
                                    label="Qualifications"
                                    name="qualifications"
                                    value={profileFormData.qualifications}
                                    onChange={handleProfileInputChange}
                                    fullWidth
                                    margin="normal"
                                    multiline
                                    rows={3}
                                />
                            </Grid>
                            <Grid xs={12}>
                                <TextField
                                    label="Specialization"
                                    name="specialization"
                                    value={profileFormData.specialization}
                                    onChange={handleProfileInputChange}
                                    fullWidth
                                    margin="normal"
                                    helperText="Enter your primary area of expertise"
                                />
                            </Grid>
                            <Grid xs={12}>
                                <TextField
                                    label="Role"
                                    name="role"
                                    value={profileFormData.role}
                                    fullWidth
                                    margin="normal"
                                    disabled
                                />
                            </Grid>
                            <Grid xs={12}>
                                <Box mt={2} display="flex" gap={2}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        startIcon={<SaveIcon />}
                                    >
                                        Save Profile
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setEditProfileMode(false)}
                                        startIcon={<CancelIcon />}
                                        color="error"
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                ) : (
                    <>
                        <Typography variant="h6" gutterBottom color="primary.dark">
                            <AccountCircle sx={{ verticalAlign: 'middle', mr: 1 }} />
                            {instructorData?.name || 'No name provided'}
                        </Typography>
                        <Typography color="text.secondary" gutterBottom sx={{ fontStyle: 'italic' }}>
                            {instructorData?.qualifications || 'No qualifications listed'}
                        </Typography>
                        <Divider sx={{ my: 2, borderColor: 'divider' }} />

                        <Box mb={2}>
                            <Typography color="text.primary">
                                <EmailIcon sx={{ fontSize: 'small', verticalAlign: 'middle', mr: 0.5, color: 'info.main' }} />
                                <strong>Email:</strong> {instructorData?.email || user.email}
                            </Typography>
                            <Typography color="text.primary">
                                <PhoneIcon sx={{ fontSize: 'small', verticalAlign: 'middle', mr: 0.5, color: 'info.main' }} />
                                <strong>Mobile:</strong> {instructorData?.mobile || 'Not provided'}
                            </Typography>
                            <Typography color="text.primary">
                                <TransgenderIcon sx={{ fontSize: 'small', verticalAlign: 'middle', mr: 0.5, color: 'info.main' }} />
                                <strong>Gender:</strong> {instructorData?.gender || 'Not specified'}
                            </Typography>
                            {instructorData?.dob && (
                                <Typography color="text.primary">
                                    <CakeIcon sx={{ fontSize: 'small', verticalAlign: 'middle', mr: 0.5, color: 'info.main' }} />
                                    <strong>Date of Birth:</strong> {instructorData.dob}
                                </Typography>
                            )}
                            {instructorData?.specialization && (
                                <Typography color="text.primary">
                                    <WorkspacesIcon sx={{ fontSize: 'small', verticalAlign: 'middle', mr: 0.5, color: 'info.main' }} />
                                    <strong>Specialization:</strong> {instructorData.specialization}
                                </Typography>
                            )}
                            <Typography color="text.primary">
                                <RoleIcon sx={{ fontSize: 'small', verticalAlign: 'middle', mr: 0.5, color: 'info.main' }} />
                                <strong>Role:</strong> <Typography component="span" color="secondary.main">{instructorData?.role || 'Not specified'}</Typography>
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            onClick={() => setEditProfileMode(true)}
                            fullWidth
                            startIcon={<EditIcon />}
                            color="primary"
                        >
                            Edit Profile
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default InstructorProfile;