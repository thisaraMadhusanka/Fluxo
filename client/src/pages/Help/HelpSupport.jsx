import React from 'react';
import { HelpCircle, BookOpen, Video, MessageCircle, ExternalLink, CheckCircle2, Zap, Users, FolderKanban, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpSupport = () => {
    const tutorials = [
        {
            title: 'Getting Started with Fluxo',
            description: 'Learn the basics of creating workspaces and managing your first project',
            icon: Zap,
            color: 'bg-blue-500',
            steps: ['Create a workspace', 'Invite team members', 'Set up your first project']
        },
        {
            title: 'Project Management',
            description: 'Master project creation, task organization, and team collaboration',
            icon: FolderKanban,
            color: 'bg-purple-500',
            steps: ['Create projects', 'Organize tasks', 'Track progress']
        },
        {
            title: 'Team Collaboration',
            description: 'Collaborate effectively with your team using Fluxo\'s features',
            icon: Users,
            color: 'bg-green-500',
            steps: ['Add team members', 'Assign tasks', 'Share updates']
        },
        {
            title: 'Time Management',
            description: 'Use calendars, deadlines, and time tracking to stay on schedule',
            icon: Calendar,
            color: 'bg-orange-500',
            steps: ['Set deadlines', 'Track time', 'View calendar']
        }
    ];

    const quickGuides = [
        { title: 'Creating Your First Workspace', link: '#workspace', duration: '2 min' },
        { title: 'Adding Team Members', link: '#members', duration: '1 min' },
        { title: 'Setting Up a Project', link: '#project', duration: '3 min' },
        { title: 'Managing Tasks', link: '#tasks', duration: '4 min' },
        { title: 'Using the Kanban Board', link: '#kanban', duration: '3 min' },
    ];

    const faqs = [
        {
            question: 'How do I invite team members to my workspace?',
            answer: 'Go to Workspace Settings, click on "Invite Members", and enter their email addresses. They will receive an invitation to join your workspace.'
        },
        {
            question: 'Can I customize project colors and icons?',
            answer: 'Yes! When creating or editing a project, you can choose from various colors and emoji icons to personalize your projects.'
        },
        {
            question: 'How do I track time on tasks?',
            answer: 'Click on any task to open its details. You\'ll find a timer button that lets you start/stop time tracking for that specific task.'
        },
        {
            question: 'What project views are available?',
            answer: 'Fluxo offers multiple views: Table View for detailed task management, Kanban Board for visual workflow, Calendar View for deadline tracking, and Analytics for progress insights.'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
                    <p className="text-gray-600">Get the most out of Fluxo with our comprehensive guides and tutorials</p>
                </div>

                {/* Quick Start Tutorials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {tutorials.map((tutorial, index) => {
                        const Icon = tutorial.icon;
                        return (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all group cursor-pointer">
                                <div className="flex items-start gap-4">
                                    <div className={`${tutorial.color} w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{tutorial.title}</h3>
                                        <p className="text-sm text-gray-600 mb-3">{tutorial.description}</p>
                                        <div className="space-y-1.5">
                                            {tutorial.steps.map((step, idx) => (
                                                <div key={idx} className="flex items-center text-xs text-gray-500">
                                                    <CheckCircle2 size={14} className="mr-2 text-primary" />
                                                    {step}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Guides - Card Grid */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-6">
                        <BookOpen size={20} className="text-primary" />
                        <h2 className="text-2xl font-bold text-gray-900">Quick Guides</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <a href="#workspace" className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl font-bold">1</div>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-medium">2 min</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">Creating Your First Workspace</h3>
                            <p className="text-sm text-gray-600">Set up your team workspace and get started with Fluxo</p>
                        </a>

                        <a href="#members" className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xl font-bold">2</div>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-medium">1 min</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">Adding Team Members</h3>
                            <p className="text-sm text-gray-600">Invite your team and assign roles</p>
                        </a>

                        <a href="#project" className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xl font-bold">3</div>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-medium">3 min</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">Setting Up a Project</h3>
                            <p className="text-sm text-gray-600">Create and configure your first project</p>
                        </a>

                        <a href="#tasks" className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-xl font-bold">4</div>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-medium">4 min</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">Managing Tasks</h3>
                            <p className="text-sm text-gray-600">Create, assign, and track tasks effectively</p>
                        </a>

                        <a href="#kanban" className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 text-xl font-bold">5</div>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-medium">3 min</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">Using the Kanban Board</h3>
                            <p className="text-sm text-gray-600">Visualize workflow with drag-and-drop kanban</p>
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Support Resources placeholder - keeping this section */}
                    <div className="lg:col-span-3"></div>

                    {/* Support Resources - Card Layout */}
                    <div className="lg:col-span-3">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Need More Help?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <a href="mailto:support@fluxo.com" className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all group">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                    <MessageCircle size={24} className="text-primary" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Email Support</h3>
                                <p className="text-sm text-gray-600">support@fluxo.com</p>
                            </a>
                            <a href="#videos" className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all group">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                    <Video size={24} className="text-primary" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Video Tutorials</h3>
                                <p className="text-sm text-gray-600">Watch & learn</p>
                            </a>
                            <a href="#docs" className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all group">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                    <ExternalLink size={24} className="text-primary" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Documentation</h3>
                                <p className="text-sm text-gray-600">Full docs</p>
                            </a>
                        </div>
                    </div>
                </div>

                {/* FAQs - Accordion */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                        <HelpCircle size={20} className="text-primary" />
                        <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-3">
                        {faqs.map((faq, index) => {
                            const [isOpen, setIsOpen] = React.useState(false);
                            return (
                                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setIsOpen(!isOpen)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                    >
                                        <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                                        <svg
                                            className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {isOpen && (
                                        <div className="p-4 bg-white border-t border-gray-200">
                                            <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Detailed Guides Section */}
                <div className="space-y-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Step-by-Step Guides</h2>

                    {/* Creating Your First Workspace */}
                    <div id="workspace" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 scroll-mt-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                            Creating Your First Workspace
                        </h3>
                        <div className="space-y-4 text-gray-700">
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 1:</strong> After logging in, you'll be prompted to create your first workspace. Click "Create Workspace" button.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 2:</strong> Enter your workspace name (e.g., "Marketing Team", "Development Department").
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 3:</strong> Click "Create" and your workspace will be ready! You'll automatically become the workspace owner.
                                </div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <strong className="text-blue-900">💡 Tip:</strong>
                                <p className="text-sm text-blue-800 mt-1">You can switch between multiple workspaces using the workspace switcher in the sidebar.</p>
                            </div>
                        </div>
                    </div>

                    {/* Adding Team Members */}
                    <div id="members" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 scroll-mt-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                            Adding Team Members
                        </h3>
                        <div className="space-y-4 text-gray-700">
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 1:</strong> Navigate to "Workspace" → "Workspace Settings" from the sidebar.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 2:</strong> Click on the "Invite Members" button in the Members section.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 3:</strong> Enter email addresses of team members (one per line or comma-separated).
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 4:</strong> Select their role (Member, Developer, Designer, or QA) and click "Send Invitations".
                                </div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <strong className="text-purple-900">💡 Tip:</strong>
                                <p className="text-sm text-purple-800 mt-1">Members will receive an email invitation and need to accept it before they can access the workspace.</p>
                            </div>
                        </div>
                    </div>

                    {/* Setting Up a Project */}
                    <div id="project" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 scroll-mt-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                            Setting Up a Project
                        </h3>
                        <div className="space-y-4 text-gray-700">
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 1:</strong> Go to "Projects" from the sidebar and click "New Project".
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 2:</strong> Fill in project details - Title, Description, and choose an icon.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 3:</strong> Select a color theme for your project and set the status (Active, In Progress, etc.).
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 4:</strong> Set a deadline (optional) and click "Create Project".
                                </div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <strong className="text-green-900">💡 Tip:</strong>
                                <p className="text-sm text-green-800 mt-1">Use descriptive names and colors to easily identify projects at a glance!</p>
                            </div>
                        </div>
                    </div>

                    {/* Managing Tasks */}
                    <div id="tasks" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 scroll-mt-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                            Managing Tasks
                        </h3>
                        <div className="space-y-4 text-gray-700">
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 1:</strong> Click on any project to view its tasks. Click "Add Task" to create a new task.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 2:</strong> Enter task name, description, and assign team members.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 3:</strong> Set priority (Low, Medium, High), status (To Do, In Progress, In Review, Done).
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 4:</strong> Add deadlines and start/end dates. You can also add time tracking.
                                </div>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <strong className="text-orange-900">💡 Tip:</strong>
                                <p className="text-sm text-orange-800 mt-1">Use the table view to see all task details at once, or switch to kanban for visual workflow management.</p>
                            </div>
                        </div>
                    </div>

                    {/* Using the Kanban Board */}
                    <div id="kanban" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 scroll-mt-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                            Using the Kanban Board
                        </h3>
                        <div className="space-y-4 text-gray-700">
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 1:</strong> Open any project and click the "Kanban" view tab at the top.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 2:</strong> You'll see columns for each status: To Do, In Progress, In Review, and Done.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 3:</strong> Drag and drop task cards between columns to update their status.
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Step 4:</strong> Click on any task card to view details, add comments, or edit information.
                                </div>
                            </div>
                            <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                                <strong className="text-pink-900">💡 Tip:</strong>
                                <p className="text-sm text-pink-800 mt-1">Kanban view is perfect for agile workflows and visualizing your team's progress at a glance!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Color Theme Guide */}
                <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Fluxo Design System</h2>
                    <p className="text-sm text-gray-600 mb-4">Our application uses a consistent color theme across all features:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="w-full h-20 bg-primary rounded-lg mb-2 shadow-sm"></div>
                            <div className="text-xs font-semibold text-gray-700">Primary (Orange)</div>
                            <div className="text-xs text-gray-500">Actions & Highlights</div>
                        </div>
                        <div className="text-center">
                            <div className="w-full h-20 bg-sidebar rounded-lg mb-2 shadow-sm"></div>
                            <div className="text-xs font-semibold text-gray-700">Sidebar (Dark Blue)</div>
                            <div className="text-xs text-gray-500">Navigation</div>
                        </div>
                        <div className="text-center">
                            <div className="w-full h-20 bg-success rounded-lg mb-2 shadow-sm"></div>
                            <div className="text-xs font-semibold text-gray-700">Success (Green)</div>
                            <div className="text-xs text-gray-500">Completed Tasks</div>
                        </div>
                        <div className="text-center">
                            <div className="w-full h-20 bg-warning rounded-lg mb-2 shadow-sm"></div>
                            <div className="text-xs font-semibold text-gray-700">Warning (Yellow)</div>
                            <div className="text-xs text-gray-500">Pending Items</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;
