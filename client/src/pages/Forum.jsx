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
    // Use `en-GB` or a suitable locale for better mobile display of date/time
    return date.toLocaleString('en-GB', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 py-4 px-2 sm:py-8 sm:px-4"> {/* Adjusted padding for smaller screens */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 bg-blue-600 text-white"> {/* Adjusted padding */}
          <h1 className="text-2xl sm:text-3xl font-bold">Community Forum</h1> {/* Adjusted font size */}
          <p className="mt-1 text-sm sm:mt-2 sm:text-base">Ask questions, share knowledge, and engage with the community</p> {/* Adjusted font size and margin */}
        </div>

        {!isLoggedIn && (
          <div className="p-4 sm:p-6 bg-yellow-50 border-l-4 border-yellow-400"> {/* Adjusted padding */}
            <p className="text-yellow-700 text-sm sm:text-base"> {/* Adjusted font size */}
              You need to <span 
                className="text-blue-600 cursor-pointer hover:underline font-medium"
                onClick={() => navigate("/login")}
              >
                log in
              </span> to post questions or reply to existing ones.
            </p>
          </div>
        )}

        <div className="p-4 sm:p-6"> {/* Adjusted padding */}
          {isLoggedIn && (
            <form onSubmit={handleSubmitPost} className="mb-6 sm:mb-8"> {/* Adjusted margin */}
              <div className="mb-3 sm:mb-4"> {/* Adjusted margin */}
                <label htmlFor="newPost" className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base"> {/* Adjusted font size and margin */}
                  {userRole === "teacher" ? "Post a discussion topic" : "Ask a question"}
                </label>
                <textarea
                  id="newPost"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" /* Adjusted padding and font size */
                  rows={4}
                  placeholder={userRole === "teacher" ? "Start a discussion..." : "What's your doubt?"}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isPosting}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm sm:text-base ${ /* Adjusted padding and font size */
                  isPosting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isPosting ? 'Posting...' : 'Post'}
              </button>
            </form>
          )}

          <div className="space-y-4 sm:space-y-6"> {/* Adjusted spacing */}
            {posts.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base"> {/* Adjusted padding and font size */}
                No posts yet. Be the first to start a discussion!
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 border-b"> {/* Adjusted padding */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between"> {/* Changed to flex-col on mobile, flex-row on sm+ */}
                      <div className="mb-1 sm:mb-0"> {/* Added margin for stacking */}
                        <span className="font-semibold text-sm sm:text-base">{post.author}</span> {/* Adjusted font size */}
                        <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full"> {/* Adjusted padding */}
                          {post.role}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 sm:text-sm"> {/* Adjusted font size */}
                        {formatDate(post.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6"> {/* Adjusted padding */}
                    <p className="text-gray-800 whitespace-pre-wrap text-sm sm:text-base break-words"> {/* Adjusted font size, added break-words */}
                      {post.content}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 border-t"> {/* Adjusted padding */}
                    <h3 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Replies ({post.replies?.length || 0})</h3> {/* Adjusted font size and margin */}
                    
                    {post.replies?.map((reply, index) => (
                      <div key={index} className="mb-3 pb-3 border-b last:border-b-0"> {/* Adjusted margin and padding */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 sm:mb-2"> {/* Changed to flex-col on mobile, flex-row on sm+ */}
                          <div className="mb-1 sm:mb-0"> {/* Added margin for stacking */}
                            <span className="font-semibold text-xs sm:text-sm">{reply.author}</span> {/* Adjusted font size */}
                            <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full"> {/* Adjusted padding */}
                              {reply.role}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500"> {/* Adjusted font size */}
                            {formatDate(reply.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-700 pl-4 text-sm whitespace-pre-wrap break-words">{reply.content}</p> {/* Adjusted font size, added break-words */}
                      </div>
                    ))}
                    
                    {isLoggedIn && (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleReply(post.id);
                        }}
                        className="mt-3 sm:mt-4" 
                      >
                        <div className="flex flex-col sm:flex-row gap-2"> {/* Changed to flex-col on mobile, flex-row on sm+ */}
                          <input
                            type="text"
                            value={replyInputs[post.id] || ""}
                            onChange={(e) => setReplyInputs(prev => ({
                              ...prev, 
                              [post.id]: e.target.value
                            }))}
                            placeholder="Type your reply..."
                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" /* Adjusted padding and font size */
                            required
                          />
                          <button
                            type="submit"
                            disabled={isReplying}
                            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm sm:text-base ${ /* Adjusted padding and font size */
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
