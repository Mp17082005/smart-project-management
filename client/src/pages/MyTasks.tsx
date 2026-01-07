import { useState, useEffect } from 'react';
import {
    CheckCircle2,
    AlertCircle,
    Calendar,
    Filter,
    Search as SearchIcon
} from 'lucide-react';
import { taskService } from '../services/api';

const MyTasks = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        try {
            // In a real app, we'd have a specific endpoint for user's tasks
            // For now, we'll fetch all tasks or stats might suffice if we had a /tasks/me
            const res = await taskService.getTasks('all'); // Assuming backend handles 'all' or we'll add it
            // Filter by user ID if needed, but for now let's assume it returns current user's tasks
            setTasks(res.data);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (taskId: string, newStatus: string) => {
        try {
            await taskService.updateTaskStatus(taskId, newStatus);
            fetchMyTasks();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.projectId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">My Tasks</h1>
                    <p className="text-slate-500 mt-1">Focus on what's next. You have {filteredTasks.length} tasks assigned.</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Filter tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-64 outline-none"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                        <Filter size={16} />
                        Filters
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {filteredTasks.map((task) => (
                    <div key={task._id} className="card group hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => updateStatus(task._id, task.status === 'Done' ? 'To Do' : 'Done')}
                                className={`p-2 rounded-lg transition-colors ${task.status === 'Done' ? 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 group-hover:text-primary'}`}
                            >
                                <CheckCircle2 size={24} />
                            </button>
                            <div>
                                <h4 className="font-bold text-slate-800">{task.title}</h4>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{task.projectId?.title || 'Project'}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 md:gap-12">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</span>
                                <span className={`text-xs font-bold ${task.priority === 'High' ? 'text-red-500' :
                                    task.priority === 'Medium' ? 'text-amber-500' :
                                        'text-blue-500'
                                    }`}>
                                    {task.priority}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1 text-right">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</span>
                                <div className={`flex items-center gap-1.5 text-xs font-bold ${new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-red-500' : 'text-slate-600'}`}>
                                    {new Date(task.dueDate) < new Date() && task.status !== 'Done' ? <AlertCircle size={12} /> : <Calendar size={12} />}
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 min-w-[100px]">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</span>
                                <select
                                    value={task.status}
                                    onChange={(e) => updateStatus(task._id, e.target.value)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-center appearance-none outline-none ${task.status === 'Done' ? 'bg-emerald-100 text-emerald-600' :
                                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-600' :
                                            'bg-slate-100 text-slate-500'
                                        }`}
                                >
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredTasks.length === 0 && (
                    <div className="py-20 text-center text-slate-400 font-medium">No tasks found</div>
                )}
            </div>
        </div>
    );
};

export default MyTasks;
