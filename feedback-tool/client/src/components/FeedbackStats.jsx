import React from 'react';

const FeedbackStats = ({ feedbacks }) => {
  const total = feedbacks.length;
  const avg = (
    feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / total || 0
  ).toFixed(1);

  return (
    <div>
      <h3>Stats</h3>
      <p>Total Feedbacks: {total}</p>
      <p>Average Rating: {avg} ⭐</p>
    </div>
  );
};

export default FeedbackStats;
