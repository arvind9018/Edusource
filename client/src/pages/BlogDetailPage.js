import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure this path is correct
import { FaUser, FaCalendarAlt } from 'react-icons/fa';

// Reusable component for loading spinner
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-white dark:bg-slate-900">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
  </div>
);

// Reusable component for error messages
const ErrorDisplay = ({ message }) => (
  <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-slate-900 text-center px-4">
    <h2 className="text-2xl font-semibold text-red-500">An Error Occurred</h2>
    <p className="text-slate-600 dark:text-slate-400 mt-2">{message}</p>
  </div>
);


const BlogDetailPage = () => {
  const { blogId } = useParams(); // Gets the blog ID from the URL (e.g., /blogs/xyz)
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch a single blog post from Firestore
    const fetchBlog = async () => {
      if (!blogId) {
        setError("No blog ID provided.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const docRef = doc(db, 'blogs', blogId); // Create a reference to the specific blog document
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // If the document exists, set it in state
          setBlog({ id: docSnap.id, ...docSnap.data() });
        } else {
          // If no document is found, set an error
          setError("Sorry, we couldn't find that blog post.");
        }
      } catch (err) {
        console.error("Error fetching blog post:", err);
        setError("There was a problem loading the content. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]); // Re-run this effect if the blogId changes

  // Helper function to format the date
  const formatDate = (isoString) => {
    if (!isoString) return 'Date not available';
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200">
      <main className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        {blog && (
          <article>
            {/* Header section with title and metadata */}
            <header className="mb-8 text-center border-b border-slate-200 dark:border-slate-700 pb-8">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
                {blog.title}
              </h1>
              <div className="flex justify-center items-center space-x-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-2">
                  <FaUser />
                  <span>{blog.authorName || 'Anonymous'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt />
                  <time dateTime={blog.createdAt}>{formatDate(blog.createdAt)}</time>
                </div>
              </div>
            </header>

            {/* Banner Image */}
            {blog.imageUrl && (
              <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-auto max-h-[500px] object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }} // Hide image on error
                />
              </div>
            )}

            {/* Main Content */}
            <div 
              className="prose prose-lg dark:prose-invert max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-indigo-600 dark:prose-a:text-indigo-400"
              // Using whitespace-pre-wrap to respect newlines from the database
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {blog.content}
            </div>

            {/* Back Button */}
            <div className="mt-12 text-center">
                <button
                    onClick={() => navigate('/blogs')}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 transition-colors"
                >
                    ← Back to All Blogs
                </button>
            </div>
          </article>
        )}
      </main>
    </div>
  );
};

export default BlogDetailPage;
