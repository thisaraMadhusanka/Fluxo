import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsConditions = () => {
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
                            <FileText className="text-white" size={18} />
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
                    <h1 className="text-4xl font-black text-gray-900 mb-8">Terms of Service</h1>

                    <div className="prose prose-orange lg:prose-xl text-gray-600 space-y-8 font-medium leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using TaskFlow, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
                            <p>
                                Permission is granted to temporarily use the services provided by TaskFlow for personal or commercial project management purposes. This is the grant of a license, not a transfer of title.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Disclaimer</h2>
                            <p>
                                The materials on TaskFlow are provided on an 'as is' basis. TaskFlow makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Limitations</h2>
                            <p>
                                In no event shall TaskFlow or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use TaskFlow.
                            </p>
                        </section>

                        <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Governing Law</h2>
                            <p>
                                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default TermsConditions;
