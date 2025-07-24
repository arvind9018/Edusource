import React, { useState, useEffect, useRef } from 'react';

// Main App component
const App = () => {
    // State to control the visibility of the chatbox
    const [isOpen, setIsOpen] = useState(false);
    // State to store chat messages
    const [messages, setMessages] = useState([]);
    // State to store the current input message
    const [inputMessage, setInputMessage] = useState('');
    // State for loading indicator during API calls
    const [isLoading, setIsLoading] = useState(false);

    // Ref for scrolling to the latest message
    const messagesEndRef = useRef(null);

    // API configuration - Reading from environment variables
    // IMPORTANT: Ensure you have a .env file in your React project root with:
    // REACT_APP_CHAT_PROXY_URL=http://localhost:3001/chat
    const CHAT_PROXY_URL = process.env.REACT_APP_CHAT_PROXY_URL || 'https://edusource-backend-production-5382.up.railway.app/';

    // Scrolls to the bottom of the messages container whenever messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Function to send a message to the chatbot API
    const sendMessage = async () => {
        if (inputMessage.trim() === '') return;

        const newUserMessage = { sender: 'user', text: inputMessage };
        // Add user message to the chat
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        setInputMessage(''); // Clear input field

        setIsLoading(true); // Show loading indicator

        try {
            // Prepare chat history for the API request
            const chatHistory = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
            // Add the new user message to the history for the current API call
            chatHistory.push({ role: "user", parts: [{ text: inputMessage }] });

            // Send the chat history to your Node.js proxy
            const response = await fetch(CHAT_PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: chatHistory }) // Send the messages array
            });

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const botResponseText = result.candidates[0].content.parts[0].text;
                const newBotMessage = { sender: 'bot', text: botResponseText };
                // Add bot response to the chat
                setMessages(prevMessages => [...prevMessages, newBotMessage]);
            } else {
                setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: "Sorry, I couldn't get a response. Please try again." }]);
                console.error("Unexpected API response structure:", result);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: "An error occurred while connecting to the chatbot." }]);
        } finally {
            setIsLoading(false); // Hide loading indicator
        }
    };

    // Handle Enter key press in the input field
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className="font-inter antialiased">
            {/* Chatbot Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-gradient-to-br from-blue-600 to-purple-700 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 ease-in-out z-50 transform hover:scale-110 active:scale-95"
                aria-label={isOpen ? "Close Chat" : "Open Chat"}
            >
                {/* Chat icon - Using a more modern, slightly bolder SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </button>

            {/* Chatbox Container */}
            <div
                className={`fixed bottom-20 right-6 w-80 md:w-96 h-[480px] bg-white rounded-xl shadow-2xl flex flex-col transition-all duration-500 ease-in-out z-40 overflow-hidden
                ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90 pointer-events-none'}`}
                style={{ transformOrigin: 'bottom right' }}
            >
                {/* Chatbox Header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-t-xl shadow-lg">
                    <h3 className="text-xl font-extrabold tracking-wide">EduSource AI</h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-white hover:text-blue-100 focus:outline-none transition-colors duration-200"
                        aria-label="Close Chatbox"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages Display Area */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar bg-gray-50">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 mt-10 p-4 bg-white rounded-lg shadow-inner border border-gray-100">
                            <p className="text-base leading-relaxed text-gray-700">Hello! I'm your EduSource AI assistant. How can I help you learn today?</p>
                            <p className="text-sm mt-2 text-gray-500">Try asking me about courses, admissions, or anything related to education!</p>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                        >
                            <div className={`max-w-[80%] p-3 rounded-xl shadow-md text-sm leading-relaxed transition-all duration-300 ease-in-out transform
                                ${msg.sender === 'user'
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                }`}>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] p-3 rounded-xl shadow-md bg-gray-200 text-gray-800 rounded-bl-none">
                                <div className="flex items-center">
                                    <span className="animate-pulse text-sm font-medium">EduSource AI is typing...</span>
                                    <svg className="animate-spin ml-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} /> {/* Scroll target */}
                </div>

                {/* Message Input Area */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="flex rounded-full overflow-hidden border-2 border-gray-200 focus-within:border-blue-500 transition-colors duration-200">
                        <input
                            type="text"
                            className="flex-1 p-3 text-gray-800 focus:outline-none placeholder-gray-400 text-base"
                            placeholder="Ask me anything about EduSource..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3 px-5 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                            disabled={isLoading || inputMessage.trim() === ''}
                            aria-label="Send Message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            {/* Tailwind CSS CDN for styling */}
            <script src="https://cdn.tailwindcss.com"></script>
            {/* Custom scrollbar and keyframe styles */}
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                .font-inter {
                    font-family: 'Inter', sans-serif;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #e0e0e0; /* Lighter track */
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #a0a0a0; /* Darker thumb */
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #707070; /* Even darker on hover */
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                `}
            </style>
        </div>
    );
};

export default App;
