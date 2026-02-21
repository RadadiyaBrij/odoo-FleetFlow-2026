import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, AlertTriangle, Activity, Package } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        activeFleet: 12,
        maintenanceAlerts: 3,
        utilizationRate: 85,
        pendingCargo: 5
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <header className="mb-10">
                <h1 className="text-4xl font-bold mb-2">Command Center</h1>
                <p className="text-slate-400">Real-time overview of your logistics network</p>
            </header>

            <div className="kpi-grid">
                <KPIItem
                    label="Active Fleet"
                    value={stats.activeFleet}
                    icon={<Truck size={24} />}
                    color="rgba(99, 102, 241, 0.2)"
                    iconColor="#818cf8"
                />
                <KPIItem
                    label="Maintenance"
                    value={stats.maintenanceAlerts}
                    icon={<AlertTriangle size={24} />}
                    color="rgba(239, 68, 68, 0.2)"
                    iconColor="#f87171"
                />
                <KPIItem
                    label="Utilization"
                    value={`${stats.utilizationRate}%`}
                    icon={<Activity size={24} />}
                    color="rgba(34, 197, 94, 0.2)"
                    iconColor="#4ade80"
                />
                <KPIItem
                    label="Pending Cargo"
                    value={stats.pendingCargo}
                    icon={<Package size={24} />}
                    color="rgba(245, 158, 11, 0.2)"
                    iconColor="#fbbf24"
                />
            </div>

            <div className="glass-card p-6 mt-10">
                <h2 className="text-xl font-bold mb-6">Recent Deliveries</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Trip ID</th>
                                <th>Vehicle</th>
                                <th>Driver</th>
                                <th>Destination</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <RecentTripRow id="TRP-1002" vehicle="Van-04" driver="Alex Johnson" dest="Seattle, WA" status="On Trip" />
                            <RecentTripRow id="TRP-1001" vehicle="Truck-12" driver="Sarah Smith" dest="Portland, OR" status="Completed" />
                            <RecentTripRow id="TRP-0998" vehicle="Van-02" driver="Mike Brown" dest="Vancouver, BC" status="Delayed" />
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

const KPIItem = ({ label, value, icon, color, iconColor }) => (
    <div className="glass-card kpi-card">
        <div className="icon-box" style={{ background: color, color: iconColor }}>
            {icon}
        </div>
        <div>
            <p className="text-slate-400 text-sm">{label}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
        </div>
    </div>
);

const RecentTripRow = ({ id, vehicle, driver, dest, status }) => {
    const getStatusClass = (s) => {
        if (s === 'Completed') return 'badge-success';
        if (s === 'On Trip') return 'badge-warning';
        return 'badge-danger';
    };

    return (
        <tr>
            <td className="font-medium">{id}</td>
            <td>{vehicle}</td>
            <td>{driver}</td>
            <td>{dest}</td>
            <td>
                <span className={`badge ${getStatusClass(status)}`}>{status}</span>
            </td>
        </tr>
    );
};

export default Dashboard;
