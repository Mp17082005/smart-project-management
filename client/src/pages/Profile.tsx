import { useState, useEffect } from 'react';
import { User, Mail, Shield, Settings, Bell, ChevronRight, Moon, Sun, X, FolderKanban, Edit, Trash2 } from 'lucide-react';
import { userService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/api';

const Profile = () => {
    const [stats, setStats] = useState({ projects: 0, tasks: 0, completedTasks: 0 });
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [myProjects, setMyProjects] = useState<any[]>([]);
    const [editingProject, setEditingProject] = useState<any>(null);
    const [projectForm, setProjectForm] = useState({ title: '', description: '', deadline: '' });
    const { theme, toggleTheme } = useTheme();
    const { refreshUser } = useAuth();

    const [accountForm, setAccountForm] = useState({ name: '', email: '' });
    const [savingAccount, setSavingAccount] = useState(false);
    const [accountError, setAccountError] = useState('');
    const [accountSuccess, setAccountSuccess] = useState('');

    // Notification states (mock)
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        taskAssigned: true,
        statusUpdate: true
    });

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const [profileRes, statsRes] = await Promise.all([
                userService.getProfile(),
                userService.getStats()
            ]);
            setUser(profileRes.data);
            setAccountForm({
                name: profileRes.data?.name || '',
                email: profileRes.data?.email || ''
            });
            setStats(statsRes.data);

            // Fetch projects and filter for created ones
            const projectsRes = await projectService.getProjects();
            setMyProjects(projectsRes.data.filter((p: any) => p.createdBy === profileRes.data?._id));
        } catch (err) {
            console.error('Error fetching profile data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAccount = async () => {
        setAccountError('');
        setAccountSuccess('');
        setSavingAccount(true);
        try {
            const res = await userService.updateProfile({
                name: accountForm.name,
                email: accountForm.email,
            });
            setUser(res.data);
            await refreshUser();
            setAccountSuccess('Profile updated successfully.');
        } catch (err: any) {
            setAccountError(err.response?.data?.msg || 'Failed to update profile.');
        } finally {
            setSavingAccount(false);
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!window.confirm('Are you sure you want to delete this project? All associated tasks will also be deleted.')) return;
        try {
            await projectService.deleteProject(projectId);
            setMyProjects(prev => prev.filter(p => p._id !== projectId));
            alert('Project deleted successfully.');
        } catch (err: any) {
            console.error('Error deleting project:', err);
            alert(err.response?.data?.msg || 'Failed to delete project.');
        }
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await projectService.updateProject(editingProject._id, projectForm);
            setMyProjects(prev => prev.map(p => p._id === editingProject._id ? { ...p, ...projectForm } : p));
            setEditingProject(null);
            alert('Project updated successfully.');
        } catch (err: any) {
            console.error('Error updating project:', err);
            alert(err.response?.data?.msg || 'Failed to update project.');
        }
    };

    const startEditing = (project: any) => {
        setEditingProject(project);
        setProjectForm({
            title: project.title,
            description: project.description,
            deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ''
        });
    };

    const settingsOptions = [
        { id: 'account', name: "Account Settings", icon: Shield, desc: "Privacy and security preferences" },
        { id: 'projects', name: "My Projects", icon: FolderKanban, desc: "Manage projects you've created" },
        { id: 'notifications', name: "Notifications", icon: Bell, desc: "Email and push notification control" },
        { id: 'general', name: "General Settings", icon: Settings, desc: "Theme and language options" },
    ];

    if (loading) return <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;

    const initials = user?.name ? user.name.charAt(0) : "?";

    const renderSettingDetail = () => {
        switch (activeSection) {
            case 'general':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <p className="font-bold text-slate-800">Theme Preference</p>
                                <p className="text-sm text-slate-500">Switch between light and dark mode</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-2 px-4 py-2 bg-white shadow-sm border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-700"
                            >
                                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <p className="font-bold text-slate-800">Language</p>
                                <p className="text-sm text-slate-500">English (United States)</p>
                            </div>
                            <button className="text-primary font-bold text-sm">Change</button>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        {Object.entries(notifications).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="font-bold text-slate-800 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                <button
                                    onClick={() => setNotifications(prev => ({ ...prev, [key]: !val }))}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${val ? 'bg-primary' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${val ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                        ))}
                    </div>
                );
            case 'account':
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        {accountError && (
                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">{accountError}</div>
                        )}
                        {accountSuccess && (
                            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-bold">{accountSuccess}</div>
                        )}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
                            <input
                                type="text"
                                value={accountForm.name}
                                onChange={(e) => setAccountForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
                            <input
                                type="email"
                                value={accountForm.email}
                                onChange={(e) => setAccountForm((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <button
                            onClick={handleSaveAccount}
                            disabled={savingAccount}
                            className="btn-primary w-full mt-4 disabled:opacity-50"
                        >
                            {savingAccount ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                );
            case 'projects':
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        {myProjects.length === 0 ? (
                            <div className="py-10 text-center text-slate-400">
                                <FolderKanban size={48} className="mx-auto mb-4 opacity-20" />
                                <p>You haven't created any projects yet.</p>
                            </div>
                        ) : (
                            myProjects.map((project) => (
                                <div key={project._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h4 className="font-bold text-slate-800 truncate">{project.title}</h4>
                                        <p className="text-xs text-slate-500 truncate">{project.description}</p>
                                        <div className="mt-2 flex items-center gap-3">
                                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono font-bold">
                                                {project.token}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                                                {project.taskCount || 0} Tasks
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => startEditing(project)}
                                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                                            title="Edit Project"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProject(project._id)}
                                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                                            title="Delete Project"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                );
            default:
                return (
                    <div className="space-y-4">
                        {settingsOptions.map((option, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveSection(option.id)}
                                className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-all group"
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className="p-3 bg-white shadow-sm rounded-xl text-primary group-hover:scale-110 transition-transform">
                                        <option.icon size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{option.name}</p>
                                        <p className="text-xs text-slate-500">{option.desc}</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>
                );
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <header>
                <h1 className="text-3xl font-black text-slate-900">Your Profile</h1>
                <p className="text-slate-500 mt-1">Manage your account settings and preferences.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="card text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary to-primary-light"></div>
                        <div className="relative pt-8">
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg mx-auto bg-primary text-white flex items-center justify-center text-5xl font-black">
                                {initials}
                            </div>
                            <h2 className="mt-4 text-2xl font-black text-slate-900">{user?.name}</h2>
                            <span className="inline-block px-3 py-1 mt-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                                {user?.role}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-50">
                            <div>
                                <p className="text-2xl font-black text-slate-800">{stats.projects}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase">Projects</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-800">{stats.tasks}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase">Tasks</p>
                            </div>
                        </div>
                    </div>

                    <div className="card space-y-4">
                        <div className="flex items-center gap-3 text-slate-600">
                            <Mail size={18} className="text-slate-400" />
                            <span className="text-sm font-medium">{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <User size={18} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-500">
                                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="card h-full min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">
                                {activeSection ? settingsOptions.find(o => o.id === activeSection)?.name : "Account Settings"}
                            </h3>
                            {activeSection && (
                                <button
                                    onClick={() => setActiveSection(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-slate-400" />
                                </button>
                            )}
                        </div>
                        {renderSettingDetail()}
                    </div>
                </div>
            </div>

            {/* Edit Project Modal */}
            {editingProject && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Edit Project</h2>
                            <button onClick={() => setEditingProject(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateProject} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Project Title</label>
                                <input
                                    required
                                    type="text"
                                    value={projectForm.title}
                                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Description</label>
                                <textarea
                                    value={projectForm.description}
                                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all outline-none min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Deadline (Optional)</label>
                                <input
                                    type="date"
                                    value={projectForm.deadline}
                                    onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                            <button type="submit" className="w-full btn-primary py-4 mt-4 shadow-lg shadow-primary/20">
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
