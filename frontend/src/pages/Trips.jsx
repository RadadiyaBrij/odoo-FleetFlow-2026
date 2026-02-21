import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Navigation } from 'lucide-react';

const Trips = () => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Trip Dispatcher</h1>
                    <p className="text-slate-400">Manage active shipments and logistics workflows</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={20} /> Create Trip
                </button>
            </header>

            <div className="glass-card p-8 mb-10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Navigation size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Active Global Shipments</h2>
                        <p className="text-slate-400">Currently tracking 48 active logistics units across all regions</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-sm text-slate-400">Success Rate</p>
                        <p className="text-2xl font-bold text-green-400">99.2%</p>
                    </div>
                    <div className="text-right ml-8">
                        <p className="text-sm text-slate-400">Avg. Delay</p>
                        <p className="text-2xl font-bold text-yellow-400">12m</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ActiveTripCard id="TRP-4402" origin="Oakland Port" dest="Reno Warehouse" progress={65} time="2h 15m remaining" />
                <ActiveTripCard id="TRP-4405" origin="LA Distribution" dest="Phoenix Hub" progress={30} time="5h 40m remaining" />
            </div>
        </motion.div>
    );
};

const ActiveTripCard = ({ id, origin, dest, progress, time }) => (
    <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-indigo-400">{id}</h3>
            <span className="text-sm text-slate-400">{time}</span>
        </div>

        <div className="flex items-center justify-between mb-8 relative">
            <div className="text-center z-10 bg-slate-800 px-2">
                <p className="text-xs text-slate-500 uppercase">Origin</p>
                <p className="font-medium">{origin}</p>
            </div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-700 -translate-y-1/2 -z-0"></div>
            <div className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 -translate-y-1/2 -z-0" style={{ width: `${progress}%` }}></div>
            <div className="text-center z-10 bg-slate-800 px-2">
                <p className="text-xs text-slate-500 uppercase">Destination</p>
                <p className="font-medium">{dest}</p>
            </div>
        </div>

        <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full" style={{ width: `${progress}%` }}></div>
        </div>
    </div>
);

export default Trips;
