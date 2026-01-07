import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Bell, LogOut, Search, User, X } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import api from '../services/api';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const { user, logout } = useAuth();

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (user?._id) {
            const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
            socket.emit('join', user._id);

            socket.on('notification', (data) => {
                setNotifications((prev: any[]) => [{ details: data.details, createdAt: new Date() }, ...prev]);
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/activities');
            setNotifications(res.data.slice(0, 5)); // Show latest 5
        } catch (err) {
            console.error('Error fetching activities:', err);
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    const initials = user?.name ? user.name.charAt(0) : '?';

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-slate-100 z-50 flex items-center justify-between px-6 transition-colors duration-300">
            <div className="flex items-center gap-8">
                <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                    ProjectFlow
                </Link>

                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path
                                ? 'bg-primary/5 text-primary'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative group hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="pl-10 pr-4 py-2 bg-background border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 w-64 transition-all"
                    />
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg relative"
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-surface rounded-2xl shadow-2xl border border-slate-100 py-2 animate-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-2 border-b border-slate-50 flex items-center justify-between">
                                <span className="font-bold text-slate-900">Notifications</span>
                                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((n, i) => (
                                        <div key={i} className="px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 border-slate-100">
                                            <p className="text-sm text-slate-800 font-medium">{n.details}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-slate-400 text-sm">No new notifications</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-slate-100 mx-2"></div>

                <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center gap-2 hover:bg-slate-50 p-1 pr-3 rounded-xl transition-colors">
                        <div className="w-8 h-8 rounded-full border border-slate-200 bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">
                            {initials}
                        </div>
                        <span className="text-sm font-semibold text-slate-700 md:block hidden">{user?.name || 'User'}</span>
                    </Menu.Button>
                    <Transition
                        as={React.Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-surface rounded-xl shadow-lg border border-slate-100 py-1 focus:outline-none">
                            <Menu.Item>
                                {({ active }) => (
                                    <Link
                                        to="/profile"
                                        className={`${active ? 'bg-slate-50' : ''
                                            } flex items-center gap-2 px-4 py-2 text-sm text-slate-700`}
                                    >
                                        <User size={16} />
                                        Your Profile
                                    </Link>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => {
                                            logout();
                                            window.location.href = '/login';
                                        }}
                                        className={`${active ? 'bg-slate-50 text-red-600' : 'text-slate-700'
                                            } flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors`}
                                    >
                                        <LogOut size={16} />
                                        Sign out
                                    </button>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </nav>
    );
};

export default Navbar;
