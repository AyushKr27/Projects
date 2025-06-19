import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import io from 'socket.io-client';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './AdminDashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ✅ Use dynamic backend URL for socket connection
const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''));

const AdminDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({ total: 0, average: 0 });
  const [sortBy, setSortBy] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const feedbacksPerPage = 5;

  const token = localStorage.getItem('token');

  const fetchFeedbacks = async () => {
    try {
      const res = await API.get('/feedback', {
        params: { sortBy, filterRating },
      });
      setFeedbacks(res.data);
    } catch (err) {
      console.error('Failed to fetch feedbacks:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/feedback/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
    socket.on('new-feedback', () => {
      fetchFeedbacks();
      fetchStats();
    });
    return () => socket.off('new-feedback');
  }, [sortBy, filterRating]);

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/admin/login';
  };

  const exportCSV = () => {
    const csvRows = [
      ['Name', 'Email', 'Rating', 'Feedback', 'Date'],
      ...feedbacks.map(f =>
        [f.name, f.email, f.rating, `"${f.feedback}"`, new Date(f.createdAt).toLocaleString()]
      ),
    ];
    const blob = new Blob([csvRows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feedbacks.csv';
    a.click();
  };

  const deleteAllFeedbacks = async () => {
    if (!window.confirm('Are you sure you want to delete all feedbacks?')) return;
    try {
      await API.delete('/feedback');
      fetchFeedbacks();
      fetchStats();
    } catch (err) {
      console.error('Failed to delete feedbacks:', err);
    }
  };

  const indexOfLast = currentPage * feedbacksPerPage;
  const indexOfFirst = indexOfLast - feedbacksPerPage;
  const currentFeedbacks = feedbacks.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(feedbacks.length / feedbacksPerPage);

  const ratingCounts = [1, 2, 3, 4, 5].map(
    rating => feedbacks.filter(f => f.rating === rating).length
  );

  const chartData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Number of Feedbacks',
        data: ratingCounts,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Feedback Rating Distribution' },
    },
  };

  return (
    <div className="admin-dashboard">
      <div className="header">
        <h2>Admin Dashboard</h2>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      <div className="dashboard-controls">
        <div>
          <label>Sort By: </label>
          <select onChange={e => setSortBy(e.target.value)} value={sortBy}>
            <option value="">None</option>
            <option value="rating">Rating</option>
            <option value="date">Date</option>
          </select>
        </div>

        <div>
          <label>Filter Rating: </label>
          <select onChange={e => setFilterRating(e.target.value)} value={filterRating}>
            <option value="">All</option>
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <button className="export-btn" onClick={exportCSV}>Export CSV</button>
      </div>

      <div className="dashboard-stats">
        <strong>Total Feedbacks:</strong> {stats.total} <br />
        <strong>Average Rating:</strong> {stats.average}
      </div>

      <div className="chart-container">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="delete-all-container">
        <button className="delete-all-btn" onClick={deleteAllFeedbacks}>Delete All Feedbacks</button>
      </div>

      <ul className="feedback-list">
        {currentFeedbacks.map((f, i) => (
          <li className="feedback-card" key={i}>
            <strong>{f.name}</strong> ({f.email}) <br />
            Rating: {f.rating} <br />
            Feedback: {f.feedback} <br />
            <small>{new Date(f.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>

      <div className="pagination">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={currentPage === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
