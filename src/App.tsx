import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import CompleteSignIn from './pages/CompleteSignIn';
import StartupsPage from './pages/StartupsPage';
import VotePage from './pages/VotePage';
import LeaderboardPage from './pages/LeaderboardPage';
import MeetingsPage from './pages/MeetingsPage';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/complete-signin" element={<CompleteSignIn />} />

                    {/* Protected Routes */}
                    <Route
                        path="/startups"
                        element={
                            <ProtectedRoute>
                                <StartupsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/meetings"
                        element={
                            <ProtectedRoute>
                                <MeetingsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vote"
                        element={
                            <ProtectedRoute>
                                <VotePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/leaderboard"
                        element={
                            <ProtectedRoute>
                                <LeaderboardPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Redirect unknown routes to startups */}
                    <Route path="*" element={<Navigate to="/startups" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
