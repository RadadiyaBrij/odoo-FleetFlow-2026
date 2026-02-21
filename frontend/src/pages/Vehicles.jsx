import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';

const Vehicles = () => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Vehicle Registry</h1>
                    <p className="text-slate-400">Manage your physical assets and fleet health</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={20} /> Add Vehicle
                </button>
            </header>

            <div className="flex gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Search by license plate or name..." className="pl-10" />
                </div>
                <select className="w-48">
                    <option>All Types</option>
                    <option>Trucks</option>
                    <option>Vans</option>
                    <option>Bikes</option>
                </select>
                <select className="w-48">
                    <option>All Status</option>
                    <option>Available</option>
                    <option>On Trip</option>
                    <option>Maintenance</option>
                </select>
            </div>

            <div className="glass-card table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Vehicle Name</th>
                            <th>Type</th>
                            <th>License Plate</th>
                            <th>Capacity</th>
                            <th>Odometer</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <VehicleRow name="Truck-01" type="Truck" plate="ABC-1234" capacity="5000kg" odo="24,500km" status="Available" />
                        <VehicleRow name="Van-05" type="Van" plate="VAN-9988" capacity="800kg" odo="12,200km" status="On Trip" />
                        <VehicleRow name="Truck-12" type="Truck" plate="XYZ-5544" capacity="12000kg" odo="45,000km" status="Maintenance" />
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

const VehicleRow = ({ name, type, plate, capacity, odo, status }) => (
    <tr>
        <td className="font-bold">{name}</td>
        <td>{type}</td>
        <td className="font-mono text-sm">{plate}</td>
        <td>{capacity}</td>
        <td>{odo}</td>
        <td>
            <span className={`badge ${status === 'Available' ? 'badge-success' : status === 'On Trip' ? 'badge-warning' : 'badge-danger'}`}>
                {status}
            </span>
        </td>
    </tr>
);

export default Vehicles;
