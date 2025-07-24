// Privacy Policy Component for Mental Health Platform

import { useState } from 'react'

interface PrivacyPolicyProps {
  isOpen: boolean
  onClose: () => void
}

export const PrivacyPolicyModal = ({ isOpen, onClose }: PrivacyPolicyProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Privacy Policy</h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              <strong>Effective Date:</strong> January 23, 2025<br />
              <strong>Last Updated:</strong> January 23, 2025
            </p>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">1. Information We Collect</h3>
              
              <h4 className="text-lg font-medium text-gray-700 mb-3">1.1 Personal Information</h4>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li>Name, email address, and contact information</li>
                <li>National Identity Card (NIC) number for verification</li>
                <li>Date of birth and gender</li>
                <li>Location (Sri Lankan district)</li>
                <li>For doctors: Medical qualifications, specialization, CV documents</li>
              </ul>

              <h4 className="text-lg font-medium text-gray-700 mb-3">1.2 Health Information</h4>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li>Medical history and health records (patients)</li>
                <li>Consultation notes and treatment records</li>
                <li>Prescription information</li>
                <li>Chat messages between patients and doctors</li>
              </ul>

              <h4 className="text-lg font-medium text-gray-700 mb-3">1.3 Technical Information</h4>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Usage data and analytics</li>
                <li>Session information and cookies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li><strong>Healthcare Services:</strong> Facilitate consultations between patients and doctors</li>
                <li><strong>Account Management:</strong> Create and maintain user accounts</li>
                <li><strong>Communication:</strong> Send important updates and notifications</li>
                <li><strong>Security:</strong> Protect against fraud and unauthorized access</li>
                <li><strong>Legal Compliance:</strong> Meet regulatory requirements for healthcare data</li>
                <li><strong>Service Improvement:</strong> Analyze usage to enhance our platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">3. Data Protection & Security</h3>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-blue-800 font-medium">🔒 We implement industry-standard security measures to protect your data:</p>
              </div>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li>End-to-end encryption for sensitive communications</li>
                <li>Secure server infrastructure with regular security updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Staff training on data protection protocols</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">4. Data Sharing & Disclosure</h3>
              <p className="text-gray-600 mb-4">We do not sell your personal information. We may share data only in these circumstances:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li><strong>Healthcare Providers:</strong> With your enrolled doctors for treatment purposes</li>
                <li><strong>Legal Requirements:</strong> When required by law or court order</li>
                <li><strong>Emergency Situations:</strong> To protect life or prevent serious harm</li>
                <li><strong>Service Providers:</strong> With trusted partners who help operate our platform (under strict confidentiality agreements)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">5. Your Rights & Choices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">✅ You Have the Right To:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Access your personal data</li>
                    <li>• Correct inaccurate information</li>
                    <li>• Delete your account and data</li>
                    <li>• Export your data</li>
                    <li>• Withdraw consent</li>
                  </ul>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">⚠️ Important Notes:</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Some data must be retained for legal compliance</li>
                    <li>• Medical records may have specific retention requirements</li>
                    <li>• Account deletion may affect ongoing treatments</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">6. Cookies & Tracking</h3>
              <p className="text-gray-600 mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li>Remember your login preferences</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Provide personalized content and recommendations</li>
                <li>Ensure platform security and prevent fraud</li>
              </ul>
              <p className="text-gray-600">You can control cookie settings through your browser preferences.</p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">7. Data Retention</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li><strong>Account Data:</strong> Retained while your account is active</li>
                <li><strong>Medical Records:</strong> Retained for 7 years as per Sri Lankan healthcare regulations</li>
                <li><strong>Communication Logs:</strong> Retained for 3 years for quality and safety purposes</li>
                <li><strong>Technical Logs:</strong> Retained for 1 year for security and troubleshooting</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">8. International Transfers</h3>
              <p className="text-gray-600 mb-4">
                Your data is primarily stored within Sri Lanka. If we need to transfer data internationally, 
                we ensure appropriate safeguards are in place to protect your privacy and comply with local data protection laws.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">9. Children's Privacy</h3>
              <p className="text-gray-600 mb-4">
                Our services are not intended for children under 18. If you are under 18, you may only use our services 
                with parental or guardian consent and supervision. We do not knowingly collect personal information from children without appropriate consent.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">10. Updates to This Policy</h3>
              <p className="text-gray-600 mb-4">
                We may update this Privacy Policy periodically to reflect changes in our practices or applicable law. 
                We will notify you of significant changes via email or platform notification at least 30 days before they take effect.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">11. Contact Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Data Protection Officer:</strong><br />
                  Email: privacy@mindcare.lk<br />
                  Phone: +94 11 234 5678<br />
                  Address: MindCare Platform, Colombo, Sri Lanka
                </p>
                <p className="text-gray-700">
                  <strong>For urgent privacy concerns:</strong> emergency@mindcare.lk
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">12. Regulatory Compliance</h3>
              <p className="text-gray-600 mb-4">
                This Privacy Policy complies with:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li>Sri Lankan Data Protection laws and regulations</li>
                <li>Healthcare information privacy requirements</li>
                <li>International data protection standards where applicable</li>
                <li>Medical confidentiality obligations</li>
              </ul>
            </section>

            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-blue-800">
                <strong>By using MindCare Platform, you acknowledge that you have read, understood, and agree to this Privacy Policy.</strong>
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

interface PrivacyCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}

export const PrivacyPolicyCheckbox = ({ checked, onChange, error }: PrivacyCheckboxProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="mb-6">
        <div className="flex items-start space-x-3">
          <input
            id="privacy-policy"
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="privacy-policy" className="text-sm text-gray-200 leading-5">
            I have read and agree to the{' '}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-blue-400 hover:text-blue-300 underline font-medium"
            >
              Privacy Policy
            </button>
            {' '}and consent to the collection, use, and processing of my personal and health information as described.
            <span className="text-red-400 ml-1">*</span>
          </label>
        </div>
        {error && (
          <p className="text-red-400 text-sm mt-2 ml-7">{error}</p>
        )}
      </div>

      <PrivacyPolicyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
