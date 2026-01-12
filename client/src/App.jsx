import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '@/components/PrivateRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import Login from '@/pages/Auth/Login';
import Dashboard from '@/pages/Dashboard/Dashboard';
import Projects from '@/pages/Projects/Projects';
import ProjectDetails from '@/pages/Projects/ProjectDetails';
import Tasks from '@/pages/Tasks/Tasks';
import Users from '@/pages/Users/Users';
import ComingSoon from '@/pages/ComingSoon';
import AdminDashboard from '@/pages/Admin/AdminDashboard';
import ProfileSettings from '@/pages/Settings/ProfileSettings';
import WorkspaceSettings from '@/pages/Settings/WorkspaceSettings';
import AcceptInvite from '@/pages/AcceptInvite';
import Landing from '@/pages/Landing/Landing';
import Features from '@/pages/Landing/Features';
import PrivacyPolicy from '@/pages/Landing/PrivacyPolicy';
import TermsConditions from '@/pages/Landing/TermsConditions';
import { ToastProvider } from '@/components/Toast';
import { useSelector } from 'react-redux';

const App = () => {
    const { isAuthenticated, token } = useSelector((state) => state.auth);

    return (
        <ToastProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    {/* Public Landing Pages */}
                    <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsConditions />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/accept-invite" element={<AcceptInvite />} />

                    {/* Protected Application Routes */}
                    <Route path="/dashboard" element={<PrivateRoute><DashboardLayout><Dashboard /></DashboardLayout></PrivateRoute>} />
                    <Route path="/projects" element={<PrivateRoute><DashboardLayout><Projects /></DashboardLayout></PrivateRoute>} />
                    <Route path="/projects/:id" element={<PrivateRoute><DashboardLayout><ProjectDetails /></DashboardLayout></PrivateRoute>} />
                    <Route path="/tasks" element={<PrivateRoute><DashboardLayout><Tasks /></DashboardLayout></PrivateRoute>} />
                    <Route path="/admin" element={<PrivateRoute><DashboardLayout><AdminDashboard /></DashboardLayout></PrivateRoute>} />

                    {/* Settings */}
                    <Route path="/settings" element={<PrivateRoute><DashboardLayout><ProfileSettings /></DashboardLayout></PrivateRoute>} />
                    <Route path="/settings/workspace" element={<PrivateRoute><DashboardLayout><WorkspaceSettings /></DashboardLayout></PrivateRoute>} />

                    {/* Users Route */}
                    <Route path="/users" element={<PrivateRoute><DashboardLayout><Users /></DashboardLayout></PrivateRoute>} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ToastProvider>
    )
}

export default App;
