import React, { useState } from 'react';

interface Prescription {
  id: number;
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  notes?: string;
  doctorId: number;
  doctorName: string;
  patientNIC: string;
  issuedAt: string;
  status: string;
}

interface GroupedPrescriptionCardProps {
  doctorName: string;
  doctorId: number;
  prescriptions: Prescription[];
  onViewPrescription: (prescription: Prescription) => void;
  onViewAllPrescriptions?: (prescriptions: Prescription[]) => void;
}

const GroupedPrescriptionCard: React.FC<GroupedPrescriptionCardProps> = ({ 
  doctorName, 
  prescriptions, 
  onViewPrescription,
  onViewAllPrescriptions 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const latestPrescription = prescriptions.sort((a, b) => 
    new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
  )[0];

  const activeCount = prescriptions.filter(p => p.status.toLowerCase() === 'active').length;
  const totalCount = prescriptions.length;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center relative">
            <span className="text-white text-2xl">👨‍⚕️</span>
            {/* Badge for prescription count */}
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {totalCount}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">Dr. {doctorName}</h3>
            <p className="text-sm text-gray-500">{totalCount} prescription{totalCount > 1 ? 's' : ''} • {activeCount} active</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(latestPrescription.status)}`}>
            Latest: {latestPrescription.status.charAt(0).toUpperCase() + latestPrescription.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Latest Prescription Preview */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Most Recent Prescription</h4>
          <span className="text-xs text-gray-500">{formatDate(latestPrescription.issuedAt)}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">💊</span>
            <span className="text-sm font-medium text-gray-700">{latestPrescription.drugName}</span>
            <span className="text-sm text-gray-600">• {latestPrescription.dosage}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">⏰</span>
            <span className="text-sm text-gray-600">{latestPrescription.frequency}</span>
          </div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>{isExpanded ? '📋' : '📂'}</span>
          <span>{isExpanded ? 'Hide All' : 'View All'} ({totalCount})</span>
          <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {totalCount > 1 && onViewAllPrescriptions && (
          <button
            onClick={() => onViewAllPrescriptions(prescriptions)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>👁️</span>
            <span>View All Together</span>
          </button>
        )}
      </div>

      {/* Expanded Prescription List */}
      {isExpanded && (
        <div className="space-y-3 animate-fade-in">
          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => onViewPrescription(prescription)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onViewPrescription(prescription);
                }
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">💊</span>
                  <h5 className="font-semibold text-gray-900">{prescription.drugName}</h5>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(prescription.status)}`}>
                  {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400">💊</span>
                  <span className="text-gray-600">{prescription.dosage}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400">⏰</span>
                  <span className="text-gray-600">{prescription.frequency}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400">📅</span>
                  <span className="text-gray-600">{formatDate(prescription.issuedAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400">⏱️</span>
                  <span className="text-gray-600">{prescription.duration}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2">
                  <span>👁️</span>
                  <span>View in Secure Mode</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-amber-600">🔒</span>
          <span className="text-xs text-amber-700 font-medium">
            All prescriptions will open in secure full-screen mode for privacy protection
          </span>
        </div>
      </div>
    </div>
  );
};

export default GroupedPrescriptionCard;
