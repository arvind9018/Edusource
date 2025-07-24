import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase'; // Make sure this path is correct

// A reusable component for the page header/banner
const PageBanner = ({ title, subtitle }) => (
  <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-12 px-4 text-center">
    <h1 className="text-4xl font-bold mb-2">{title}</h1>
    <p className="text-lg text-slate-300">{subtitle}</p>
  </div>
);

// A reusable component for an individual blog card
const BlogCard = ({ blog }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/blogs/${blog.id}`)}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group h-full flex flex-col cursor-pointer"
    >
      {/* Blog Image */}
      <div className="relative overflow-hidden h-48 flex-shrink-0">
        <img
          src={blog.imageUrl || `https://source.unsplash.com/400x300/?${blog.title}`}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x300/e2e8f0/475569?text=Image+Not+Found'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>
      
      {/* Blog Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-bold text-xl mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {blog.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-grow">
          {/* Create a short snippet of the content */}
          {blog.content?.substring(0, 120) || 'No content preview available.'}...
        </p>
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
           <p className="text-xs text-gray-500 dark:text-gray-400">
            By {blog.authorName || 'Anonymous'}
          </p>
          <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Read More →
          </span>
        </div>
      </div>
    </div>
  );
};


const AllBlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        // Query to get all documents from the 'blogs' collection, ordered by creation date
        const blogsQuery = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(blogsQuery);
        
        const fetchedBlogs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setBlogs(fetchedBlogs);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blog posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []); // The empty dependency array ensures this effect runs only once on mount

  // Display a loading spinner while fetching data
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-slate-900">
        {/* Simple spinner using Tailwind CSS */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
      </div>
    );
  }

  // Display an error message if fetching fails
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-slate-900 text-red-500 px-4 text-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <PageBanner 
        title="The Edusource Blog"
        subtitle="Insights, tutorials, and updates from our expert instructors."
      />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {blogs.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">No Blog Posts Yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Check back later for new articles!</p>
          </div>
        ) : (
          // Responsive grid for the blog cards
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllBlogsPage;
