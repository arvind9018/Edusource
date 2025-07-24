// src/utils/paymentHelper.js
import { doc, updateDoc, arrayUnion, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; // Assuming correct path to db instance

/**
 * Enrolls a user in a FREE course.
 * This directly updates Firestore on the client-side.
 *
 * @param {string} userId - The UID of the current user.
 * @param {string} courseId - The ID of the course being enrolled in.
 * @param {string} courseTitle - The title of the course.
 */
export const enrollFreeCourse = async (userId, courseId, courseTitle) => {
    if (!userId || !courseId || !courseTitle) {
        throw new Error('Missing required enrollment details for free course: userId, courseId, courseTitle.');
    }

    const courseDocRef = doc(db, 'courses', courseId);

    try {
        // 1. Update the course document with the enrolled user's UID
        // Use arrayUnion to atomically add the user ID to the enrolledUsers array
        await updateDoc(courseDocRef, {
            enrolledUsers: arrayUnion(userId)
        });

        // 2. Create a separate enrollment record for auditing
        await addDoc(collection(db, 'enrollments'), {
            userId: userId,
            courseId: courseId,
            courseTitle: courseTitle,
            enrollmentType: 'Free',
            enrolledAt: serverTimestamp(), // Use serverTimestamp for consistent timestamps
            status: 'completed', // Status for free enrollment
        });

        console.log(`User ${userId} successfully enrolled in FREE course ${courseId}.`);
    } catch (error) {
        console.error("Error enrolling in free course:", error);
        throw new Error(`Failed to enroll in free course: ${error.message}`);
    }
};

// This function will NO LONGER BE USED in this revised architecture.
// Its logic is now directly handled by the new external backend.
// You can remove this function entirely if you wish, or keep it commented out.
/*
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

export const verifyAndEnrollPaidCourse = async (paymentDetails) => {
    const verifyEnrollCallable = httpsCallable(functions, 'verifyRazorpayPaymentAndEnroll');

    try {
        const result = await verifyEnrollCallable(paymentDetails);
        console.log('Verification & Enrollment Cloud Function response:', result.data);
        return result.data;
    } catch (error) {
        console.error("Error calling verifyAndEnrollPaidCourse Cloud Function:", error);
        throw error;
    }
};
*/