import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";
import Upload from "./pages/UploadPage/Upload";
import Login from "./pages/AuthPages/Login";
import Signup from "./pages/AuthPages/Signup";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import NotFound from './pages/NotFound.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from "react-hot-toast";
import QuizPage from "./pages/QuizPages/QuizPage.jsx";
import CreateQuiz from "./pages/QuizPages/CreateQuiz.jsx";
import QuizResult from "./pages/QuizPages/QuizResult.jsx";
import CreatePoll from "./pages/PollPage/CreatePoll.jsx";
import PollPage from "./pages/PollPage/PollPage.jsx";
import PollResult from "./pages/PollPage/PollResult.jsx";
import Dashboard from "./pages/Dashboard.jsx"
import SummaryPage from "./pages/SummaryPage.jsx";
import ChatListPage from "./pages/ChatPages/ChatListPage";
import ChatSessionPage from "./pages/ChatPages/ChatSessionPage.jsx";
import Leaderboard from "./pages/QuizPages/Leaderboard.jsx";
import LiveQnAHost from "./pages/Live-QnA/LiveQnAHost.jsx";
import LiveQnAStudent from "./pages/Live-QnA/LiveQnAStudent.jsx";
import  CreateLiveQnA from "./pages/Live-QnA/CreateLiveQnA.jsx";

function Layout({ children }) {
  const location = useLocation();
  const hideLayout = location.pathname === "/chat" || location.pathname.startsWith("/chat/") || location.pathname.startsWith("/quiz/");
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!hideLayout && <Navbar />}
      <Toaster position="top-center" />
      <main className="flex-grow">{children}</main>
      {!hideLayout && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/Summary" element={<SummaryPage />} />
            <Route path="/chat" element={<ChatListPage />} />
            <Route path="/chat/:id" element={<ChatSessionPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/create/quiz" element={ <CreateQuiz /> } />
            <Route path="/create/poll" element={ <CreatePoll /> } />
            <Route path="/create/live-qna" element={ <CreateLiveQnA /> } />
            <Route path="/quiz/:code" element={<QuizPage />} />
            <Route path="/results/quiz/:code" element={ <QuizResult /> } />
            <Route path="/poll/:code" element={ <PollPage /> } />
            <Route path="/results/poll/:code" element={ <PollResult /> } />
            <Route path="/leaderboard/:code" element={<Leaderboard />} />
            <Route path="/live-qna/:sessionCode" element={<LiveQnAHost />} />
            <Route path="/join-qna/:sessionCode" element={<LiveQnAStudent />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
