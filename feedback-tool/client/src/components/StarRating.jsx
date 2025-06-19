import React, { useState } from 'react';

const StarRating = ({ rating, setRating }) => {
  const handleClick = (index) => setRating(index + 1);

  return (
    <div>
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          style={{ fontSize: '2rem', cursor: 'pointer', color: i < rating ? 'gold' : 'gray' }}
          onClick={() => handleClick(i)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
