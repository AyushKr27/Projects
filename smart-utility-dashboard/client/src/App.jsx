import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('english');
  const [tone, setTone] = useState('formal');
  const [darkMode, setDarkMode] = useState(false);

  const handleAction = async (action) => {
    try {
      const payload = { text: inputText };

      if (action === 'generate-email' || action === 'summarize') {
        payload.language = language;
        payload.tone = tone;
      }

      const response = await axios.post(`/api/${action}`, payload);
      setOutput(response.data.result);
    } catch (error) {
      console.error(error);
      setOutput('An error occurred.');
    }
  };

  return (
    <div className={`app-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <div className="container">
        <div className="header">
          <h1>🚀 Smart Utility Tool Dashboard</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="dark-mode-toggle"
          >
            {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        <textarea
          rows="6"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="💡 Enter your text here..."
          className="textarea"
        />

        <div className="controls">
          <div className="select-group">
            <label>🌐 Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
            </select>
          </div>

          <div className="select-group">
            <label>🎯 Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="formal">Formal</option>
              <option value="informal">Informal</option>
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
            </select>
          </div>
        </div>

        <div className="button-container">
          <button onClick={() => handleAction('summarize')}>✍️ Summarize</button>
          <button onClick={() => handleAction('translate')}>🌍 Translate</button>
          <button onClick={() => handleAction('generate-email')}>📧 Generate Email</button>
        </div>

        <div className="output-box">
          <h3>📝 Output:</h3>
          <pre>{output}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;
