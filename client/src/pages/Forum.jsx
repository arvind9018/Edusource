import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  getDoc,
  updateDoc 
} from "firebase/firestore";
import { db } from "../firebase";

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const [isPosting, setIsPosting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedInStatus);
    
    if (loggedInStatus) {
      setUserEmail(localStorage.getItem("userEmail") || "");
      setUserRole(localStorage.getItem("role") || "student");
    }

    const q = query(collection(db, "forumPosts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setIsPosting(true);
    try {
      await addDoc(collection(db, "forumPosts"), {
        content: newPost,
        author: userEmail,
        role: userRole,
        timestamp: new Date().toISOString(),
        replies: []
      });
      setNewPost("");
    } catch (error) {
      console.error("Error adding post: ", error);
      alert("Failed to create post: " + error.message);
    } finally {
      setIsPosting(false);
    }
  };

  const handleReply = async (postId) => {
    const replyContent = replyInputs[postId];
    if (!replyContent?.trim()) return;

    setIsReplying(true);
    try {
      const postRef = doc(db, "forumPosts", postId);
      const postSnap = await getDoc(postRef);
      
      if (postSnap.exists()) {
        const postData = postSnap.data();
        const updatedReplies = [
          ...(postData.replies || []),
          {
            content: replyContent,
            author: userEmail,
            role: userRole,
            timestamp: new Date().toISOString()
          }
        ];
        
        await updateDoc(postRef, { replies: updatedReplies });
        setReplyInputs(prev => ({...prev, [postId]: ""}));
      }
    } catch (error) {
      console.error("Error adding reply: ", error);
      alert("Failed to add reply: " + error.message);
    } finally {
      setIsReplying(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-blue-600 text-white">
          <h1 className="text-3xl font-bold">Community Forum</h1>
          <p className="mt-2">Ask questions, share knowledge, and engage with the community</p>
        </div>

        {!isLoggedIn && (
          <div className="p-6 bg-yellow-50 border-l-4 border-yellow-400">
            <p className="text-yellow-700">
              You need to <span 
                className="text-blue-600 cursor-pointer hover:underline font-medium"
                onClick={() => navigate("/login")}
              >
                log in
              </span> to post questions or reply to existing ones.
            </p>
          </div>
        )}

        <div className="p-6">
          {isLoggedIn && (
            <form onSubmit={handleSubmitPost} className="mb-8">
              <div className="mb-4">
                <label htmlFor="newPost" className="block text-gray-700 font-medium mb-2">
                  {userRole === "teacher" ? "Post a discussion topic" : "Ask a question"}
                </label>
                <textarea
                  id="newPost"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder={userRole === "teacher" ? "Start a discussion..." : "What's your doubt?"}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isPosting}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition ${
                  isPosting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isPosting ? 'Posting...' : 'Post'}
              </button>
            </form>
          )}

          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No posts yet. Be the first to start a discussion!
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold">{post.author}</span>
                        <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {post.role}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(post.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-4 border-t">
                    <h3 className="font-medium text-gray-700 mb-3">Replies ({post.replies?.length || 0})</h3>
                    
                    {post.replies?.map((reply, index) => (
                      <div key={index} className="mb-4 pb-4 border-b last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold">{reply.author}</span>
                            <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              {reply.role}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(reply.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-700 pl-4 whitespace-pre-wrap">{reply.content}</p>
                      </div>
                    ))}
                    
                    {isLoggedIn && (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleReply(post.id);
                        }}
                        className="mt-4"
                      >
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyInputs[post.id] || ""}
                            onChange={(e) => setReplyInputs(prev => ({
                              ...prev, 
                              [post.id]: e.target.value
                            }))}
                            placeholder="Type your reply..."
                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <button
                            type="submit"
                            disabled={isReplying}
                            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition ${
                              isReplying ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {isReplying ? 'Replying...' : 'Reply'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;
