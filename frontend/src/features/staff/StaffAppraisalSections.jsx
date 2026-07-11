import React from 'react';
import { useLocation } from 'react-router-dom';
import { Clock, CheckCircle2, TrendingUp, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { StaffAppraisalProfile } from './StaffAppraisalProfile';
import EvaluationForm from './StaffAppraisalEvaluation.tsx';

const mockPerformanceData = [
    { year: '2021', score: 65 },
    { year: '2022', score: 72 },
    { year: '2023', score: 78 },
    { year: '2024', score: 85 },
    { year: '2025', score: 89 },
];

const mockRecentActivity = [
    { id: 1, title: 'Supervisor review completed', date: '2 days ago', status: 'info', icon: FileText },
    { id: 2, title: 'Part A submitted', date: '1 week ago', status: 'success', icon: CheckCircle2 },
    { id: 3, title: 'New evaluation period opened', date: '2 weeks ago', status: 'warning', icon: Clock },
];

function AppraisalDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Staff Dashboard</h1>
                    <p className="text-slate-500">Welcome back, here's your evaluation overview.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                    Start New Evaluation
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-medium text-slate-500">Current Status</span>
                        <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-amber-500">Under Review</h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-medium text-slate-500">Last Evaluation</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="flex items-baseline gap-1">
                        <h3 className="text-2xl font-bold text-slate-900">89</h3>
                        <span className="text-sm text-slate-400">/ 100 points</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-medium text-slate-500">Promotion Eligibility</span>
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-blue-600 mb-1">Eligible</h3>
                        <p className="text-xs text-slate-500">Next rank: CONTISS 12</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-medium text-slate-500">Pending Action</span>
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Sign APER Form</h3>
                        <p className="text-xs text-slate-500">Due by Oct 30</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Performance History</h3>
                        <p className="text-sm text-slate-500">Your evaluation scores over the last 5 years.</p>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#0f1c2f', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                        <p className="text-sm text-slate-500">Latest updates on your evaluations.</p>
                    </div>
                    <div className="space-y-6">
                        {mockRecentActivity.map((activity) => (
                            <div key={activity.id} className="flex gap-4 items-start">
                                <div className={`mt-1 p-2 rounded-full shrink-0 ${
                                    activity.status === 'success' ? 'bg-emerald-50 text-emerald-500' :
                                    activity.status === 'warning' ? 'bg-amber-50 text-amber-500' :
                                    activity.status === 'error' ? 'bg-red-50 text-red-500' :
                                    'bg-blue-50 text-blue-500'
                                }`}>
                                    <activity.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">{activity.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


function MyAppraisals() {
    return (
        <div className="animate-in fade-in">
            <EvaluationForm />
        </div>
    );
}

export function StaffAppraisalSections() {
    const location = useLocation();
    const pathParts = location.pathname.split('/');
    const subSection = pathParts[3]; // e.g., 'dashboard', 'my-appraisals', 'profile'
    
    if (subSection === 'my-appraisals') {
        return <MyAppraisals />;
    }
    
    if (subSection === 'profile') {
        return <StaffAppraisalProfile />;
    }
    
    return <AppraisalDashboard />;
}
