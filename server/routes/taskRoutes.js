const express = require('express');
const router = express.Router();
const {
    getTasksByProject,
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addComment,
    addTimeLog,
    getTimeLogs,
    startTimer,
    stopTimer
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const authWorkspace = require('../middleware/authWorkspace');

// All routes require authentication and workspace context
router.use(protect);
router.use(authWorkspace);

// Task CRUD
router.get('/tasks', getAllTasks); // Get all tasks
router.get('/tasks/:id', getTaskById); // Get single task with full details
router.get('/projects/:projectId/tasks', getTasksByProject);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

// Task status
router.put('/tasks/:id/complete', toggleComplete);

// Subtasks
router.post('/tasks/:id/subtasks', addSubtask);
router.put('/tasks/:id/subtasks/:subtaskId', toggleSubtask);
router.delete('/tasks/:id/subtasks/:subtaskId', deleteSubtask);

// Comments
router.post('/tasks/:id/comments', addComment);

// Time logs
router.post('/tasks/:id/time-logs', addTimeLog);
router.get('/tasks/:id/time-logs', getTimeLogs);
router.post('/tasks/:id/start-timer', startTimer);
router.post('/tasks/:id/stop-timer', stopTimer);

module.exports = router;
