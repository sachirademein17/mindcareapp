import FindDoctors from '../pages/patient/FindDoctors'
import PatientDashboard from '../pages/patient/PatientDashboard'

export const patientRoutes = [
  { path: '/patient/dashboard', element: <PatientDashboard /> },
  { path: '/patient/find-doctors', element: <FindDoctors /> }
]
