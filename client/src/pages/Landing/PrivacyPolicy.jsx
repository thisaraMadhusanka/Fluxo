import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
    return (
        <div className="bg-white min-h-screen font-sans selection:bg-orange-100 selection:text-orange-600">
            {/* Header */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors font-bold">
                        <ArrowLeft size={20} /> Back to Home
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <Shield className="text-white" size={18} />
                        </div>
                        <span className="text-xl font-black text-gray-900">TaskFlow</span>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto"
                >
                    <h1 className="text-4xl font-black text-gray-900 mb-8">Privacy Policy</h1>

                    <div className="prose prose-orange lg:prose-xl text-gray-600 space-y-8 font-medium leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                            <p>
                                We collect information you provide directly to us when you create an account, create or modify your profile, set up your workspace, or communicate with us. This includes your name, email address, and any images or files you upload.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                            <p>
                                We use the information we collect to provide, maintain, and improve our services, to respond to your comments and questions, and to send you technical notices, updates, and support messages.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Security</h2>
                            <p>
                                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sharing of Information</h2>
                            <p>
                                We do not share your personal information with third parties except as described in this policy, such as when you invite team members to your workspace.
                            </p>
                        </section>

                        <section className="bg-orange-50 p-8 rounded-3xl border border-orange-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at support@taskflow.com.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
