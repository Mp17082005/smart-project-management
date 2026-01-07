import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    BarChart3,
    LayoutGrid,
    List,
    Plus,
    Calendar,
    MoreVertical,
    ChevronRight,
    X,
    Trash2
} from 'lucide-react';
import { projectService, taskService, userService } from '../services/api';

const ProjectDetail = () => {
    const { id } = useParams();
    const [project, setProject] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'board' | 'list'>('board');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', dueDate: '', assignedToEmail: '' });

    useEffect(() => {
        if (id) {
            fetchProjectData();
            fetchCurrentUser();
        }
    }, [id]);

    const fetchCurrentUser = async () => {
        try {
            const res = await userService.getProfile();
            setCurrentUser(res.data);
        } catch (err) {
            console.error('Error fetching current user:', err);
        }
    };

    const fetchProjectData = async () => {
        try {
            const [projRes, tasksRes] = await Promise.all([
                projectService.getProject(id!),
                taskService.getTasks(id!)
            ]);
            setProject(projRes.data);
            setTasks(tasksRes.data);
        } catch (err) {
            console.error('Error fetching project data:', err);
        } finally {
            setLoading(false);
        }
    };

    const [error, setError] = useState('');

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await taskService.createTask({ ...newTask, projectId: id });
            setIsTaskModalOpen(false);
            setNewTask({ title: '', description: '', priority: 'Medium', dueDate: '', assignedToEmail: '' });
            fetchProjectData();
            alert('Task created successfully!');
        } catch (err: any) {
            console.error('Error creating task:', err);
            setError(err.response?.data?.msg || 'Failed to create task.');
        }
    };

    const updateStatus = async (taskId: string, newStatus: string) => {
        try {
            await taskService.updateTaskStatus(taskId, newStatus);
            fetchProjectData();
        } catch (err: any) {
            console.error('Error updating task status:', err);
            alert(err.response?.data?.msg || 'Failed to update status.');
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await taskService.deleteTask(taskId);
            fetchProjectData();
            alert('Task deleted successfully!');
        } catch (err: any) {
            console.error('Error deleting task:', err);
            alert(err.response?.data?.msg || 'Failed to delete task.');
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;

    if (!project) return <div>Project not found</div>;

    const columns = ["To Do", "In Progress", "Done"];

    const canUpdateTask = (task: any) => {
        if (!currentUser || !project) return false;
        const isProjectOwner = project.createdBy === currentUser._id;
        const isTaskCreator = task.createdBy?._id === currentUser._id || task.createdBy === currentUser._id;
        const isAssignee = task.assignedTo?._id === currentUser._id;
        return isProjectOwner || isTaskCreator || isAssignee;
    };

    const canDeleteTask = (task: any) => {
        if (!currentUser) return false;
        return task.createdBy?._id === currentUser._id || task.createdBy === currentUser._id;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => window.history.back()}>Projects</span>
                <ChevronRight size={14} />
                <span className="text-slate-900 font-medium">{project.title}</span>
            </div>

            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-4 max-w-2xl text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{project.title}</h1>
                        <div className="px-3 py-1 bg-primary/10 text-primary rounded-xl text-[10px] md:text-xs font-mono font-bold flex items-center gap-2">
                            TOKEN: {project.token}
                        </div>
                    </div>
                    <p className="text-slate-500 leading-relaxed text-base md:text-lg">{project.description}</p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-100 shadow-sm">
                            <Calendar size={14} className="text-primary" />
                            <span className="text-xs font-semibold text-slate-700">
                                {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                            </span>
                        </div>

                        <div className="flex items-center -space-x-2">
                            {project.members?.map((m: any, i: number) => (
                                <div key={i} title={m.name} className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                    {m.name?.charAt(0) || m.email?.charAt(0)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
                        <button
                            onClick={() => setView('board')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'board' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutGrid size={16} />
                            Board
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <List size={16} />
                            List
                        </button>
                    </div>
                    <button onClick={() => setIsTaskModalOpen(true)} className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 shadow-lg shadow-primary/20 py-3 sm:py-2 text-sm">
                        <Plus size={18} />
                        Add Task
                    </button>
                </div>
            </header>

            {view === 'board' ? (
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0">
                    {columns.map(column => (
                        <div key={column} className="flex flex-col gap-4 min-w-full md:min-w-[320px] lg:flex-1">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-slate-800 uppercase tracking-widest text-[10px] md:text-xs">{column}</h3>
                                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-black italic">
                                        {tasks.filter(t => t.status === column).length}
                                    </span>
                                </div>
                                <button onClick={() => setIsTaskModalOpen(true)} className="text-slate-400 hover:text-slate-600"><Plus size={14} /></button>
                            </div>

                            <div className="flex flex-col gap-4 min-h-[400px] md:min-h-[500px] p-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                {tasks.filter(t => t.status === column).map(task => (
                                    <div key={task._id} className="card group hover:shadow-md transition-all hover:border-primary/20 p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${task.priority === 'High' ? 'bg-red-100 text-red-600' :
                                                task.priority === 'Medium' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-blue-100 text-blue-600'
                                                }`}>
                                                {task.priority}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={task.status}
                                                    disabled={!canUpdateTask(task)}
                                                    onChange={(e) => updateStatus(task._id, e.target.value)}
                                                    className={`text-[9px] bg-white border border-slate-200 rounded px-1 outline-none font-bold ${!canUpdateTask(task) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title={!canUpdateTask(task) ? "Only the assigned user can update status" : ""}
                                                >
                                                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                {canDeleteTask(task) && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
                                                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                                                        title="Delete Task"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                                <button className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity">
                                                    <MoreVertical size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-slate-800 mb-4 group-hover:text-primary transition-colors text-sm">{task.title}</h4>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-200 flex items-center justify-center text-[7px] md:text-[8px] font-bold">
                                                    {task.assignedTo?.name?.charAt(0) || 'U'}
                                                </div>
                                                <span className="text-[10px] md:text-xs text-slate-500 font-medium">{task.assignedTo?.name?.split(' ')[0] || 'Unassigned'}</span>
                                            </div>
                                            <div className="text-slate-300">
                                                <BarChart3 size={12} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card overflow-x-auto p-0">
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-4 md:px-6 py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Task</th>
                                <th className="px-4 md:px-6 py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 md:px-6 py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                                <th className="px-4 md:px-6 py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Assignee</th>
                                <th className="px-4 md:px-6 py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tasks.map(task => (
                                <tr key={task._id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-4 md:px-6 py-4 font-bold text-slate-800 text-sm">{task.title}</td>
                                    <td className="px-4 md:px-6 py-4">
                                        <select
                                            value={task.status}
                                            disabled={!canUpdateTask(task)}
                                            onChange={(e) => updateStatus(task._id, e.target.value)}
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold appearance-none outline-none ${!canUpdateTask(task) ? 'opacity-50 cursor-not-allowed' : ''} ${task.status === 'Done' ? 'bg-emerald-100 text-emerald-600' :
                                                task.status === 'In Progress' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-slate-100 text-slate-500'
                                                }`}
                                            title={!canUpdateTask(task) ? "Only the assigned user can update status" : ""}
                                        >
                                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600">{task.priority}</td>
                                    <td className="px-4 md:px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-200 flex items-center justify-center text-[7px] md:text-[8px] font-bold">
                                                {task.assignedTo?.name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="text-xs md:text-sm text-slate-700">{task.assignedTo?.name?.split(' ')[0] || 'Unassigned'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1 md:gap-2">
                                            {canDeleteTask(task) && (
                                                <button
                                                    onClick={() => handleDeleteTask(task._id)}
                                                    className="p-1.5 md:p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                    title="Delete Task"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                            <button className="p-1.5 md:p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                                                <MoreVertical size={14} className="text-slate-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Task Creation Modal */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Add New Task</h2>
                            <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold">{error}</div>}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Task Title</label>
                                <input
                                    required
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder="e.g. Layout Design"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Description</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all outline-none min-h-[80px]"
                                    placeholder="Task details..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Priority</label>
                                    <select
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Due Date</label>
                                    <input
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Assign To (Email)</label>
                                <input
                                    type="email"
                                    value={newTask.assignedToEmail}
                                    onChange={(e) => setNewTask({ ...newTask, assignedToEmail: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder="teammate@example.com"
                                />
                            </div>
                            <button type="submit" className="w-full btn-primary py-4 mt-4 shadow-lg shadow-primary/20">
                                Add Task
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetail;
