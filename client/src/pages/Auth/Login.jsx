import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, AlertCircle, Check } from 'lucide-react';
import { login, register, googleLogin } from '@/store/slices/authSlice';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Load Google Sign-In script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        script.onload = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: handleGoogleResponse,
                });
                window.google.accounts.id.renderButton(
                    document.getElementById('google-signin-button'),
                    {
                        theme: 'outline',
                        size: 'large',
                        width: 350,
                        text: 'continue_with',
                        shape: 'rectangular',
                        logo_alignment: 'left'
                    }
                );
            }
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleGoogleResponse = (response) => {
        dispatch(googleLogin(response.credential));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!isLogin && !formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!isLogin && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!isLogin && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (isLogin) {
            dispatch(login({ email: formData.email, password: formData.password }));
        } else {
            dispatch(register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            }));
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error for this field
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        setErrors({});
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo/Brand */}
                <div className="text-center mb-10 flex flex-col items-center">
                    <img src="/logo.png" alt="Fluxo" className="w-14 h-14 object-contain mb-4" />
                    <h1 className="text-4xl font-black text-[#1A1D23] tracking-tight">Flux<span className="text-orange-500">o.</span></h1>
                    <p className="text-gray-500 font-medium mt-2">Manage your projects this fast.</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            {isLogin ? 'Sign in to continue to Fluxo' : 'Join Fluxo to manage your projects'}
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                            <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Google Sign In */}
                    <div className="mb-6 flex justify-center">
                        <div id="google-signin-button" className="max-w-full overflow-hidden"></div>
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.name ? 'border-red-300' : 'border-gray-200'
                                            } focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                                        placeholder="John Doe"
                                    />
                                </div>
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.email ? 'border-red-300' : 'border-gray-200'
                                        } focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                                    placeholder="john@example.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.password ? 'border-red-300' : 'border-gray-200'
                                        } focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                                            } focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                            </div>
                        )}

                        {isLogin && (
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span className="ml-2 text-gray-600">Remember me</span>
                                </label>
                                <a href="#" className="text-primary hover:text-primary/80 font-medium">
                                    Forgot password?
                                </a>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <div className="mt-6 text-center text-sm text-gray-600">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={toggleMode}
                            className="text-primary hover:text-primary/80 font-medium"
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-500 mt-6">
                    By continuing, you agree to Fluxo's Terms of Service and Privacy Policy
                </p>

                {/* Loading/Success Popup Overlay */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-50 text-center p-6"
                        >
                            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                            <h3 className="text-xl font-bold text-gray-800">Please Wait...</h3>
                            <p className="text-gray-500">We are verifying your credentials</p>
                        </motion.div>
                    )}
                    {(error && (error.includes('pending approval') || error.includes('Please wait for admin') || error.includes('wait for admin approval'))) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 bg-white rounded-2xl flex flex-col items-center justify-center z-50 text-center p-8 shadow-xl"
                        >
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <Check size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Thanks for joining!</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                You have been added to the waitlist. <br />
                                Once the admin approves your account, we will send you an email with a login link.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                Back to Login
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Login;
