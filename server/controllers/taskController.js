const Task = require('../models/Task');
const Project = require('../models/Project');
const { createNotification } = require('./notificationController');

// Get all tasks for a project (Security: ensure project validates against workspace)
exports.getTasksByProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findOne({ _id: projectId, workspace: req.workspace._id });
        if (!project) {
            return res.status(404).json({ message: 'Project not found or not in this workspace' });
        }

        const tasks = await Task.find({ project: projectId })
            .populate('assignees', 'name email avatar')
            .populate('parentTask', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new task
exports.createTask = async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, project, assignees, parentTask } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        // Only validate project if one is provided
        if (project) {
            const projectExists = await Project.findOne({ _id: project, workspace: req.workspace._id });
            if (!projectExists) {
                return res.status(404).json({ message: 'Project not found or not in this workspace' });
            }
        }

        const task = await Task.create({
            title,
            description,
            status: status || 'To Do',
            priority: priority || 'Medium',
            dueDate,
            project,
            workspace: req.workspace._id,
            assignees: assignees || [],
            parentTask: parentTask || null,
            createdBy: req.user.id
        });

        const populatedTask = await Task.findById(task._id)
            .populate('assignees', 'name email avatar')
            .populate('parentTask', 'title');

        // Notify assignees
        if (assignees && assignees.length > 0) {
            assignees.forEach(userId => {
                if (userId !== req.user.id) {
                    createNotification({
                        userId,
                        type: 'task_assigned',
                        title: 'New Task Assigned',
                        message: `You were assigned to task "${title}"`,
                        link: `/projects/${project}`,
                        metadata: { taskId: task._id, projectId: project }
                    });
                }
            });
        }

        // Notify Creator (Self) - Persistence
        createNotification({
            userId: req.user.id,
            type: 'system',
            title: 'Task Created',
            message: `Task "${title}" created successfully.`,
            link: null,
            metadata: { taskId: task._id }
        });

        res.status(201).json(populatedTask);
    } catch (error) {
        console.error('Create Task Error:', error);
        res.status(500).json({ message: error.message || 'Server error creating task' });
    }
};

// Update task
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Fetch original task to check previous status
        const originalTask = await Task.findById(id);
        if (!originalTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        let updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true })
            .populate('assignees', 'name email avatar')
            .populate('parentTask', 'title');

        // If status changed to Done, ensure all subtasks are marked completed
        if (updates.status === 'Done' && originalTask.status !== 'Done') {
            if (updatedTask.subtasks && updatedTask.subtasks.length > 0) {
                updatedTask.subtasks.forEach(sub => sub.completed = true);
                await updatedTask.save();
            }
        }

        // Notify if status changed
        if (updates.status && updates.status !== originalTask.status) {
            // Notify creator
            if (updatedTask.createdBy && updatedTask.createdBy.toString() !== req.user.id) {
                createNotification({
                    userId: updatedTask.createdBy,
                    type: 'task_updated',
                    title: 'Task Updated',
                    message: `Task "${updatedTask.title}" is now ${updates.status}`,
                    link: `/projects/${updatedTask.project}`,
                    metadata: { taskId: updatedTask._id }
                });
            }
        }

        // Notify Updater (Self) - Persistence
        createNotification({
            userId: req.user.id,
            type: 'task_updated',
            title: 'Task Updated',
            message: `Task "${updatedTask.title}" updated successfully.`,
            link: null,
            metadata: { taskId: updatedTask._id }
        });

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating task' });
    }
};

// Delete task
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findByIdAndDelete(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Also delete all subtasks
        await Task.deleteMany({ parentTask: id });

        // Notify Deleter (Self) - Persistence
        createNotification({
            userId: req.user.id,
            type: 'system',
            title: 'Task Deleted',
            message: 'Task deleted successfully.',
            link: null,
            metadata: { taskId: id }
        });

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting task' });
    }
};

// Toggle task completion
exports.toggleComplete = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.status = task.status === 'Done' ? 'To Do' : 'Done';
        await task.save();

        const updatedTask = await Task.findById(id)
            .populate('assignees', 'name email avatar');

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add subtask
exports.addSubtask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Subtask title is required' });
        }

        const parentTask = await Task.findById(id);
        if (!parentTask) {
            return res.status(404).json({ message: 'Parent task not found' });
        }

        const subtask = {
            title,
            completed: false,
            createdAt: new Date()
        };

        parentTask.subtasks.push(subtask);
        await parentTask.save();

        res.status(201).json(parentTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding subtask' });
    }
};

// Toggle subtask completion
exports.toggleSubtask = async (req, res) => {
    try {
        const { id, subtaskId } = req.params;

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const subtask = task.subtasks.id(subtaskId);
        if (!subtask) {
            return res.status(404).json({ message: 'Subtask not found' });
        }

        subtask.completed = !subtask.completed;
        await task.save();

        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete subtask
exports.deleteSubtask = async (req, res) => {
    try {
        const { id, subtaskId } = req.params;

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.subtasks.pull(subtaskId);
        await task.save();

        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all tasks (Scoped to Workspace)
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ workspace: req.workspace._id })
            .populate('assignees', 'name email avatar')
            .populate('project', 'name')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single task by ID with full details (Scoped)
exports.getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findOne({ _id: id, workspace: req.workspace._id })
            .populate('assignees', 'name email avatar')
            .populate('project', 'name')
            .populate('createdBy', 'name email')
            .populate('timeLogs.user', 'name avatar')
            .populate('comments.user', 'name avatar');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add comment to task
exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.comments.push({
            user: req.user.id,
            text
        });

        await task.save();
        await task.populate('comments.user', 'name avatar');

        // Notify task owner/assignees (simplified: just notify task creator for now if not self)
        if (task.createdBy && task.createdBy.toString() !== req.user.id) {
            createNotification({
                userId: task.createdBy,
                type: 'comment_added',
                title: 'New Comment',
                message: `New comment on "${task.title}"`,
                link: `/projects/${task.project}`,
                metadata: { taskId: task._id }
            });
        }

        // Notify Commenter (Self) - Persistence
        createNotification({
            userId: req.user.id,
            type: 'comment_added',
            title: 'Comment Added',
            message: 'Comment added successfully.',
            link: null,
            metadata: { taskId: task._id }
        });

        res.status(201).json(task.comments[task.comments.length - 1]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding comment' });
    }
};

// Add time log to task
exports.addTimeLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { startTime, endTime, duration, description } = req.body;

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.timeLogs.push({
            user: req.user.id,
            startTime,
            endTime,
            duration,
            description
        });

        // Update total time spent
        task.totalTimeSpent = (task.totalTimeSpent || 0) + (duration || 0);

        await task.save();
        await task.populate('timeLogs.user', 'name avatar');

        res.status(201).json({
            timeLog: task.timeLogs[task.timeLogs.length - 1],
            totalTimeSpent: task.totalTimeSpent
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding time log' });
    }
};

// Get time logs for task
exports.getTimeLogs = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findById(id).populate('timeLogs.user', 'name avatar');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({
            timeLogs: task.timeLogs,
            totalTimeSpent: task.totalTimeSpent || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Start Timer
exports.startTimer = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[Timer] Start request for Task ID: ${id}`);
        const task = await Task.findById(id);

        if (!task) {
            console.log(`[Timer] Task not found for ID: ${id}`);
            return res.status(404).json({ message: 'Task not found' });
        }

        // If already tracking, return
        if (task.timerStartTime) {
            return res.status(400).json({ message: 'Timer already running' });
        }

        task.timerStartTime = new Date();
        await task.save();

        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error starting timer' });
    }
};

// Stop Timer
exports.stopTimer = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (!task.timerStartTime) {
            return res.status(400).json({ message: 'Timer not running' });
        }

        const endTime = new Date();
        const startTime = new Date(task.timerStartTime);
        const duration = Math.floor((endTime - startTime) / 1000); // seconds

        task.timeLogs.push({
            user: req.user.id,
            startTime,
            endTime,
            duration,
            description: 'Timer Session'
        });

        task.totalTimeSpent = (task.totalTimeSpent || 0) + duration;
        task.timerStartTime = null;

        await task.save();

        // Populate to return full data
        await task.populate('timeLogs.user', 'name avatar');

        // Notify Timer Stopper (Self) - Persistence
        createNotification({
            userId: req.user.id,
            type: 'system',
            title: 'Timer Stopped',
            message: 'Time logged successfully!',
            link: null,
            metadata: { taskId: task._id }
        });

        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error stopping timer' });
    }
};
