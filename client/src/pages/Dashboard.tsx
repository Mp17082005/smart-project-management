import { useState, useEffect } from 'react';
import { Plus, Clock, LayoutDashboard, X, Check } from 'lucide-react';
import { projectService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [tokenToShow, setTokenToShow] = useState<string | null>(null);
    const [joinToken, setJoinToken] = useState('');
    const [newProject, setNewProject] = useState({ title: '', description: '', deadline: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await projectService.getProjects();
            setProjects(res.data);
        } catch (err) {
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const [error, setError] = useState('');

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await projectService.createProject(newProject);
            setIsModalOpen(false);
            setNewProject({ title: '', description: '', deadline: '' });
            setTokenToShow(res.data.token);
            fetchProjects();
        } catch (err: any) {
            console.error('Error creating project:', err);
            setError(err.response?.data?.msg || 'Failed to create project. Please try again.');
        }
    };

    const handleJoinProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await projectService.joinProject(joinToken);
            setIsJoinModalOpen(false);
            setJoinToken('');
            fetchProjects();
            alert('Successfully joined the project! 🎉');
        } catch (err: any) {
            console.error('Error joining project:', err);
            setError(err.response?.data?.msg || 'Failed to join project. Check your token.');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-sans">Projects</h1>
                    <p className="text-slate-500 mt-1">Manage and track all your active projects here.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsJoinModalOpen(true)}
                        className="px-6 py-2 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-all"
                    >
                        Join Project
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2 group shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                        Create Project
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div
                        key={project._id}
                        onClick={() => navigate(`/project/${project._id}`)}
                        className="card group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                <LayoutDashboard size={24} />
                            </div>
                            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(project.updatedAt).toLocaleDateString()}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mb-2 truncate">{project.title}</h3>
                        <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">{project.description}</p>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end text-sm">
                                <span className="font-semibold text-slate-700">{project.progress || 0}% Complete</span>
                                <span className="text-slate-500">{project.completedCount || 0}/{project.taskCount || 0} Tasks</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-1000 ease-out"
                                    style={{ width: `${project.progress || 0}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {project.members?.map((member: any, idx: number) => (
                                    <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[10px] font-bold shadow-sm overflow-hidden">
                                        {member.name?.charAt(0) || member.email?.charAt(0)}
                                    </div>
                                ))}
                            </div>
                            <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-mono font-bold">
                                {project.token}
                            </div>
                        </div>
                    </div>
                ))}

                {projects.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                            <Plus size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No projects yet</h3>
                        <p className="text-slate-500 mt-2 max-w-sm">Create your first project or join one with a token to start collaborating 🚀</p>
                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setIsJoinModalOpen(true)} className="px-6 py-2 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-all">Join Project</button>
                            <button onClick={() => setIsModalOpen(true)} className="btn-primary">Create Initial Project</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Create New Project</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold">{error}</div>}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Project Title</label>
                                <input
                                    required
                                    type="text"
                                    value={newProject.title}
                                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder="e.g. Design System"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Description</label>
                                <textarea
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all outline-none min-h-[100px]"
                                    placeholder="Briefly describe the project goals..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Deadline (Optional)</label>
                                <input
                                    type="date"
                                    value={newProject.deadline}
                                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                            <button type="submit" className="w-full btn-primary py-4 mt-4 shadow-lg shadow-primary/20">
                                Create Project
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Join Project Modal */}
            {isJoinModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Join Project</h2>
                            <button onClick={() => setIsJoinModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleJoinProject} className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold">{error}</div>}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Invite Token</label>
                                <input
                                    required
                                    type="text"
                                    value={joinToken}
                                    onChange={(e) => setJoinToken(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-center text-2xl font-mono tracking-widest uppercase"
                                    placeholder="TOKEN1"
                                />
                                <p className="text-xs text-slate-400 text-center">Enter the 6-character token shared by the project creator.</p>
                            </div>
                            <button type="submit" className="w-full btn-primary py-4 mt-4 shadow-lg shadow-primary/20">
                                Join Project
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Token Popup After Creation */}
            {tokenToShow && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-sm shadow-2xl p-10 text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Project Created!</h2>
                        <p className="text-slate-500 mb-8">Remember this token, only people with this token can access your project.</p>

                        <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl mb-8 group relative">
                            <p className="text-4xl font-black text-primary tracking-widest font-mono">{tokenToShow}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Project Token</p>
                        </div>

                        <button
                            onClick={() => setTokenToShow(null)}
                            className="btn-primary w-full py-4 text-lg"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
