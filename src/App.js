import React, { useEffect, useState } from "react"; // Import necessary React hooks
import { links } from "./data/LinksData"; // Import the links data for the LinkTree
import profileImage from './img/Designer (9).jpeg'; // Import the profile image

// Cursor Trail Component
const CursorTrail = ({ points }) => {
  return (
    <>
      {points.map((point, index) => (
        <div
          key={index}
          className="cursor-trail"
          style={{
            left: `${point.x}px`,
            top: `${point.y}px`,
            opacity: 1 - index / points.length,
          }}
        />
      ))}
    </>
  );
};

// LinkTree Component
const LinkTree = () => {
  const [points, setPoints] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const newPoint = { x: event.clientX, y: event.clientY };
      setPoints((prevPoints) => {
        const updatedPoints = [...prevPoints, newPoint];
        return updatedPoints.length > 20 ? updatedPoints.slice(1) : updatedPoints;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateInput = () => {
    const { name, email, subject, message } = formData;
    const namePattern = /^[A-Za-z\s]+$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!namePattern.test(name)) {
      setResponseMessage('Name should contain only letters and spaces.');
      return false;
    }
    if (!emailPattern.test(email)) {
      setResponseMessage('Please enter a valid email address.');
      return false;
    }
    if (subject.trim() === '') {
      setResponseMessage('Subject cannot be empty.');
      return false;
    }
    if (message.trim() === '') {
      setResponseMessage('Message cannot be empty.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage('');

    if (!validateInput()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/sendEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // Ensure this header is set
        },
        body: JSON.stringify({
            name: 'Your Name',
            email: 'your_email@example.com',
            subject: 'Your Subject',
            message: 'Your Message',
        }),
    });
    

      const result = await response.json();
      if (response.ok) {
        setIsSuccess(true);
        setResponseMessage('Message sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setIsSuccess(false);
        setResponseMessage(result.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setIsSuccess(false);
      setResponseMessage('Network error: Please try again later.');
    } finally {
      setLoading(false);
    }

    // Dismiss success message after 3 seconds
    if (isSuccess) {
      setTimeout(() => {
        setResponseMessage('');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-5 relative">
      <CursorTrail points={points} />
      <div className="hero text-center mb-8">
        <img src={profileImage} alt="profile" className="w-24 h-24 rounded-full mx-auto border-4 border-white" />
        <h1 className="text-3xl font-bold mt-4">Coretta K. Dawani</h1>
        
        {/* Quote without Background */}
        <p className="quote-text text-lg italic text-gray-200 font-medium mt-4">
          "From every ruin, life springs anew. And from the ashes of destruction, a phoenix will rise."
        </p>
        <p className="quote-author text-right text-sm text-gray-400">- Sherrilyn Kenyon</p>
      </div>

      <div className="w-full max-w-md">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-btn" // Use the new link-btn class
          >
            <span className="mr-3" style={{ color: link.iconColor }}>{link.icon}</span>
            {link.title}
          </a>
        ))}
      </div>

      <div className="w-full max-w-md mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Me</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 mb-1">Your Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your name"
              className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${responseMessage.includes('Name') ? 'border-red-500' : 'border-gray-300'}`}
              style={{ color: 'black' }}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">Your Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${responseMessage.includes('valid email') ? 'border-red-500' : 'border-gray-300'}`}
              style={{ color: 'black' }}
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-gray-700 mb-1">Subject:</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="Enter the subject"
              className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${responseMessage.includes('empty') ? 'border-red-500' : 'border-gray-300'}`}
              style={{ color: 'black' }}
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-gray-700 mb-1">Your Message:</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Write your message here"
              className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${responseMessage.includes('empty') ? 'border-red-500' : 'border-gray-300'}`}
              style={{ color: 'black' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white font-semibold rounded-md hover:opacity-90 transition duration-300"
            style={{ background: 'linear-gradient(45deg, #171817, #842DD5)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Sending...
              </span>
            ) : 'Send Message'}
          </button>
        </form>
        {responseMessage && (
          <p
            className={`mt-2 font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}
            aria-live="polite"
          >
            {responseMessage}
          </p>
        )}
      </div> 

      <footer className="text-xs mt-8">
        <p className="mt-2">&copy;CorettaDawani {new Date().getFullYear()}. Designed by <a href="mailto:ckd263@yahoo.com" className="underline">CKD263</a>. All rights reserved.</p>
      </footer>
    </div>
  );
};

// App Component
const App = () => {
  return <LinkTree />;
};

export default App;
