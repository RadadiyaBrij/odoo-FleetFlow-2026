import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ShieldCheck } from 'lucide-react';

const Drivers = () => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Driver Profiles</h1>
                    <p className="text-slate-400">Compliance, performance, and safety tracking</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={20} /> New Driver
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DriverCard name="Alex Johnson" role="Senior Driver" score={98} status="On Duty" expiry="2026-05-15" />
                <DriverCard name="Sarah Smith" role="Dispatcher" score={95} status="Off Duty" expiry="2025-11-20" />
                <DriverCard name="Mike Brown" role="Driver" score={82} status="Suspended" expiry="2024-03-10" />
            </div>
        </motion.div>
    );
};

const DriverCard = ({ name, role, score, status, expiry }) => (
    <div className="glass-card p-6 border-l-4" style={{ borderLeftColor: status === 'On Duty' ? '#4ade80' : status === 'Off Duty' ? '#94a3b8' : '#f87171' }}>
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-xl font-bold">{name}</h3>
                <p className="text-slate-400 text-sm">{role}</p>
            </div>
            <div className="flex items-center gap-1 text-indigo-400">
                <ShieldCheck size={16} />
                <span className="font-bold">{score}</span>
            </div>
        </div>

        <div className="space-y-3 mt-6">
            <div className="flex justify-between text-sm">
                <span className="text-slate-400">Status</span>
                <span className={`font-medium ${status === 'On Duty' ? 'text-green-400' : 'text-red-400'}`}>{status}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-slate-400">License Expiry</span>
                <span className="font-medium">{expiry}</span>
            </div>
        </div>

        <button className="btn btn-ghost w-full mt-6 text-sm py-2">View History</button>
    </div>
);

export default Drivers;
