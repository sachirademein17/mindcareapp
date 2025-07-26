import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { createApiUrl } from '../../config/api'

interface Patient {
  id: number
  name: string
  email: string
  nic: string
}

interface Enrollment {
  id: number
  Patient: Patient
}

interface PrescriptionItem {
  id: string // temporary ID for UI purposes
  drugName: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  notes: string
}

const IssuePrescription = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: '1',
      drugName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      notes: ''
    }
  ])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const navigate = useNavigate()

  const frequencyOptions = [
    'Once daily (Every 24 hours)',
    'Twice daily (Every 12 hours)',
    'Three times daily (Every 8 hours)',
    'Four times daily (Every 6 hours)',
    'Every 4 hours',
    'Every 2 hours',
    'As needed (PRN)',
    'Before meals',
    'After meals',
    'At bedtime',
    'Upon waking'
  ]

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await axios.get(createApiUrl('doctor/enrollments'), {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      console.log('🔍 Fetched enrollments data:', response.data) // Debug log
      
      // Debug: Check each patient's data structure
      response.data.forEach((enrollment: any, index: number) => {
        console.log(`👤 Patient ${index + 1}:`, enrollment.Patient)
        console.log(`📄 NIC field present:`, enrollment.Patient?.nic ? 'YES ✅' : 'NO ❌')
        if (enrollment.Patient?.nic) {
          console.log(`📄 NIC value: "${enrollment.Patient.nic}"`)
        }
      })
      
      setEnrollments(response.data)
    } catch (error) {
      console.error('Error fetching patients:', error)
      alert('Failed to fetch patients')
    }
  }

  const addPrescription = () => {
    const newId = (prescriptions.length + 1).toString()
    setPrescriptions([...prescriptions, {
      id: newId,
      drugName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      notes: ''
    }])
  }

  const removePrescription = (id: string) => {
    if (prescriptions.length > 1) {
      setPrescriptions(prescriptions.filter(p => p.id !== id))
    }
  }

  const updatePrescription = (id: string, field: keyof PrescriptionItem, value: string) => {
    setPrescriptions(prescriptions.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ))
    // Clear error for this field
    const errorKey = `${id}_${field}`
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }))
    }
  }

  const handlePatientSelect = (enrollment: Enrollment) => {
    console.log('Selected patient data:', enrollment.Patient) // Debug log
    setSelectedPatient(enrollment.Patient)
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!selectedPatient) newErrors.patient = 'Please select a patient'
    
    prescriptions.forEach((prescription) => {
      if (!prescription.drugName.trim()) newErrors[`${prescription.id}_drugName`] = 'Drug name is required'
      if (!prescription.dosage.trim()) newErrors[`${prescription.id}_dosage`] = 'Dosage is required'
      if (!prescription.frequency) newErrors[`${prescription.id}_frequency`] = 'Frequency is required'
      if (!prescription.duration.trim()) newErrors[`${prescription.id}_duration`] = 'Duration is required'
      if (!prescription.instructions.trim()) newErrors[`${prescription.id}_instructions`] = 'Instructions are required'
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      console.log('🔔 Submitting prescription with selectedPatient:', selectedPatient) // Debug log
      
      // Create array of prescription data
      const prescriptionData = prescriptions.map(prescription => ({
        patientId: selectedPatient!.id,
        patientNIC: selectedPatient!.nic,
        drugName: prescription.drugName,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        instructions: prescription.instructions,
        notes: prescription.notes
      }))

      console.log('📋 Prescription data to send:', prescriptionData) // Debug log
      console.log('🔗 API URL:', createApiUrl('doctor/issue-multiple-prescriptions')) // Debug log

      // Send all prescriptions in one request
      const response = await axios.post(createApiUrl('doctor/issue-multiple-prescriptions'), {
        prescriptions: prescriptionData
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      console.log('✅ Prescription response:', response.data) // Debug log
      alert(`Prescription(s) issued successfully! (${prescriptions.length})`)
      
      // Reset form
      setPrescriptions([{
        id: '1',
        drugName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        notes: ''
      }])
      setSelectedPatient(null)
      
      // Navigate back to dashboard
      navigate('/doctor/dashboard')
    } catch (error: any) {
      console.error('❌ Error issuing prescription:', error)
      console.error('❌ Error response:', error.response?.data) // Debug log
      console.error('❌ Error status:', error.response?.status) // Debug log
      alert(`Failed to issue prescription: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <Link 
            to="/doctor/dashboard"
            className="inline-flex items-center text-emerald-300 hover:text-emerald-200 transition-colors duration-300 mb-4 group"
          >
            <span className="mr-2 group-hover:translate-x-[-4px] transition-transform duration-300">←</span>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Issue Prescription
          </h1>
          <p className="text-gray-300 text-lg">
            Create a detailed prescription for your patients
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Patient Selection */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 mb-8 animate-slide-in-up">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="mr-3">Patients</span>
              Select Patient
            </h2>
            
            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">Patients</div>
                <p className="text-gray-300">No patients enrolled yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    onClick={() => handlePatientSelect(enrollment)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 ${
                      selectedPatient?.id === enrollment.Patient.id
                        ? 'bg-emerald-500/30 border-emerald-400'
                        : 'bg-white/10 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🧠</span>
                      <div>
                        <p className="text-white font-semibold">{enrollment.Patient.name}</p>
                        <p className="text-gray-300 text-sm">{enrollment.Patient.email}</p>
                        <p className="text-emerald-300 text-sm font-medium">
                          NIC: {enrollment.Patient.nic || 'Not available ❌'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.patient && <p className="text-red-400 text-sm mt-2">{errors.patient}</p>}
          </div>

          {/* Prescription Form */}
          {selectedPatient && (
            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 animate-slide-in-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <span className="mr-3">Prescription</span>
                  Prescription Details for {selectedPatient.name}
                </h2>
                <button
                  type="button"
                  onClick={addPrescription}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-400 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 flex items-center"
                >
                  <span className="mr-2">Add</span>
                  Add Another Prescription
                </button>
              </div>

              {/* Multiple Prescription Forms */}
              <div className="space-y-8">
                {prescriptions.map((prescription, index) => (
                  <div key={prescription.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Prescription #{index + 1}
                      </h3>
                      {prescriptions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePrescription(prescription.id)}
                          className="px-3 py-1 bg-red-500/20 border border-red-400/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-300 flex items-center"
                        >
                          <span className="mr-1">Remove</span>
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Drug Name */}
                      <div>
                        <label htmlFor={`drugName_${prescription.id}`} className="block text-sm font-medium text-gray-200 mb-2">
                          Drug/Medication Name *
                        </label>
                        <input
                          type="text"
                          id={`drugName_${prescription.id}`}
                          value={prescription.drugName}
                          onChange={(e) => updatePrescription(prescription.id, 'drugName', e.target.value)}
                          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
                          placeholder="e.g., Paracetamol, Amoxicillin"
                          required
                        />
                        {errors[`${prescription.id}_drugName`] && (
                          <p className="text-red-400 text-sm mt-1">{errors[`${prescription.id}_drugName`]}</p>
                        )}
                      </div>

                      {/* Dosage */}
                      <div>
                        <label htmlFor={`dosage_${prescription.id}`} className="block text-sm font-medium text-gray-200 mb-2">
                          Dosage/Strength *
                        </label>
                        <input
                          type="text"
                          id={`dosage_${prescription.id}`}
                          value={prescription.dosage}
                          onChange={(e) => updatePrescription(prescription.id, 'dosage', e.target.value)}
                          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
                          placeholder="e.g., 500mg, 10ml, 2 tablets"
                          required
                        />
                        {errors[`${prescription.id}_dosage`] && (
                          <p className="text-red-400 text-sm mt-1">{errors[`${prescription.id}_dosage`]}</p>
                        )}
                      </div>

                      {/* Frequency */}
                      <div>
                        <label htmlFor={`frequency_${prescription.id}`} className="block text-sm font-medium text-gray-200 mb-2">
                          ⏰ Frequency *
                        </label>
                        <select
                          id={`frequency_${prescription.id}`}
                          value={prescription.frequency}
                          onChange={(e) => updatePrescription(prescription.id, 'frequency', e.target.value)}
                          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
                          required
                        >
                          <option value="" className="bg-gray-800">Select frequency</option>
                          {frequencyOptions.map((option) => (
                            <option key={option} value={option} className="bg-gray-800">
                              {option}
                            </option>
                          ))}
                        </select>
                        {errors[`${prescription.id}_frequency`] && (
                          <p className="text-red-400 text-sm mt-1">{errors[`${prescription.id}_frequency`]}</p>
                        )}
                      </div>

                      {/* Duration */}
                      <div>
                        <label htmlFor={`duration_${prescription.id}`} className="block text-sm font-medium text-gray-200 mb-2">
                          Duration *
                        </label>
                        <input
                          type="text"
                          id={`duration_${prescription.id}`}
                          value={prescription.duration}
                          onChange={(e) => updatePrescription(prescription.id, 'duration', e.target.value)}
                          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
                          placeholder="e.g., 7 days, 2 weeks, 1 month"
                          required
                        />
                        {errors[`${prescription.id}_duration`] && (
                          <p className="text-red-400 text-sm mt-1">{errors[`${prescription.id}_duration`]}</p>
                        )}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-6">
                      <label htmlFor={`instructions_${prescription.id}`} className="block text-sm font-medium text-gray-200 mb-2">
                        Instructions for Use *
                      </label>
                      <textarea
                        id={`instructions_${prescription.id}`}
                        value={prescription.instructions}
                        onChange={(e) => updatePrescription(prescription.id, 'instructions', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 resize-none"
                        placeholder="Detailed instructions for the patient on how to take the medication..."
                        required
                      />
                      {errors[`${prescription.id}_instructions`] && (
                        <p className="text-red-400 text-sm mt-1">{errors[`${prescription.id}_instructions`]}</p>
                      )}
                    </div>

                    {/* Additional Notes */}
                    <div className="mt-6">
                      <label htmlFor={`notes_${prescription.id}`} className="block text-sm font-medium text-gray-200 mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        id={`notes_${prescription.id}`}
                        value={prescription.notes}
                        onChange={(e) => updatePrescription(prescription.id, 'notes', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 resize-none"
                        placeholder="Any additional notes, warnings, or observations..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Patient Info Display */}
              <div className="mt-6 p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-xl">
                <h3 className="text-emerald-300 font-semibold mb-2">Patient Information:</h3>
                <p className="text-white">Name: {selectedPatient.name}</p>
                <p className="text-white">Email: {selectedPatient.email}</p>
                <p className={`${selectedPatient.nic ? 'text-white' : 'text-red-400'}`}>
                  NIC: {selectedPatient.nic || '❌ NOT AVAILABLE - Cannot issue prescription'}
                </p>
                {!selectedPatient.nic && (
                  <p className="text-red-400 text-sm mt-2 font-medium">
                    ⚠️ Warning: Patient NIC is required for prescription submission
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/doctor/dashboard')}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-300 hover:bg-white/10 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-500 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Issuing...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">Issue Prescription</span>
                      Issue {prescriptions.length} Prescription{prescriptions.length > 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default IssuePrescription
