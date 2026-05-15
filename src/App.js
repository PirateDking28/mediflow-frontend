import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import './App.css';
import DashboardMedico from './pages/DashboardMedico';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/dashboard-medico" element={
                    <PrivateRoute>
                        <DashboardMedico />
                    </PrivateRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;