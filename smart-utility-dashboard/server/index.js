import express from 'express';
import cors from 'cors';
import translate from 'translate';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

translate.engine = 'google';
translate.key = null;

app.post('/api/summarize', async (req, res) => {
  const { text, tone, language } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ result: 'Text input is required for summarization.' });
  }

  try {
    const response = await axios.post('https://api.cohere.ai/v1/chat', {
      message: `Summarize this text in a ${tone} tone:\n\n${text}`,
      model: 'command-r-plus',
      temperature: 0.3,
    }, {
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    let summary = response.data.text || response.data.reply;
    const translatedSummary = await translate(summary, { to: language });

    res.json({ result: translatedSummary });
  } catch (err) {
    console.error('Summarization error:', err.message);
    res.status(500).json({ result: 'Summarization failed.' });
  }
});

app.post('/api/translate', async (req, res) => {
  const { text } = req.body;

  try {
    const result = await translate(text, { to: 'hi' });
    res.json({ result });
  } catch (err) {
    console.error('Translation Error:', err.message);
    res.status(500).json({ result: 'Translation failed.' });
  }
});

app.post('/api/generate-email', async (req, res) => {
  const { text, language = 'English', tone = 'formal' } = req.body;

  const prompt = `Write an email in ${language} with a ${tone} tone. Here's the input:\n"${text}"`;

  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        message: prompt,
        model: 'command-r-plus',
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const email = response.data.text;
    res.json({ result: email });
  } catch (err) {
    console.error('Cohere email generation error:', err.response?.data || err.message);
    res.status(500).json({ result: 'Email generation failed using Cohere.' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
