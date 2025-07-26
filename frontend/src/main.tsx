import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SelectRole from './pages/SelectRole'
import Login from './pages/Login'
import SignupPatient from './pages/SignupPatient'
import SignupDoctor from './pages/SignupDoctor'
import AdminDashboard from './pages/AdminDashboard'
import LoginAdmin from './pages/AdminLogin'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorChat from './pages/doctor/DoctorChat'
import IssuePrescription from './pages/doctor/IssuePrescription'
import DoctorProfile from './pages/doctor/DoctorProfile'
import PatientDashboard from './pages/patient/PatientDashboard'
import PatientChat from './pages/patient/PatientChat'
import FindDoctors from './pages/patient/FindDoctors'
import ViewPrescriptions from './pages/patient/ViewPrescriptions'
import PatientProfile from './pages/patient/PatientProfile'
import ChangePassword from './components/ChangePassword'
import DesignShowcase from './pages/DesignShowcase'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/select-role" replace />} />
        <Route path="/select-role" element={<SelectRole />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/signup/patient" element={<SignupPatient />} />
        <Route path="/signup/doctor" element={<SignupDoctor />} />
        {/* <Route path="/login/admin" element={<LoginAdmin />} /> */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/chat" element={<DoctorChat />} />
        <Route path="/doctor/issue-prescription" element={<IssuePrescription />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
        <Route path="/doctor/change-password" element={<ChangePassword />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/chat" element={<PatientChat />} />
        <Route path="/patient/find-doctors" element={<FindDoctors />} />
        <Route path="/patient/prescriptions" element={<ViewPrescriptions />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/patient/change-password" element={<ChangePassword />} />
        <Route path="/design-showcase" element={<DesignShowcase />} />
        {/* Later: Add more dashboard routes */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
// This is the main entry point for the React application.
// It sets up the routing for the application, allowing users to navigate between different pages such as
// selecting a role, logging in, and signing up as a patient or doctor.
// The application uses React Router for navigation and renders the appropriate components based on the URL path.
// The root element is targeted to mount the React application, ensuring it is rendered correctly in the  