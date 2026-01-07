import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Bell, LogOut, Search, User, X, Menu as MenuIcon } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import api from '../services/api';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (user?._id) {
            // Only attempt socket connection if not on Vercel or if we specifically want it
            // Vercel doesn't support Socket.io, so we avoid the 404 spam.
            if (window.location.hostname.includes('vercel.app')) {
                console.log('Socket.io disabled on Vercel environment');
                return;
            }

            const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
                transports: ['websocket', 'polling']
            });
            socket.emit('join', user._id);

            socket.on('notification', (data) => {
                setNotifications((prev: any[]) => [{ details: data.details, createdAt: new Date() }, ...prev]);
            });

            socket.on('connect_error', (err) => {
                console.warn('Socket connection error, falling back to REST:', err.message);
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
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
                </button>

                <div className="relative group hidden lg:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 bg-background border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 w-48 transition-all"
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
                        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-surface rounded-2xl shadow-2xl border border-slate-100 py-2 animate-in slide-in-from-top-2 duration-200">
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

                <div className="h-8 w-px bg-slate-100 mx-1 sm:mx-2 hidden sm:block"></div>

                <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center gap-2 hover:bg-slate-50 p-1 sm:pr-3 rounded-xl transition-colors">
                        <div className="w-8 h-8 rounded-full border border-slate-200 bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">
                            {initials}
                        </div>
                        <span className="text-sm font-semibold text-slate-700 hidden sm:block">{user?.name?.split(' ')[0] || 'User'}</span>
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

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 top-16 bg-surface z-40 md:hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col p-6 gap-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-bold transition-all ${location.pathname === item.path
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <item.icon size={24} />
                                {item.name}
                            </Link>
                        ))}
                        <hr className="my-2 border-slate-100" />
                        <button
                            onClick={() => {
                                logout();
                                window.location.href = '/login';
                            }}
                            className="flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-bold text-red-500 hover:bg-red-50 transition-all"
                        >
                            <LogOut size={24} />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
