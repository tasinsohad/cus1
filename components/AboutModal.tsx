
import React, { useState } from 'react';
import ParticleBackground from './ParticleBackground'; // Import the new component

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CloseIcon = ({ className = "w-6 h-6"}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1 inline-block">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
);

const UserCircleIcon = () => ( // Placeholder icon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 opacity-50">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);


const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const developerImageUrl = "https://media.licdn.com/dms/image/v2/D5603AQHUZyBO2fqENg/profile-displayphoto-shrink_400_400/B56Zb2JPomGsAg-/0/1747886343278?e=1753920000&v=beta&t=YD4S_nBVeGZKLStZxR0N0Zb3C9bzPevM5DxeNqTRg3k";
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-appear"
        onClick={(e) => e.stopPropagation()} 
        style={{animationName: 'modal-appear-animation', animationDuration: '0.3s', animationFillMode: 'forwards'}}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light z-20" // Ensure close button is above particles
          aria-label="Close About modal"
        >
          <CloseIcon className="w-5 h-5"/>
        </button>

        <h2 id="about-modal-title" className="text-2xl sm:text-3xl font-semibold text-primary dark:text-primary-light mb-6 text-center relative z-10"> 
          About CU Shuttle Tracker
        </h2>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 relative z-10"> 
          <section>
            <h3 className="text-lg sm:text-xl font-semibold text-primary-dark dark:text-primary-light mb-2">App Features</h3>
            <ul className="list-disc list-inside space-y-1 pl-2 text-sm sm:text-base">
              <li>Live tracking of the University of Chittagong shuttle.</li>
              <li>Ability for authorized users to broadcast their device's location as the active shuttle tracker.</li>
              <li>Map view and linear route view for shuttle location.</li>
              <li>Estimated Time of Arrival (ETA) calculation for users.</li>
              <li>Dark mode for comfortable viewing in low light.</li>
              <li>Responsive design for mobile and desktop use.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg sm:text-xl font-semibold text-primary-dark dark:text-primary-light mb-3">Developer Information</h3>
            <div className="relative bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg shadow-inner overflow-hidden">
              <ParticleBackground />
              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <div className="flex-1 order-last sm:order-first text-center sm:text-left">
                  <p className="text-md sm:text-lg font-medium">
                    <a
                        href="https://www.linkedin.com/in/tasinsohad/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary dark:text-primary-light hover:underline focus:outline-none focus:ring-1 focus:ring-primary-light rounded-sm"
                    >
                        Tasin Sohad <ExternalLinkIcon />
                    </a>
                  </p>
                  <p className="text-sm sm:text-base mt-1">Department of Banking & Insurance</p>
                  <p className="text-sm sm:text-base">University Of Chittagong</p>
                  <p className="text-sm sm:text-base">Session: 2021-2022</p>

                  <p className="mt-3 text-sm sm:text-base">
                    <span className="font-semibold">Profession:</span> Digital Marketing Specialist, AI Automation Facilitator, SEO Expert, Designer, and Video Editor.
                  </p>
                  <p className="mt-1 text-sm sm:text-base">
                    Working as a freelancer for foreign companies and clients.
                  </p>
                  <div className="mt-3">
                    <p className="font-semibold text-sm sm:text-base">Contact:</p>
                    <ul className="list-disc list-inside pl-2 text-sm sm:text-base">
                        <li>Email: <a href="mailto:tasinsohad@outlook.com" className="text-primary dark:text-primary-light hover:underline">tasinsohad@outlook.com</a></li>
                        <li>Email: <a href="mailto:tasinsohad@yahoo.com" className="text-primary dark:text-primary-light hover:underline">tasinsohad@yahoo.com</a></li>
                    </ul>
                  </div>
                </div>
                <div className={`w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 order-first sm:order-last rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2 border-white dark:border-gray-600 ${imageError ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                  {imageError ? (
                    <div className="text-gray-500 dark:text-gray-400" title="Image not available">
                      <UserCircleIcon />
                    </div>
                  ) : (
                    <img
                      src={developerImageUrl}
                      alt="Tasin Sohad"
                      className="rounded-full w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  )}
                </div>
              </div>
            </div>
          </section>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-4 border-t border-gray-200 dark:border-gray-600">
            This application is a personal project and not officially affiliated with the University of Chittagong.
          </p>
        </div>
      </div>
      <style>{`
        @keyframes modal-appear-animation {
          0% { opacity: 0; transform: scale(0.95) translateY(-10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-appear {
          animation-name: modal-appear-animation;
          animation-duration: 0.2s; /* Faster animation */
          animation-timing-function: ease-out;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};

export default AboutModal;