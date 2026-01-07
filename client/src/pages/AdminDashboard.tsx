import {
    Users,
    Briefcase,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Activity as ActivityIcon,
    ChevronRight
} from 'lucide-react';

const AdminDashboard = () => {
    const stats = [
        { label: "Total Users", value: "1,284", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Active Projects", value: "48", icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Completed Tasks", value: "892", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Pending Tasks", value: "124", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    const recentActivities = [
        { user: "Mahesh", action: "assigned 'UI Design' to", target: "Ananya", time: "2 mins ago" },
        { user: "Rahul", action: "completed task", target: "API Integration", time: "15 mins ago" },
        { user: "Ananya", action: "created new project", target: "Winter Launch", time: "1 hour ago" },
        { user: "Mahesh", action: "left a comment on", target: "Mobile Dev", time: "3 hours ago" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header>
                <h1 className="text-3xl font-black text-slate-900">Admin Control Center</h1>
                <p className="text-slate-500 mt-1">Global overview of system performance and user activity.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Task Completion Analytics (Mock Illustration) */}
                <div className="lg:col-span-2 card">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary" />
                            Task Completion Trend
                        </h3>
                        <select className="bg-slate-50 border-none rounded-lg text-xs font-bold px-3 py-1.5 focus:ring-1 focus:ring-primary/20">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-2">
                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                            <div key={i} className="flex-1 group relative">
                                <div
                                    className="w-full bg-primary/10 group-hover:bg-primary transition-all duration-500 rounded-t-lg"
                                    style={{ height: `${h}%` }}
                                ></div>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h}%
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                {/* Recent Activity Log */}
                <div className="card">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
                        <ActivityIcon size={20} className="text-primary" />
                        Activity Stream
                    </h3>
                    <div className="space-y-6">
                        {recentActivities.map((act, i) => (
                            <div key={i} className="flex gap-4 group cursor-pointer">
                                <div className="relative">
                                    <img src={`https://ui-avatars.com/api/?name=${act.user}&background=random`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm shrink-0" alt={act.user} />
                                    {i !== recentActivities.length - 1 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-6 bg-slate-100"></div>}
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 leading-tight">
                                        <span className="font-bold text-slate-800">{act.user}</span> {act.action} <span className="font-semibold text-primary">{act.target}</span>
                                    </p>
                                    <span className="text-[10px] font-medium text-slate-400">{act.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-3 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/10 transition-all flex items-center justify-center gap-2 group">
                        View All Activity
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
