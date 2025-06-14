import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from '../axios';
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { Video, MessageSquare, AlertTriangle, Clock, User, Phone, Bell, Activity, Shield, Heart, Zap, Eye, CheckCircle, AlertCircle, Wifi, Signal, Battery, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VideoCall = () => {
    const { user } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        // Update current time every second
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Connect to socket server
        const socket = io("https://agpatil.onrender.com/");

        if (user?.role === "doctor") {
            // Listen for emergency notifications
            socket.on("emergencyNotification", (data) => {
                toast.info(`Emergency consultation requested by ${data.patientName}`, {
                    position: "top-right",
                    autoClose: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    onClick: () => handleAcceptEmergency(data.roomId),
                });

                // Add notification to state
                setNotifications((prev) => [...prev, data]);
            });

            // Fetch existing notifications on mount
            fetchEmergencyNotifications();
        }

        return () => {
            socket.disconnect();
            clearInterval(timer);
        };
    }, [user]);

    const fetchEmergencyNotifications = async () => {
        try {
            const { data } = await axios.get("/emergency/notifications");
            setNotifications(data.notifications);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleEmergencyConsultation = async () => {
        try {
            setLoading(true);

            window.location.href = "https://video-call-final-git-main-orthodox-64s-projects.vercel.app/?roomID=emergency";
            await axios.post("/emergency/notify");
        } catch (error) {
            console.error("Error creating emergency consultation:", error);
            toast.error("Failed to initiate emergency consultation");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptEmergency = (roomId) => {
        window.location.href = `https://video-call-final-git-main-orthodox-64s-projects.vercel.app/?roomID=${roomId}`;
    };

    const navigateToChat = () => {
        navigate('/chat');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
            {user?.role === "doctor" ? (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-blue-200/20 via-transparent to-transparent animate-pulse"></div>
                        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-red-200/20 via-transparent to-transparent animate-pulse delay-1000"></div>

                        {/* Floating particles */}
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-blue-600/20 rounded-full animate-float"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 5}s`,
                                    animationDuration: `${3 + Math.random() * 4}s`
                                }}
                            ></div>
                        ))}
                    </div>

                    <div className="relative z-10 p-6">
                        {/* Top Status Bar */}
                        <div className="max-w-7xl mx-auto mb-6">
                            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-lg rounded-2xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-6">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-green-600 text-sm font-medium">SYSTEM ONLINE</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Wifi className="w-4 h-4 text-blue-600" />
                                            <span className="text-blue-600 text-sm">Connected</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Signal className="w-4 h-4 text-green-600" />
                                            <span className="text-green-600 text-sm">Strong Signal</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <div className="text-gray-900 font-bold text-lg">
                                                {currentTime.toLocaleTimeString()}
                                            </div>
                                            <div className="text-blue-600 text-sm">
                                                {currentTime.toLocaleDateString()}
                                            </div>
                                        </div>
                                        <Battery className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Header Section */}
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-8">
                                <div className="flex items-center justify-center mb-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-red-200/50 rounded-full blur-xl animate-pulse"></div>
                                        <div className="relative p-4 bg-gradient-to-r from-red-100 to-red-200 rounded-full border border-red-300/50 shadow-lg">
                                            <Shield className="w-10 h-10 text-red-600" />
                                        </div>
                                    </div>
                                    <div className="ml-6">
                                        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-blue-700 to-indigo-800 drop-shadow-lg">
                                            EMERGENCY CONSOLE
                                        </h1>
                                        <div className="flex items-center justify-center mt-2 space-x-4">
                                            <div className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent w-20"></div>
                                            <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                                            <div className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent w-20"></div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-xl font-light tracking-wide">
                                    Advanced Medical Emergency Management System
                                </p>
                            </div>

                            {/* Enhanced Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                {/* Active Emergencies Card */}
                                <div className="group relative bg-gradient-to-br from-red-50 via-red-100/50 to-red-200/30 backdrop-blur-xl border border-red-200/50 shadow-xl rounded-3xl p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-red-200/50">
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-100/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-red-200/50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                                <AlertTriangle className="w-8 h-8 text-red-600" />
                                            </div>
                                            {notifications.length > 0 && (
                                                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                                            )}
                                        </div>
                                        <p className="text-red-700 text-sm font-semibold tracking-wider uppercase">Active Emergencies</p>
                                        <p className="text-4xl font-black text-gray-900 mt-2">{notifications.length}</p>
                                        <div className="mt-3 flex items-center space-x-2">
                                            <div className="flex-1 bg-red-200/40 rounded-full h-2">
                                                <div className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full" style={{ width: notifications.length > 0 ? '100%' : '0%' }}></div>
                                            </div>
                                            <span className="text-red-600 text-xs font-bold">CRITICAL</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Doctor Status Card */}
                                <div className="group relative bg-gradient-to-br from-green-50 via-green-100/50 to-emerald-200/30 backdrop-blur-xl border border-green-200/50 shadow-xl rounded-3xl p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-green-200/50">
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-green-200/50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                                <Activity className="w-8 h-8 text-green-600 animate-pulse" />
                                            </div>
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                        </div>
                                        <p className="text-green-700 text-sm font-semibold tracking-wider uppercase">Doctor Status</p>
                                        <p className="text-4xl font-black text-gray-900 mt-2">ONLINE</p>
                                        <div className="mt-3 flex items-center space-x-2">
                                            <div className="flex-1 bg-green-200/40 rounded-full h-2">
                                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-full animate-pulse"></div>
                                            </div>
                                            <span className="text-green-600 text-xs font-bold">READY</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Response Time Card */}
                                <div className="group relative bg-gradient-to-br from-blue-50 via-blue-100/50 to-cyan-200/30 backdrop-blur-xl border border-blue-200/50 shadow-xl rounded-3xl p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-200/50">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-blue-200/50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                                <Clock className="w-8 h-8 text-blue-600" />
                                            </div>
                                            <Zap className="w-6 h-6 text-yellow-500 animate-bounce" />
                                        </div>
                                        <p className="text-blue-700 text-sm font-semibold tracking-wider uppercase">Avg Response</p>
                                        <p className="text-4xl font-black text-gray-900 mt-2">&lt; 90s</p>
                                        <div className="mt-3 flex items-center space-x-2">
                                            <div className="flex-1 bg-blue-200/40 rounded-full h-2">
                                                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-3/4"></div>
                                            </div>
                                            <span className="text-blue-600 text-xs font-bold">OPTIMAL</span>
                                        </div>
                                    </div>
                                </div>

                                {/* System Health Card */}
                                <div className="group relative bg-gradient-to-br from-purple-50 via-purple-100/50 to-indigo-200/30 backdrop-blur-xl border border-purple-200/50 shadow-xl rounded-3xl p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-200/50">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-purple-200/50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                                <Monitor className="w-8 h-8 text-purple-600" />
                                            </div>
                                            <Eye className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <p className="text-purple-700 text-sm font-semibold tracking-wider uppercase">System Health</p>
                                        <p className="text-4xl font-black text-gray-900 mt-2">100%</p>
                                        <div className="mt-3 flex items-center space-x-2">
                                            <div className="flex-1 bg-purple-200/40 rounded-full h-2">
                                                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full w-full"></div>
                                            </div>
                                            <span className="text-purple-600 text-xs font-bold">PERFECT</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Emergency Notifications */}
                            <div className="bg-white/90 backdrop-blur-2xl border border-gray-200/50 shadow-2xl rounded-3xl p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-red-200/50 rounded-full blur-lg animate-pulse"></div>
                                            <Bell className="relative w-8 h-8 text-red-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-red-600">
                                                EMERGENCY REQUESTS
                                            </h2>
                                            <p className="text-gray-500 text-sm">Real-time monitoring and response</p>
                                        </div>
                                    </div>
                                    {notifications.length > 0 && (
                                        <div className="flex items-center space-x-3">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-8 bg-red-500 rounded-full animate-pulse"></div>
                                                <div className="w-2 h-6 bg-red-400 rounded-full animate-pulse delay-100"></div>
                                                <div className="w-2 h-4 bg-red-300 rounded-full animate-pulse delay-200"></div>
                                            </div>
                                            <div className="bg-red-100 border border-red-300 rounded-full px-4 py-2">
                                                <span className="text-red-700 text-sm font-bold tracking-wider">URGENT ATTENTION</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {notifications.map((notification, index) => (
                                        <div
                                            key={index}
                                            className="group relative bg-gradient-to-r from-red-50/80 via-white/80 to-red-50/60 backdrop-blur-md border border-red-200/50 shadow-xl rounded-3xl p-8 hover:from-red-100/90 hover:to-red-50/80 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-200/50 transform"
                                        >
                                            {/* Animated Border */}
                                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-red-300/30 via-transparent to-red-300/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>

                                            {/* Emergency Alert Banner */}
                                            <div className="absolute -top-3 left-8 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-full text-xs font-black tracking-widest shadow-lg">
                                                🚨 MEDICAL EMERGENCY
                                            </div>

                                            {/* Urgency Indicators */}
                                            <div className="absolute top-6 right-6 flex items-center space-x-3">
                                                <div className="flex items-center space-x-2">
                                                    {[...Array(3)].map((_, i) => (
                                                        <div key={i} className="w-2 h-2 bg-red-500 rounded-full animate-ping" style={{ animationDelay: `${i * 200}ms` }}></div>
                                                    ))}
                                                </div>
                                                <div className="bg-red-100 border border-red-400 rounded-xl px-3 py-1">
                                                    <span className="text-red-700 text-xs font-black tracking-wider">CRITICAL</span>
                                                </div>
                                            </div>

                                            <div className="relative flex items-start justify-between pt-6">
                                                <div className="flex items-start space-x-6 flex-1">
                                                    {/* Enhanced Patient Avatar */}
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-blue-200/50 rounded-full blur-lg animate-pulse"></div>
                                                        <div className="relative p-4 bg-gradient-to-r from-blue-100 to-indigo-200 rounded-full border-2 border-blue-300/50 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                            <User className="w-8 h-8 text-blue-700" />
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                                                    </div>

                                                    {/* Enhanced Patient Info */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-4 mb-4">
                                                            <h3 className="text-2xl font-black text-gray-800">
                                                                Patient: {notification.patientName}
                                                            </h3>
                                                            <div className="bg-yellow-100 border border-yellow-400 rounded-lg px-3 py-1">
                                                                <span className="text-yellow-700 text-sm font-bold">HIGH PRIORITY</span>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                                            <div className="flex items-center space-x-3">
                                                                <Clock className="w-5 h-5 text-blue-600" />
                                                                <div>
                                                                    <p className="text-gray-500 text-xs uppercase tracking-wider">Requested</p>
                                                                    <p className="text-blue-700 font-semibold">
                                                                        {new Date(notification.createdAt).toLocaleTimeString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <AlertCircle className="w-5 h-5 text-red-600" />
                                                                <div>
                                                                    <p className="text-gray-500 text-xs uppercase tracking-wider">Status</p>
                                                                    <p className="text-red-700 font-semibold">AWAITING RESPONSE</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Emergency Details */}
                                                        <div className="bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 rounded-2xl p-6 mb-6">
                                                            <div className="flex items-center space-x-3 mb-3">
                                                                <Heart className="w-5 h-5 text-red-600 animate-pulse" />
                                                                <p className="text-red-700 font-bold">Emergency Medical Consultation Required</p>
                                                            </div>
                                                            <p className="text-gray-700 leading-relaxed">
                                                                Patient requires immediate medical attention and professional assessment.
                                                                Time-sensitive consultation needed for proper diagnosis and treatment guidance.
                                                            </p>
                                                            <div className="mt-4 flex items-center justify-between">
                                                                <div className="flex items-center space-x-4 text-sm">
                                                                    <span className="text-red-600">⏱️ Response Target: &lt; 2 min</span>
                                                                    <span className="text-yellow-600">⚡ Critical Priority</span>
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    ID: EMG-{notification.createdAt ? new Date(notification.createdAt).getTime().toString().slice(-6) : '000000'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Enhanced Action Button */}
                                                <div className="ml-8">
                                                    <button
                                                        onClick={() => handleAcceptEmergency("emergency")}
                                                        className="group relative bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-400 hover:via-green-500 hover:to-emerald-500 text-white font-black py-6 px-10 rounded-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:shadow-green-300/50 focus:outline-none focus:ring-4 focus:ring-green-400/50"
                                                    >
                                                        <div className="flex items-center space-x-4">
                                                            <div className="relative">
                                                                <Phone className="w-6 h-6 group-hover:animate-bounce" />
                                                                <div className="absolute inset-0 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                                                            </div>
                                                            <div className="text-left">
                                                                <div className="text-lg">Accept Call</div>
                                                                <div className="text-xs opacity-75">Connect Now</div>
                                                            </div>
                                                        </div>

                                                        {/* Enhanced Button Effects */}
                                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/50 to-emerald-500/50 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10"></div>
                                                        <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {notifications.length === 0 && (
                                        <div className="text-center py-20">
                                            <div className="relative mb-8">
                                                <div className="absolute inset-0 bg-green-200/40 rounded-full blur-2xl animate-pulse"></div>
                                                <div className="relative p-8 bg-gradient-to-r from-green-50 to-emerald-100 rounded-full w-32 h-32 mx-auto flex items-center justify-center border border-green-200 shadow-lg">
                                                    <Shield className="w-16 h-16 text-green-600" />
                                                </div>
                                            </div>
                                            <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-4">
                                                ALL SYSTEMS CLEAR
                                            </h3>
                                            <p className="text-gray-600 text-xl mb-8 max-w-md mx-auto leading-relaxed">
                                                No emergency requests at the moment. All medical channels are operational and ready.
                                            </p>
                                            <div className="bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-8 max-w-lg mx-auto shadow-lg">
                                                <div className="grid grid-cols-1 gap-4 text-left">
                                                    <div className="flex items-center space-x-3">
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                        <span className="text-green-700">Emergency monitoring system active</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                        <span className="text-green-700">Real-time notification system operational</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                        <span className="text-green-700">Video call infrastructure ready</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                        <span className="text-green-700">Doctor availability confirmed</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Enhanced Footer */}
                            <div className="mt-12 text-center">
                                <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-lg rounded-2xl p-6">
                                    <div className="flex items-center justify-center space-x-8 mb-4">
                                        <div className="flex items-center space-x-2">
                                            <Shield className="w-4 h-4 text-blue-600" />
                                            <span className="text-blue-700 text-sm">Secure Healthcare Platform</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Activity className="w-4 h-4 text-green-600" />
                                            <span className="text-green-700 text-sm">Real-time Monitoring</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Heart className="w-4 h-4 text-red-600" />
                                            <span className="text-red-700 text-sm">Emergency Ready</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        Advanced Emergency Medical Console • Powered by AgPatil Healthcare Solutions
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-16xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-6xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                            Telemedicine
                            <span className="block text-blue-600">Consultation Portal</span>
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                            Connect with healthcare professionals through video or chat consultations
                        </p>
                    </div>

                    {/* Consultation Options Grid */}
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
                        {/* Chat Consultation Card */}
                        <div
                            onClick={navigateToChat}
                            className="relative group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="px-6 py-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 bg-green-50 rounded-2xl">
                                        <MessageSquare size={28} className="text-green-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                        Chat
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Chat Consultation</h3>
                                <p className="text-gray-600 mb-6">
                                    Text-based consultation for non-emergency medical advice
                                </p>
                                <div className="flex items-center text-green-600 font-semibold">
                                    Start Chat
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Consultation Card */}
                        <div
                            onClick={handleEmergencyConsultation}
                            className="relative group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="px-6 py-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-3 bg-red-50 rounded-2xl">
                                        <AlertTriangle size={28} className="text-red-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                        Emergency
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Emergency Consultation</h3>
                                <p className="text-gray-600 mb-6">
                                    Immediate video consultation for urgent medical concerns
                                </p>
                                <div className="flex items-center text-red-600 font-semibold">
                                    {loading ? "Connecting..." : "Start Emergency"}
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Notice */}
                    <div className="mt-16 text-center">
                        <p className="text-sm text-gray-500">
                            For life-threatening emergencies, please call your local emergency services immediately.
                        </p>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};

export default VideoCall;