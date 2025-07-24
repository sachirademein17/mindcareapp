import React from 'react';

interface PrescriptionCardProps {
  prescription: {
    id: number;
    drugName: string;
    dosage: string;
    frequency: string;
    doctorId: number;
    doctorName: string;
    issuedAt: string;
    status: string;
  };
  onViewDetails: () => void;
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ prescription, onViewDetails }) => {
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

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
      onClick={onViewDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewDetails();
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">💊</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{prescription.drugName}</h3>
            <p className="text-sm text-gray-500">Prescribed by Dr. {prescription.doctorName}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(prescription.status)}`}>
          {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
        </span>
      </div>

      {/* Prescription Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">💊</span>
          <span className="text-sm font-medium text-gray-700">Dosage:</span>
          <span className="text-sm text-gray-600">{prescription.dosage}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">⏰</span>
          <span className="text-sm font-medium text-gray-700">Frequency:</span>
          <span className="text-sm text-gray-600">{prescription.frequency}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">📅</span>
          <span className="text-sm font-medium text-gray-700">Issued:</span>
          <span className="text-sm text-gray-600">{formatDate(prescription.issuedAt)}</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-gray-100">
        <div className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2">
          <span>👁️</span>
          <span>View Full Prescription</span>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-amber-600">🔒</span>
          <span className="text-xs text-amber-700 font-medium">
            Click to view in secure full-screen mode
          </span>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionCard;
