import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MessageSquare, User, Heart, FileText, Video, Star, Search, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMeetings: 0,
    upcomingMeetings: 0,
    completedMeetings: 0,
    unreadNotifications: 0
  });

  useEffect(() => {
    fetchUserInfo();
    fetchNotifications();
    fetchStats();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login/patient');
        return;
      }
      
      // Decode token to get user info (simple approach)
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: payload.id,
        name: payload.name || 'Patient',
        email: payload.email || '',
        role: payload.role
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
      navigate('/login/patient');
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/meetings/patient/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Find Doctors',
      description: 'Search and connect with mental health professionals',
      icon: Search,
      action: () => navigate('/patient/find-doctors'),
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500'
    },
    {
      title: 'Book Appointment',
      description: 'Schedule a new meeting with your doctor',
      icon: CalendarIcon,
      action: () => navigate('/patient/meetings'),
      color: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500'
    },
    {
      title: 'My Meetings',
      description: 'View and manage your appointments',
      icon: Video,
      action: () => navigate('/patient/meetings'),
      color: 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500'
    },
    {
      title: 'Chat with Doctor',
      description: 'Start a conversation with your doctor',
      icon: MessageSquare,
      action: () => navigate('/patient/chat'),
      color: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500'
    },
    {
      title: 'My Profile',
      description: 'Update your personal information',
      icon: User,
      action: () => navigate('/patient/profile'),
      color: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500'
    },
    {
      title: 'Change Password',
      description: 'Update your account security',
      icon: Lock,
      action: () => navigate('/patient/change-password'),
      color: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500'
    }
  ];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-200">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <Icon className="h-8 w-8 text-emerald-400" />
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, action, color }: any) => (
    <button
      onClick={action}
      className={`${color} text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-left w-full transform hover:scale-105`}
    >
      <div className="flex items-center space-x-4">
        <Icon className="h-8 w-8" />
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </div>
    </button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 relative overflow-hidden font-inter">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md shadow-2xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-600 mb-4">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-emerald-200 text-lg">
                Your health journey continues - we're here to support you every step of the way.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20">
                <MessageSquare className="h-6 w-6 text-emerald-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Meetings"
            value={stats.totalMeetings}
            icon={CalendarIcon}
            color="#10b981"
          />
          <StatCard
            title="Upcoming"
            value={stats.upcomingMeetings}
            icon={Clock}
            color="#06b6d4"
          />
          <StatCard
            title="Completed"
            value={stats.completedMeetings}
            icon={Star}
            color="#0891b2"
          />
          <StatCard
            title="Notifications"
            value={stats.unreadNotifications}
            icon={MessageSquare}
            color="#059669"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            📊 Recent Activity
          </h2>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex-shrink-0">
                    {notification.type === 'meeting' && <CalendarIcon className="h-5 w-5 text-emerald-400" />}
                    {notification.type === 'message' && <MessageSquare className="h-5 w-5 text-cyan-400" />}
                    {notification.type === 'health' && <Heart className="h-5 w-5 text-teal-400" />}
                    {notification.type === 'system' && <FileText className="h-5 w-5 text-emerald-300" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{notification.title}</p>
                    <p className="text-sm text-emerald-200">{notification.message}</p>
                    <p className="text-xs text-emerald-300 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌟</div>
              <p className="text-emerald-200 text-lg">No recent activity to display.</p>
              <p className="text-emerald-300 text-sm">Your health journey activities will appear here.</p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default PatientDashboard;
