const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getDashboardStats = async (req, res) => {
    try {
        const workspaceId = req.workspace._id;

        // Parallel execution for better performance
        const [
            totalProjects,
            totalTasks,
            completedTasks,
            hoursLoggedResult,
            todaysPendingTasks,
            weeklyActivity
        ] = await Promise.all([
            // 1. Total Projects
            Project.countDocuments({ workspace: workspaceId }),

            // 2. Total Tasks
            Task.countDocuments({ workspace: workspaceId }),

            // 3. Completed Tasks
            Task.countDocuments({ workspace: workspaceId, status: 'Done' }),

            // 4. Hours Logged (Aggregate totalTimeSpent)
            Task.aggregate([
                { $match: { workspace: workspaceId } },
                { $group: { _id: null, totalSeconds: { $sum: '$totalTimeSpent' } } }
            ]),

            // 5. Today's Pending Tasks (Due today or before, not done)
            Task.find({
                workspace: workspaceId,
                status: { $ne: 'Done' },
                dueDate: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    $lt: new Date(new Date().setHours(23, 59, 59, 999))
                }
            })
                .select('title dueDate status priority')
                .limit(5),

            // 6. Weekly Activity (Completed tasks per day for last 7 days)
            Task.aggregate([
                {
                    $match: {
                        workspace: workspaceId,
                        status: 'Done',
                        updatedAt: {
                            $gte: new Date(new Date().setDate(new Date().getDate() - 7))
                        }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                        tasks: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        // Process Weekly Activity into a format suitable for the chart (Mon, Tue, etc.)
        const processedActivity = processWeeklyData(weeklyActivity);

        const totalHours = hoursLoggedResult.length > 0 ? (hoursLoggedResult[0].totalSeconds / 3600).toFixed(1) : 0;

        res.status(200).json({
            kpi: {
                totalProjects,
                totalTasks,
                completedTasks,
                hoursLogged: totalHours,
                activeSprints: 0 // Placeholder as Sprints are not yet implemented
            },
            todaysTasks: todaysPendingTasks,
            weeklyActivity: processedActivity
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
};

// Helper to fill in missing days and format for chart
const processWeeklyData = (data) => {
    const today = new Date();
    const last7Days = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
        const dayName = days[d.getDay()];

        const found = data.find(item => item._id === dateStr);
        last7Days.push({
            name: dayName,
            tasks: found ? found.tasks : 0
        });
    }
    return last7Days;
};
