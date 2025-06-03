import React, { useState } from 'react';
import ParticleBackground from './ParticleBackground';

// Re-using icons from AboutModal.tsx for consistency, or they could be imported from a shared icon file.
const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1 inline-block">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
);

const UserIconPlaceholder = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 opacity-50">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 inline-block relative -top-px">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.018-.926-.055-1.221a.75.75 0 0 0-.576-.576c-.295-.037-.705-.055-1.221-.055h-1.372a2.25 2.25 0 0 1-2.25-2.25V6.75A2.25 2.25 0 0 0 16.5 4.5h-1.372c-.516 0-.926.018-1.221.055a.75.75 0 0 0-.576.576c-.037.295-.055.705-.055 1.221V7.5a2.25 2.25 0 0 1-2.25 2.25H9.75A2.25 2.25 0 0 1 7.5 7.5V6.75a2.25 2.25 0 0 0-2.25-2.25H3.75A2.25 2.25 0 0 0 1.5 6.75v.75c0 .418.013.826.038 1.221a.75.75 0 0 0 .576.576c.395.025.803.038 1.221.038H3.75c.418 0 .826-.013 1.221-.038a.75.75 0 0 0 .576-.576C4.513 10.174 4.5 9.766 4.5 9.348V9h.75a.75.75 0 0 0 .75-.75V7.5a.75.75 0 0 0-.75-.75H4.5V6.75A.75.75 0 0 1 5.25 6h.75a2.25 2.25 0 0 1 2.25 2.25v.75a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 0-2.25 2.25v.75A2.25 2.25 0 0 0 6 18h.75a.75.75 0 0 0 .75-.75v-.75a.75.75 0 0 0-.75-.75H6v-.75a.75.75 0 0 1 .75-.75h.75a2.25 2.25 0 0 1 2.25 2.25v.75a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 0-2.25 2.25V21a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 21v-1.372c0-.516.018-.926.055-1.221a.75.75 0 0 0 .576-.576c.295.037.705.055 1.221.055h1.372a.75.75 0 0 0 .75-.75V6.75a.75.75 0 0 0-.75-.75h-1.372c-.516 0-.926-.018-1.221-.055a.75.75 0 0 0-.576-.576C19.513 5.826 19.5 5.418 19.5 5V4.5A2.25 2.25 0 0 0 17.25 2.25H6.75A2.25 2.25 0 0 0 4.5 4.5V5c0 .418-.013.826-.038 1.221a.75.75 0 0 0-.576.576C3.487 7.174 3.475 7.582 3.475 8V9A2.25 2.25 0 0 0 1.225 11.25 2.25 2.25 0 0 0 3.475 13.5V14c0 .418.013.826.038 1.221a.75.75 0 0 0 .576.576c.395.025.803.038 1.221.038h.75c.418 0 .826-.013 1.221-.038a.75.75 0 0 0 .576-.576c.025-.395.038-.803.038-1.221V15a2.25 2.25 0 0 1 2.25-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v.75a2.25 2.25 0 0 1-2.25 2.25h-.75a2.25 2.25 0 0 1-2.25-2.25V15c0-1.23-.013-2.432-.038-3.604a.75.75 0 0 0-.576-.576C6.013 10.647 5.605 10.628 5.25 10.5H3.75A2.25 2.25 0 0 0 1.5 12.75v1.5a2.25 2.25 0 0 0 2.25 2.25H6c1.206 0 2.3.412 3.202 1.102A9.718 9.718 0 0 1 12 16.5c1.969 0 3.782.587 5.298 1.598C18.7 18.81 19.5 19.5 19.5 21.75v.75A2.25 2.25 0 0 0 21.75 24h.001Z" />
  </svg>
);

const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 inline-block relative -top-px">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);


const ContactView: React.FC = () => {
  const developerImageUrl = "https://media.licdn.com/dms/image/v2/D5603AQHUZyBO2fqENg/profile-displayphoto-shrink_400_400/B56Zb2JPomGsAg-/0/1747886343278?e=1753920000&v=beta&t=YD4S_nBVeGZKLStZxR0N0Zb3C9bzPevM5DxeNqTRg3k";
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
      <h2 className="text-2xl sm:text-3xl font-semibold text-primary dark:text-primary-light mb-6 sm:mb-8 text-center">
        Contact Information
      </h2>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="relative bg-gray-50 dark:bg-gray-700/50 p-5 sm:p-6 rounded-lg shadow-inner overflow-hidden">
          <ParticleBackground />
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
            <div className={`w-32 h-32 sm:w-36 sm:h-36 flex-shrink-0 order-first sm:order-last rounded-full flex items-center justify-center overflow-hidden shadow-xl border-2 border-white dark:border-gray-600 ${imageError ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
              {imageError ? (
                <div className="text-gray-500 dark:text-gray-400" title="Image not available">
                  <UserIconPlaceholder />
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
            <div className="flex-1 order-last sm:order-first text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-semibold">
                <a
                    href="https://www.linkedin.com/in/tasinsohad/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary dark:text-primary-light hover:underline focus:outline-none focus:ring-1 focus:ring-primary-light rounded-sm"
                >
                    Tasin Sohad <ExternalLinkIcon />
                </a>
              </p>
              <p className="text-md sm:text-lg mt-1">Department of Banking & Insurance</p>
              <p className="text-md sm:text-lg">University Of Chittagong</p>
              <p className="text-sm sm:text-md text-gray-600 dark:text-gray-400">Session: 2021-2022</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
            <p className="text-md sm:text-lg">
                <span className="font-semibold">Profession:</span> Digital Marketing Specialist, AI Automation Facilitator, SEO Expert, Designer, and Video Editor.
            </p>
            <p className="text-sm sm:text-md text-gray-600 dark:text-gray-400">
                Working as a freelancer for foreign companies and clients.
            </p>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg sm:text-xl font-semibold text-primary-dark dark:text-primary-light mb-3">Get in Touch:</h3>
          <ul className="space-y-2 text-sm sm:text-base">
            <li>
                <EmailIcon />
                <a href="mailto:tasinsohad@outlook.com" className="text-primary dark:text-primary-light hover:underline">
                    tasinsohad@outlook.com
                </a>
            </li>
            <li>
                <EmailIcon />
                <a href="mailto:tasinsohad@yahoo.com" className="text-primary dark:text-primary-light hover:underline">
                    tasinsohad@yahoo.com
                </a>
            </li>
            <li>
                <PhoneIcon />
                <a href="tel:+8801766403483" className="text-primary dark:text-primary-light hover:underline">
                    +8801766403483
                </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContactView;