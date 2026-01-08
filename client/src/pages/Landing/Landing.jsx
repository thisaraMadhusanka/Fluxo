import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code, Megaphone, Briefcase, Rocket, ArrowRight,
    X, Check, Mail, Send, MessageSquare, ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/Toast';
import api from '@/services/api';

const Landing = () => {
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
    const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleRequestAccess = async (e) => {
        e.preventDefault();
        try {
            await api.post('/access-requests', formData);
            showToast('Access request submitted successfully! You\'ll receive an email once approved.', 'success');
            setIsRequestModalOpen(false);
            setFormData({ name: '', email: '', company: '', message: '' });
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to submit request', 'error');
        }
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/landing/contact', contactData);
            showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
            setContactData({ name: '', email: '', message: '' });
        } catch (error) {
            showToast('Failed to send message', 'error');
        }
    };

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/landing/subscribe', { email: newsletterEmail });
            showToast('Subscribed successfully!', 'success');
            setNewsletterEmail('');
        } catch (error) {
            showToast('Failed to subscribe', 'error');
        }
    };

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Fluxo" className="w-8 h-8" />
                        <span className="text-2xl font-black tracking-tight">Fluxo</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
                        <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it Works</a>
                        <a href="#roles" className="hover:text-gray-900 transition-colors">Use Cases</a>
                        <a href="#contact" className="hover:text-gray-900 transition-colors">Contact</a>
                    </div>

                    <Link to="/login" className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all">
                        Sign In
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-6 overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-orange-50/30 -z-10" />
                <div className="absolute top-40 left-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10" />

                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block mb-6 px-4 py-2 bg-orange-100 rounded-full text-orange-600 text-sm font-semibold"
                        >
                            ✨ Now with AI-powered insights
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent"
                        >
                            Manage projects,<br />
                            master the flow.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
                        >
                            The all-in-one workspace for high-performance teams. Plan, track, and ship world-class software without the chaos.
                        </motion.p>
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            onClick={() => setIsRequestModalOpen(true)}
                            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-2xl text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl"
                        >
                            Request Access <ArrowRight size={22} />
                        </motion.button>
                    </div>

                    {/* Dashboard Screenshot */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="relative max-w-6xl mx-auto"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-r from-orange-400/20 to-blue-400/20 rounded-3xl blur-2xl" />
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-gray-200/50">
                            <img
                                src="/dashboard-preview.png"
                                alt="Fluxo Dashboard"
                                className="w-full"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-block mb-4 px-4 py-1.5 bg-gray-100 rounded-full text-gray-600 text-sm font-semibold uppercase tracking-wide"
                        >
                            Features
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-5xl md:text-6xl font-black mb-6"
                        >
                            Your command center.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-xl text-gray-600 max-w-2xl mx-auto"
                        >
                            Everything you need to ship faster, all in one place.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[
                            {
                                title: 'Kanban Boards',
                                description: 'Visualize your workflow with intuitive drag-and-drop boards.',
                                image: '/kanban-preview.png',
                                gradient: 'from-blue-500/10 to-purple-500/10'
                            },
                            {
                                title: 'Task Management',
                                description: 'Rich task details with subtasks, comments, and time tracking.',
                                image: '/task-preview.png',
                                gradient: 'from-orange-500/10 to-pink-500/10'
                            },
                            {
                                title: 'Team Collaboration',
                                description: 'Real-time updates and seamless team communication.',
                                image: '/team-preview.png',
                                gradient: 'from-green-500/10 to-teal-500/10'
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15, duration: 0.5 }}
                                className="group relative bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-2xl hover:border-gray-300 transition-all duration-300"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`} />
                                <div className="rounded-2xl overflow-hidden mb-6 shadow-xl ring-1 ring-gray-200/50">
                                    <img src={feature.image} alt={feature.title} className="w-full transform group-hover:scale-105 transition-transform duration-300" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 px-6 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black mb-4">How it works</h2>
                        <p className="text-xl text-gray-600">Get started in minutes</p>
                    </div>

                    <div className="space-y-12">
                        {[
                            { step: '01', title: 'Request Access', description: 'Submit your access request with a few details about you and your team.' },
                            { step: '02', title: 'Get Approved', description: 'Our team reviews your request and sends you login credentials via email.' },
                            { step: '03', title: 'Start Building', description: 'Log in, create your workspace, invite your team, and start shipping.' }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start gap-6"
                            >
                                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-black">
                                    {item.step}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                                    <p className="text-gray-600 text-lg">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Built for Every Role */}
            <section id="roles" className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black mb-4">Built for every role.</h2>
                        <p className="text-xl text-gray-600">Whether you manage product, marketing, or code, Fluxo adapts to you.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { icon: <Code size={32} />, title: 'Product Managers', description: 'Connect strategy to execution. Keep stakeholders aligned without the meeting fatigue.', buttonText: 'Explore Workflow' },
                            { icon: <Megaphone size={32} />, title: 'Marketing Teams', description: 'Plan campaigns, track assets, and coordinate launches side-by-side with product.', buttonText: 'Explore Workflow' },
                            { icon: <Briefcase size={32} />, title: 'Agencies', description: 'Manage multiple clients with strict permission boundaries and custom branding.', buttonText: 'Explore Workflow' },
                            { icon: <Rocket size={32} />, title: 'Founders', description: 'Keep the big picture in view while managing the day-to-day chaos of a startup.', buttonText: 'Explore Workflow' }
                        ].map((role, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-6 text-gray-900">
                                    {role.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{role.title}</h3>
                                <p className="text-gray-600 mb-6">{role.description}</p>
                                <Link to="/login" className="inline-flex items-center gap-2 text-gray-900 font-bold hover:gap-4 transition-all">
                                    {role.buttonText} <ChevronRight size={18} />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-24 px-6 bg-gray-900 text-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-5xl font-black mb-6">Let's talk<br />business.</h2>
                            <p className="text-xl text-gray-300 mb-8">
                                Ready to streamline your workflow? We're here to help you get started with the right plan.
                            </p>
                            <div className="flex items-center gap-3 text-gray-300">
                                <Mail size={24} />
                                <span className="text-lg font-semibold">hello@fluxo.com</span>
                            </div>
                        </div>

                        <form onSubmit={handleContactSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">NAME</label>
                                <input
                                    type="text"
                                    value={contactData.name}
                                    onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">EMAIL</label>
                                <input
                                    type="email"
                                    value={contactData.email}
                                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                                    placeholder="john@company.com"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">MESSAGE</label>
                                <textarea
                                    value={contactData.message}
                                    onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                                    placeholder="Tell us about your project..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full px-6 py-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                            >
                                Send Message <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-3xl p-12 mb-12 border border-gray-200">
                        <div className="max-w-xl">
                            <h3 className="text-3xl font-black mb-3">Join the inner circle.</h3>
                            <p className="text-gray-600 mb-6">Get exclusive updates, early access to new features, and productivity tips delivered to your inbox.</p>
                            <form onSubmit={handleNewsletterSubmit} className="flex gap-3">
                                <input
                                    type="email"
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                    required
                                />
                                <button type="submit" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all">
                                    Subscribe
                                </button>
                            </form>
                            <p className="text-xs text-gray-500 mt-3">We respect your inbox. Unsubscribe at any time.</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Fluxo" className="w-6 h-6" />
                            <span className="font-bold text-gray-900">Fluxo</span>
                        </div>
                        <div className="flex gap-6">
                            <a href="#privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
                            <a href="#terms" className="hover:text-gray-900 transition-colors">Terms & Conditions</a>
                        </div>
                        <p>© 2026 Fluxo. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Access Request Modal */}
            <AnimatePresence>
                {isRequestModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsRequestModalOpen(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 z-10"
                        >
                            <button
                                onClick={() => setIsRequestModalOpen(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-3xl font-black mb-2">Request Access</h2>
                            <p className="text-gray-600 mb-8">Join hundreds of teams already using Fluxo</p>

                            <form onSubmit={handleRequestAccess} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@company.com"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Company</label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        placeholder="Acme Inc."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Message</label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Tell us about your use case..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/20 resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full px-6 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
                                >
                                    Submit Request
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Landing;
