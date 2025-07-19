import FindDoctors from '../pages/patient/FindDoctors'
import PatientDashboard from '../pages/patient/PatientDashboard'
import ViewPrescriptions from '../pages/patient/ViewPrescriptions'

export const patientRoutes = [
  { path: '/patient/dashboard', element: <PatientDashboard /> },
  { path: '/patient/find-doctors', element: <FindDoctors /> },
  { path: '/patient/prescriptions', element: <ViewPrescriptions /> }
]
