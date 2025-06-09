# 🚀 Smart Utility Tool Dashboard

A robust, full-stack AI-powered utility dashboard leveraging **React** for the frontend and **Express.js** for the backend. This application offers advanced text summarization, seamless language translation, and automated email generation, all powered by **Cohere's NLP API**. The intuitive user interface features a modern dark mode for an enhanced user experience.

---

## 📸 Key Features

- ✍️ **Text Summarization**: Generate concise and context-aware summaries with customizable tone options.
- 🌍 **Language Translation**: Instantly translate text across multiple languages with high accuracy.
- 📧 **Email Generation**: Compose professional emails tailored to your preferred tone and language.
- 🌙 **Dark Mode Support**: Effortlessly switch between dark and light themes for optimal readability.

---

## 📦 Technology Stack

| Frontend      | Backend     | API Integrations                |
|---------------|-------------|---------------------------------|
| React         | Express.js  | Cohere (NLP)                    |
| Axios         | Node.js     | Google Translate (`translate`)  |

---

## ⚙️ Setup Instructions

1. **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/smart-utility-dashboard.git
    cd smart-utility-dashboard
    ```

2. **Install dependencies for both frontend and backend:**
    ```bash
    cd client
    npm install
    cd ../server
    npm install
    ```

3. **Set up environment variables:**  
    Create a `.env` file in the `server` directory and add your API keys (see `.env.example` if available).

4. **Run the application:**
    - Start the backend:
      ```bash
      cd server
      npm start
      ```
    - Start the frontend (in a new terminal):
      ```bash
      cd client
      npm start
      ```

5. **Access the dashboard:**  
    Hold the CTRL key and click on the localhost link generated in your terminal after running the frontend.
---
