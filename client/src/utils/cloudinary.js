// src/utils/cloudinary.js
export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'edusource_preset'); // Make sure this matches your Cloudinary preset
  formData.append('cloud_name', 'dh8gcylzx'); // Your cloud name

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dh8gcylzx/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    console.log('Upload successful:', data); // Debug log
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};