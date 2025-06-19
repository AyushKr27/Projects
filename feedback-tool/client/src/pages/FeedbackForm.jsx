import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FeedbackForm.css';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: '',
    rating: 0,
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRating = (value) => {
    setFormData({ ...formData, rating: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, feedback, rating } = formData;

    if (!name || !email || !feedback || rating === 0) {
      setError('All fields are required including rating.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/feedback', formData);
      setSubmitted(true);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to submit feedback. Try again.');
    }
  };

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: '',
          email: '',
          feedback: '',
          rating: 0,
        });
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted, navigate]);

  if (submitted) {
    return <h3 className="thank-you">🎉 Thank you for your feedback!</h3>;
  }

  return (
    <div className="feedback-wrapper">
      <button className="admin-btn" onClick={() => navigate('/admin/login')}>
        Admin Login
      </button>

      <div className="feedback-card">
        <h2>Submit Feedback</h2>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} />

          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />

          <label>Feedback:</label>
          <textarea name="feedback" rows="4" value={formData.feedback} onChange={handleChange} />

          <label>Rating:</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= formData.rating ? 'star filled' : 'star'}
                onClick={() => handleRating(star)}
              >
                ★
              </span>
            ))}
          </div>

          <button type="submit" className="submit-btn">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
