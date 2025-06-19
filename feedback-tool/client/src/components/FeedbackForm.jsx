import React, { useState } from 'react';
import axios from 'axios';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: '',
    rating: 0,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRating = (star) => {
    setFormData(prev => ({ ...prev, rating: star }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.feedback || !formData.rating) {
      alert('All fields are required');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/feedback', formData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Submission failed.');
    }
  };

  if (submitted) {
    return <h2>Thank you for your feedback!</h2>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>Submit Feedback</h2>
      <input
        type="text"
        name="name"
        placeholder="Your Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <br />
      <input
        type="email"
        name="email"
        placeholder="Your Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <br />
      <textarea
        name="feedback"
        placeholder="Your Feedback"
        rows={4}
        value={formData.feedback}
        onChange={handleChange}
        required
      />
      <br />
      <div>
        <strong>Rating:</strong>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRating(star)}
            style={{
              color: formData.rating >= star ? 'gold' : 'gray',
              fontSize: '1.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer'
            }}
          >
            ★
          </button>
        ))}
      </div>
      <br />
      <button type="submit">Submit</button>
    </form>
  );
};

export default FeedbackForm;
