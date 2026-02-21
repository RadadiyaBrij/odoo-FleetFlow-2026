import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, Map, Settings, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';

function App() {
  return (
    <Router>
      <div className="layout">
        <aside className="nav glass-card">
          <div className="logo mb-10 px-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              FleetFlow
            </h1>
          </div>

          <nav>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/vehicles" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Truck size={20} /> Vehicles
            </NavLink>
            <NavLink to="/drivers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Users size={20} /> Drivers
            </NavLink>
            <NavLink to="/trips" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Map size={20} /> Trips
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Settings size={20} /> Settings
            </NavLink>
          </nav>

          <button className="btn btn-ghost mt-auto w-full">
            <LogOut size={20} /> Logout
          </button>
        </aside>

        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/trips" element={<Trips />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
