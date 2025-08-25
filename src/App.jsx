import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import StudyLandingPage from "./page/auth/StudyLandingPage";
import LoginPage from "./page/auth/Login";
import SignUpPage from "./page/auth/SignUpPage";
import ForgetPassword from "./page/auth/ForgetPassword";
import EmailVerification from "./page/auth/EmailVerification";
import ResetPassword from "./page/auth/ResetPassword";
import ChatInterface from "./page/chat/ChatInterface";
import ResetEmailVerification from "./page/auth/ResetEmailVerification";
import { useAuth } from "./component/authContext";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <StudyLandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUpPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forget-password"
          element={
            <PublicRoute>
              <ForgetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/email-verification"
          element={
            <PublicRoute>
              <EmailVerification />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-otp-verification"
          element={
            <PublicRoute>
              <ResetEmailVerification />
            </PublicRoute>
          }
        />

        {/* Private Routes */}
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatInterface />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat/:uuid"
          element={
            <PrivateRoute>
              <ChatInterface />
            </PrivateRoute>
          }
        />

        {/* Catch all - 404 Not Found */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

// Route guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return children;
};

export default App;
