import React from 'react';

const FeedbackList = ({ feedbacks }) => {
  return (
    <div>
      <h3>All Feedbacks</h3>
      <ul>
        {feedbacks.map((fb, index) => (
          <li key={index}>
            <strong>{fb.name}</strong> ({fb.email}) - {fb.rating}⭐
            <p>{fb.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeedbackList;
