import React from 'react';
import { motion } from 'framer-motion';
import {
    Layout,
    Zap,
    Search,
    Calendar,
    MessageSquare,
    PieChart,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Features = () => {
    const featureGroups = [
        {
            title: "Project Management",
            icon: <Layout className="text-orange-500" />,
            items: [
                { title: "Kanban Boards", desc: "Visualize your workflow and drag tasks across statuses." },
                { title: "Table View", desc: "List-style task management with powerful filtering and sorting." },
                { title: "Project Scoping", desc: "Keep tasks isolated within projects to maintain focus." }
            ]
        },
        {
            title: "Collaboration",
            icon: <MessageSquare className="text-blue-500" />,
            items: [
                { title: "Team Invites", desc: "Bring your team on board with simple email invitations." },
                { title: "Role Management", desc: "Define who can see and edit what with granular roles." },
                { title: "Real-time Sync", desc: "Changes reflect instantly across all team members' devices." }
            ]
        },
        {
            title: "Productivity Tools",
            icon: <Zap className="text-yellow-500" />,
            items: [
                { title: "Time Tracking", desc: "Built-in timers to track every minute spent on your tasks." },
                { title: "Smart Filtering", desc: "Find exactly what you need with advanced search and filters." },
                { title: "Daily Overviews", desc: "Get a high-level view of your upcoming and overdue tasks." }
            ]
        },
        {
            title: "Advanced Oversight",
            icon: <PieChart className="text-purple-500" />,
            items: [
                { title: "Visual Analytics", desc: "Beautiful charts showing project progress and team velocity." },
                { title: "Resource Planning", desc: "Monitor workload and allocate tasks efficiently." },
                { title: "Audit Logs", desc: "Track every change made to your projects and tasks." }
            ]
        }
    ];

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-orange-100 selection:text-orange-600">
            {/* Header */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors font-bold">
                        <ArrowLeft size={20} /> Back to Home
                    </Link>
                    <Link to="/login" className="bg-orange-500 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-100 hover:-translate-y-0.5 transition-all">
                        Try It Free
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-20"
                    >
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">Built for high-output <br /> modern teams</h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
                            TaskFlow combines powerful management tools with an intuitive interface to help you ship faster and better.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {featureGroups.map((group, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="bg-gray-50/50 p-10 rounded-[2.5rem] border border-gray-100 shadow-sm"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md">
                                        {React.cloneElement(group.icon, { size: 28 })}
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900">{group.title}</h2>
                                </div>

                                <div className="space-y-6">
                                    {group.items.map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="mt-1">
                                                <CheckCircle2 size={20} className="text-orange-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                                                <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="mt-24 p-12 bg-gray-900 rounded-[3rem] text-center text-white relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <h2 className="text-4xl font-black mb-6">Ready to transform your workflow?</h2>
                            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto font-medium">
                                Join thousands of teams using TaskFlow to hit their goals faster and more efficiently than ever before.
                            </p>
                            <Link to="/login" className="bg-orange-500 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-orange-600 transition-all inline-flex items-center gap-3">
                                Get Started Today <Zap fill="currentColor" size={20} />
                            </Link>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Features;
