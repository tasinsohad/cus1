
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrainLocation, Coordinates, View } from './types';
import {
  registerTracker,
  unregisterTracker,
  updateTrackedLocation,
  getTrackedTrainLocation,
  getActiveTrackerId,
} from './services/locationService';
import useGeolocation from './hooks/useGeolocation';
import { calculateDistance } from './utils/geo';
import LinearTrackDisplay, { Station } from './components/LinearTrackDisplay';
import AboutModal from './components/AboutModal';
import ScheduleView from './components/ScheduleView';
import ContactView from './components/ContactView';

// SVG Icons
const TrackIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 8.25 20.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
  </svg>
);
const BroadcastIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a.75.75 0 0 0 .75-.75V6.032l2.24 1.602a.75.75 0 0 0 .97-.065 24.006 24.006 0 0 0 4.252-6.017.75.75 0 0 0-1.22-.788L12 7.762l-6.992-5.001a.75.75 0 0 0-1.22.788 24.006 24.006 0 0 0 4.252 6.017.75.75 0 0 0 .97.065L11.25 6v12a.75.75 0 0 0 .75.75Z" />
  </svg>
);
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591M12 12a2.25 2.25 0 0 0-2.25 2.25c0 1.242.89 2.25 2.083 2.25H12a2.25 2.25 0 0 0 2.25-2.25c0-1.242-.89-2.25-2.083-2.25H12Z" />
  </svg>
);
const MoonIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);

const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const InfoIcon = ({ className = "w-5 h-5 mr-3" }: { className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);

const CalendarDaysIcon = ({ className = "w-6 h-6" }: { className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
  </svg>
);

const UserCircleIconMenu = ({ className = "w-6 h-6" }: { className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);


const CloseIcon = ({ className = "w-6 h-6"}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);


const SpinnerIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const LocationMarkerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
);

const MapIcon = ({ className = "w-5 h-5 mr-1" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-6.734 1.866-1.867a2.25 2.25 0 0 1 3.182 0l2.121 2.121a2.25 2.25 0 0 1 0 3.182L18.75 15M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const RouteIcon = ({ className = "w-5 h-5 mr-1" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-3.75 3.75h3.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);


// Placeholder CU Logo (White)
const CULogoWhite = () => (
  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary dark:text-primary-light" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    {/* Simplified CU-like Logo */}
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
    <path d="M7 11h10v2H7z"/>
  </svg>
);


// Default coordinates for University of Chittagong (approximate center)
const CU_DEFAULT_LAT = 22.4637;
const CU_DEFAULT_LNG = 91.8035;
const DEFAULT_MAP_ZOOM = 13;
const TRAIN_LOCATION_MAP_ZOOM = 16;

const ACTIVE_TRACKER_DEVICE_ID_KEY = 'activeTrackerDeviceId';
const CURRENT_TRAIN_LOCATION_DATA_KEY = 'currentTrainLocationData';
const AVERAGE_TRAIN_SPEED_KMH = 25; // km/h

type PermissionStatusForETA = 'prompt' | 'granted' | 'denied' | 'unavailable';
type TrackViewMode = 'map' | 'linear';

// CU Train Route Stations (South to North - City to Campus)
const CU_TRAIN_ROUTE_STATIONS: Station[] = [
  { name: "Bottoli Station", latitude: 22.3500, longitude: 91.8200 }, // Southernmost
  { name: "Dewanhat", latitude: 22.3530, longitude: 91.8180 },
  { name: "Jhawtola", latitude: 22.3560, longitude: 91.8170 },
  { name: "Sholoshohor Station", latitude: 22.3600, longitude: 91.8300 },
  { name: "Muradpur", latitude: 22.3650, longitude: 91.8350 },
  { name: "Technical Jn.", latitude: 22.3700, longitude: 91.8380 }, // Technical
  { name: "Cantonment Station", latitude: 22.3900, longitude: 91.8100 },
  { name: "Chowdhury Hat", latitude: 22.4200, longitude: 91.8050 }, // Chowdhuri Haat
  { name: "Fateyabad Station", latitude: 22.4400, longitude: 91.8000 }, // Foteyabaad
  { name: "CU Campus Station", latitude: 22.4700, longitude: 91.7950 } // Northernmost - CU Station
];


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.TrackShuttle);
  const [trainLocation, setTrainLocation] = useState<TrainLocation | null>(null);
  const [isLoadingTrainLocation, setIsLoadingTrainLocation] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [trackViewMode, setTrackViewMode] = useState<TrackViewMode>('map');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);


  const myDeviceId = useMemo(() => {
    let id = sessionStorage.getItem('myDeviceId');
    if (!id) {
      id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      sessionStorage.setItem('myDeviceId', id);
    }
    return id;
  }, []);

  const [isThisDeviceTheTracker, setIsThisDeviceTheTracker] = useState<boolean>(() => getActiveTrackerId() === myDeviceId);
  const [activeTrackerIdGlobal, setActiveTrackerIdGlobal] = useState<string | null>(getActiveTrackerId());


  const {
    location: deviceLocation,
    error: geoError,
    startWatching: startGeoWatch,
    stopWatching: stopGeoWatch,
    isWatching: isGeoWatching,
    permissionStatus
  } = useGeolocation({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });

  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastStatus, setBroadcastStatus] = useState<string>('');
  const [tokenInputValue, setTokenInputValue] = useState<string>('');
  const [tokenMessage, setTokenMessage] = useState<{text: string, type: 'error' | 'success' | 'info'} | null>(null);

  // State for Stop Tracking Confirmation Modal
  const [showStopTrackingModal, setShowStopTrackingModal] = useState<boolean>(false);
  const [stopTrackingConfirmInput, setStopTrackingConfirmInput] = useState<string>('');
  const [stopTrackingConfirmError, setStopTrackingConfirmError] = useState<string | null>(null);

  // ETA specific state
  const [userLocationForETA, setUserLocationForETA] = useState<Coordinates | null>(null);
  const [etaError, setEtaError] = useState<string | null>(null);
  const [isCalculatingETA, setIsCalculatingETA] = useState<boolean>(false);
  const [calculatedETAString, setCalculatedETAString] = useState<string | null>(null);
  const [distanceToTrainKm, setDistanceToTrainKm] = useState<number | null>(null);
  const [permissionStatusForETA, setPermissionStatusForETA] = useState<PermissionStatusForETA>('prompt');


  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const openAboutModal = () => {
    setIsAboutModalOpen(true);
    setIsMenuOpen(false); // Close menu when opening modal
  };
  const closeAboutModal = () => setIsAboutModalOpen(false);

  const navigateToView = (view: View) => {
    setCurrentView(view);
    setIsMenuOpen(false); // Close menu on navigation
  };

  const formatTime = useCallback((date: Date | null): string => {
    if (!date) return '';
    try {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Dhaka',
        hour12: true, // Or false for 24-hour format
      });
    } catch (e) {
      console.warn("Error formatting time with Asia/Dhaka timezone, falling back to local.", e);
      // Fallback to local timezone if 'Asia/Dhaka' is not supported or causes an error
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  }, []);


  useEffect(() => {
    if (currentView === View.TrackShuttle && activeTrackerIdGlobal) {
      const fetchLocation = async () => {
        setIsLoadingTrainLocation(true);
        try {
          const loc = await getTrackedTrainLocation();
          setTrainLocation(loc);
        } catch (err) {
          console.error("Failed to fetch shuttle location", err);
          setTrainLocation(null);
        } finally {
          setIsLoadingTrainLocation(false);
        }
      };

      fetchLocation(); // Initial fetch
      const intervalId = setInterval(fetchLocation, 1000); // Updated interval to 1 second
      return () => clearInterval(intervalId);
    } else if (currentView === View.TrackShuttle && !activeTrackerIdGlobal) {
        setTrainLocation(null); // Clear location if no tracker
        setIsLoadingTrainLocation(false);
    }
  }, [currentView, activeTrackerIdGlobal]);

  useEffect(() => {
    if (isThisDeviceTheTracker && isBroadcasting) {
      startGeoWatch();
    } else {
      stopGeoWatch();
    }
  }, [isThisDeviceTheTracker, isBroadcasting, startGeoWatch, stopGeoWatch]);


  useEffect(() => {
    if (!isBroadcasting || !isThisDeviceTheTracker) return;

    if (geoError) {
      setBroadcastStatus(`GPS Error: ${geoError.message}. Broadcasting may be impacted.`);
      if (geoError instanceof GeolocationPositionError) {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          // setIsBroadcasting(false); // Let user decide to stop via modal. Status reflects error.
          setTokenMessage({text: 'Location permission denied. Broadcasting impacted.', type: 'error'});
        }
      } else {
        console.error("A non-GeolocationPositionError occurred:", geoError);
      }
      return;
    }

    if (isGeoWatching) {
      if (deviceLocation) {
        updateTrackedLocation(myDeviceId, deviceLocation)
          .then(response => {
            if (response.success) {
              setBroadcastStatus(`Location sent: ${new Date(deviceLocation.timestamp!).toLocaleTimeString([], { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
            } else {
              setBroadcastStatus(`Failed to send: ${response.message}`);
              if (response.message.includes("not the active tracker")) {
                  setIsBroadcasting(false);
                  setIsThisDeviceTheTracker(false);
                  setActiveTrackerIdGlobal(getActiveTrackerId());
                  setTokenMessage({ text: "No longer the active tracker. Broadcasting stopped.", type: 'info'});
              }
            }
          })
          .catch(err => {
            setBroadcastStatus(`Error sending location: ${err.message}`);
          });
      } else {
        setBroadcastStatus('Waiting for GPS signal...');
      }
    } else { // Not isGeoWatching
        if (permissionStatus === 'denied') {
             setBroadcastStatus('Location permission denied. Broadcasting impacted.');
             setTokenMessage({text: 'Location permission denied. Broadcasting impacted.', type: 'error'});
             // setIsBroadcasting(false); // Let user decide to stop
        } else if (permissionStatus === 'prompt' && !geoError) {
             setBroadcastStatus('Waiting for location permission...');
        } else if (permissionStatus === 'unavailable' ) {
            setBroadcastStatus('Geolocation is unavailable on this device.');
            setTokenMessage({text: 'Geolocation is unavailable. Broadcasting impossible.', type: 'error'});
            setIsBroadcasting(false); // Cannot broadcast if unavailable
        } else if (isThisDeviceTheTracker && isBroadcasting && !geoError) {
            setBroadcastStatus('Attempting to acquire GPS and start broadcast...');
        }
    }
  }, [deviceLocation, geoError, isBroadcasting, isGeoWatching, permissionStatus, myDeviceId, isThisDeviceTheTracker, formatTime]);


  const handleBecomeTracker = async () => {
    setTokenMessage(null);
    if (!tokenInputValue) {
      setTokenMessage({text: "Token cannot be empty.", type: 'error'});
      return;
    }
    if (permissionStatus === 'denied' || permissionStatus === 'unavailable') {
        setTokenMessage({ text: `Cannot become tracker: Location permission is ${permissionStatus}.`, type: 'error' });
        return;
    }

    const response = await registerTracker(myDeviceId, tokenInputValue);
    if (response.success) {
      setIsThisDeviceTheTracker(true);
      setActiveTrackerIdGlobal(myDeviceId);
      setIsBroadcasting(true); // Start broadcasting immediately
      setBroadcastStatus('Registered as tracker. Broadcasting location...');
      setTokenMessage({text: response.message, type: 'success'});
    } else {
      setTokenMessage({text: response.message, type: 'error'});
      setActiveTrackerIdGlobal(getActiveTrackerId());
    }
  };

  const handleOpenStopTrackingModal = () => {
    setStopTrackingConfirmInput('');
    setStopTrackingConfirmError(null);
    setShowStopTrackingModal(true);
  };

  const handleConfirmStopTracking = async () => {
    if (stopTrackingConfirmInput === "CONFIRM") {
      await handleStopTrackingAndLogout();
      setShowStopTrackingModal(false);
    } else {
      setStopTrackingConfirmError("Incorrect confirmation. Please type 'CONFIRM'.");
    }
  };

  const handleStopTrackingAndLogout = async () => {
    setIsBroadcasting(false); // Stop geolocation watch and broadcasting
    stopGeoWatch(); // Explicitly stop watching
    const response = await unregisterTracker(myDeviceId);
    setBroadcastStatus('Broadcasting stopped by user.'); // Set status before potential message override
    if (response.success) {
      setIsThisDeviceTheTracker(false);
      setActiveTrackerIdGlobal(null);
      setTokenInputValue('');
      setTokenMessage({text: response.message, type: 'info'});
    } else {
      // If unregister failed, re-check who is the tracker
      const currentActiveId = getActiveTrackerId();
      setIsThisDeviceTheTracker(currentActiveId === myDeviceId);
      setActiveTrackerIdGlobal(currentActiveId);
      setTokenMessage({text: response.message, type: 'error'});
      if (currentActiveId === myDeviceId) {
          // If still this device, maybe try to restart broadcasting or show error
          // For now, we keep it simple: token message shows the error.
          // setIsBroadcasting(true); // Or prompt user?
      }
    }
  };

  useEffect(() => {
    const currentActiveId = getActiveTrackerId();
    setActiveTrackerIdGlobal(currentActiveId);
    const isThisDeviceStillTracker = currentActiveId === myDeviceId;
    setIsThisDeviceTheTracker(isThisDeviceStillTracker);

    if (!isThisDeviceStillTracker && isBroadcasting) {
        setIsBroadcasting(false); // Stop broadcasting if this device is no longer the registered tracker
        setBroadcastStatus("Stopped broadcasting: this device is no longer the active tracker.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myDeviceId, currentView]); // Removed isBroadcasting from deps to avoid loop with setIsBroadcasting


  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === ACTIVE_TRACKER_DEVICE_ID_KEY || event.key === CURRENT_TRAIN_LOCATION_DATA_KEY) {
        const currentActiveIdFromStorage = getActiveTrackerId();
        setActiveTrackerIdGlobal(currentActiveIdFromStorage);
        const stillThisDeviceTracker = currentActiveIdFromStorage === myDeviceId;

        if (isThisDeviceTheTracker && !stillThisDeviceTracker) {
          setIsThisDeviceTheTracker(false);
          setIsBroadcasting(false); // Stop broadcasting
          setBroadcastStatus("Stopped broadcasting: another device became the tracker.");
          setTokenMessage({ text: "Another device has taken over. You've been logged out from tracking.", type: 'info' });
          setShowStopTrackingModal(false); // Close confirm modal if open
        } else {
          setIsThisDeviceTheTracker(stillThisDeviceTracker);
        }

        if (event.key === CURRENT_TRAIN_LOCATION_DATA_KEY && currentView === View.TrackShuttle) {
          if (currentActiveIdFromStorage) {
            getTrackedTrainLocation().then(loc => setTrainLocation(loc));
          } else {
            setTrainLocation(null);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [myDeviceId, currentView, isThisDeviceTheTracker, isBroadcasting]); // Added isBroadcasting


  useEffect(() => {
    const fetchUserLocationForETA = async () => {
      setIsCalculatingETA(true);
      setEtaError(null);

      if (!navigator.geolocation) {
        setEtaError("Geolocation is not supported by your browser.");
        setPermissionStatusForETA('unavailable');
        setIsCalculatingETA(false);
        return;
      }

      try {
        if (typeof navigator.permissions?.query === 'function') {
          const status = await navigator.permissions.query({ name: 'geolocation' });
          setPermissionStatusForETA(status.state as PermissionStatusForETA);
          if (status.state === 'denied') {
            setEtaError("Location permission denied. Please enable it in your browser settings to calculate ETA.");
            setIsCalculatingETA(false);
            return;
          }
        } else {
           if (permissionStatusForETA === 'denied') {
             setEtaError("Location permission denied. Please enable it in your browser settings to calculate ETA.");
             setIsCalculatingETA(false);
             return;
           }
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
        });

        const currentUserLoc: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setUserLocationForETA(currentUserLoc);
        setPermissionStatusForETA('granted'); // If we get here, permission is granted

        if (trainLocation) {
          const distance = calculateDistance(currentUserLoc, trainLocation);
          setDistanceToTrainKm(distance);
          const timeHours = distance / AVERAGE_TRAIN_SPEED_KMH;
          const timeMillis = timeHours * 60 * 60 * 1000;
          const etaDate = new Date(Date.now() + timeMillis);
          setCalculatedETAString(formatTime(etaDate));
        } else {
          setEtaError("Shuttle location not available to calculate ETA.");
          setCalculatedETAString(null);
          setDistanceToTrainKm(null);
        }
      } catch (err: any) {
        if (err.code === err.PERMISSION_DENIED) {
          setEtaError("Location permission denied. Please enable it in your browser settings to calculate ETA.");
          setPermissionStatusForETA('denied');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setEtaError("Location information is unavailable. Ensure GPS is enabled.");
          setPermissionStatusForETA('unavailable'); // Or could be 'prompt' if it was a temp issue
        } else if (err.code === err.TIMEOUT) {
          setEtaError("Getting location timed out. Please try again.");
        } else {
          setEtaError("An error occurred while fetching your location.");
        }
        console.error("Error fetching user location for ETA:", err);
        setUserLocationForETA(null);
        setCalculatedETAString(null);
        setDistanceToTrainKm(null);
      } finally {
        setIsCalculatingETA(false);
      }
    };

    if (currentView === View.TrackShuttle && trainLocation) {
      // Auto-fetch or offer button? For now, auto-fetch if permission was previously granted or is prompt.
      if (permissionStatusForETA === 'granted' || permissionStatusForETA === 'prompt') {
        fetchUserLocationForETA();
      }
    } else if (currentView !== View.TrackShuttle || !trainLocation) {
      // Clear ETA info if not on track shuttle view or no train location
      setCalculatedETAString(null);
      setDistanceToTrainKm(null);
      setEtaError(null);
      // Don't reset permissionStatusForETA here, as it reflects actual permission state
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, trainLocation, formatTime]); // Don't add permissionStatusForETA to avoid loops on its change


  const renderMapOverlay = () => (
    <div className="absolute bottom-2 right-2 left-2 md:left-auto bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 text-xs max-w-md mx-auto md:mx-0">
      {isLoadingTrainLocation && !trainLocation && (
        <div className="flex items-center justify-center text-gray-600 dark:text-gray-300">
          <SpinnerIcon className="w-4 h-4 mr-2" /> Loading shuttle location...
        </div>
      )}
      {trainLocation && (
        <>
          <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
            CU Shuttle Location <span className="text-green-500">(Live)</span>
            {isLoadingTrainLocation && <SpinnerIcon className="w-3 h-3 ml-2 inline animate-spin" />}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Lat:</span> {trainLocation.latitude.toFixed(4)}, <span className="font-medium">Lng:</span> {trainLocation.longitude.toFixed(4)}
          </p>
          {trainLocation.accuracy && (
            <p className="text-gray-500 dark:text-gray-400">
              <span className="font-medium">Accuracy:</span> {trainLocation.accuracy.toFixed(0)}m
            </p>
          )}
          {trainLocation.timestamp && (
            <p className="text-gray-500 dark:text-gray-400">
              <span className="font-medium">Last Update:</span> {new Date(trainLocation.timestamp).toLocaleTimeString([], { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </p>
          )}
          {trainLocation.statusMessage && (
            <p className="mt-1 text-xs text-primary dark:text-primary-light italic">{trainLocation.statusMessage}</p>
          )}

          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            {isCalculatingETA && <p className="text-sm text-gray-600 dark:text-gray-300"><SpinnerIcon className="w-3 h-3 mr-1 inline" /> Calculating ETA...</p>}
            {etaError && <p className="text-sm text-red-500 dark:text-red-400">{etaError}</p>}
            {calculatedETAString && distanceToTrainKm !== null && (
              <p className="text-sm text-gray-700 dark:text-gray-200">
                <span className="font-semibold">Est. Arrival Time (to you):</span> {calculatedETAString}
                <span className="text-xs block text-gray-500 dark:text-gray-400"> (Approx. {distanceToTrainKm.toFixed(1)} km away)</span>
              </p>
            )}
             {permissionStatusForETA === 'prompt' && !isCalculatingETA && !etaError && (
                <button
                    onClick={() => { 
                        setIsCalculatingETA(true); 
                        setEtaError(null);
                        navigator.geolocation.getCurrentPosition(
                            async (position) => {
                                const currentUserLoc: Coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, timestamp: position.timestamp };
                                setUserLocationForETA(currentUserLoc);
                                setPermissionStatusForETA('granted');
                                if (trainLocation) {
                                    const distance = calculateDistance(currentUserLoc, trainLocation);
                                    setDistanceToTrainKm(distance);
                                    const timeHours = distance / AVERAGE_TRAIN_SPEED_KMH;
                                    const timeMillis = timeHours * 60 * 60 * 1000;
                                    const etaDate = new Date(Date.now() + timeMillis);
                                    setCalculatedETAString(formatTime(etaDate));
                                }
                                setIsCalculatingETA(false);
                            },
                            (err) => {
                                if (err.code === err.PERMISSION_DENIED) { setEtaError("Location permission denied."); setPermissionStatusForETA('denied');}
                                else { setEtaError("Could not get location for ETA."); }
                                setIsCalculatingETA(false);
                            },
                            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
                        );
                    }}
                    className="mt-1 w-full text-xs bg-secondary hover:bg-yellow-500 text-primary-dark font-semibold py-1 px-2 rounded focus:outline-none focus:ring-2 ring-secondary"
                >
                    Calculate My ETA
                </button>
            )}
            {permissionStatusForETA === 'denied' && !etaError && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Enable location permission to calculate ETA.</p>
            )}
          </div>
        </>
      )}
      {!trainLocation && !isLoadingTrainLocation && activeTrackerIdGlobal && (
           <p className="text-center text-gray-600 dark:text-gray-400">Waiting for shuttle data...</p>
      )}
    </div>
  );

 const renderTrackShuttleView = () => {
    let mapFrameKey = 'default-map';
    let currentMapSrc = `https://maps.google.com/maps?q=${CU_DEFAULT_LAT},${CU_DEFAULT_LNG}&z=${DEFAULT_MAP_ZOOM}&output=embed&hl=en`;

    if (trainLocation) {
      currentMapSrc = `https://maps.google.com/maps?q=${trainLocation.latitude},${trainLocation.longitude}&z=${TRAIN_LOCATION_MAP_ZOOM}&output=embed&hl=en`;
      mapFrameKey = `${trainLocation.latitude}-${trainLocation.longitude}-${trainLocation.timestamp}`;
    }

    const commonContainerClasses = "w-full h-[calc(100vh-220px)] min-h-[300px] sm:h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] lg:h-[calc(100vh-160px)] max-h-[700px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg border border-gray-300 dark:border-gray-600 p-4";

    return (
        <div className="flex-grow flex flex-col items-center justify-start p-3 sm:p-4 md:p-6 relative">
            <div className="w-full max-w-5xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl sm:text-2xl font-semibold text-primary dark:text-primary-light">
                        Shuttle Tracker
                    </h2>
                    <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                        <button
                            onClick={() => setTrackViewMode('map')}
                            className={`flex items-center px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md ${trackViewMode === 'map' ? 'bg-white dark:bg-gray-900 text-primary dark:text-primary-light shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                            aria-pressed={trackViewMode === 'map'}
                        >
                            <MapIcon/> Map
                        </button>
                        <button
                            onClick={() => setTrackViewMode('linear')}
                            className={`flex items-center px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md ${trackViewMode === 'linear' ? 'bg-white dark:bg-gray-900 text-primary dark:text-primary-light shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                            aria-pressed={trackViewMode === 'linear'}
                        >
                           <RouteIcon/> Route
                        </button>
                    </div>
                </div>

                {!activeTrackerIdGlobal && !isLoadingTrainLocation ? (
                    <div className={commonContainerClasses}>
                        <p className="text-lg text-center text-orange-600 dark:text-orange-400 font-semibold">
                            Shuttle tracking is currently offline. <br /> No active tracking device.
                        </p>
                    </div>
                ) : isLoadingTrainLocation && !trainLocation ? (
                    <div className={commonContainerClasses}>
                        <SpinnerIcon className="w-8 h-8 mr-3 text-primary dark:text-primary-light" />
                        <p className="text-lg text-gray-600 dark:text-gray-300">Loading shuttle location...</p>
                    </div>
                ) : activeTrackerIdGlobal && !trainLocation && !isLoadingTrainLocation ? (
                    <div className={commonContainerClasses}>
                        <p className="text-lg text-center text-gray-600 dark:text-gray-400 font-semibold">
                            Shuttle location data not yet available. <br/> Waiting for tracker updates...
                        </p>
                    </div>
                ) : activeTrackerIdGlobal && (trainLocation || isLoadingTrainLocation) ? (
                    <>
                        {trackViewMode === 'map' && (
                          <div className="relative w-full h-[calc(100vh-220px)] min-h-[300px] sm:h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] lg:h-[calc(100vh-160px)] max-h-[700px] bg-gray-200 dark:bg-gray-700/50 rounded-xl shadow-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                            <iframe
                                key={mapFrameKey}
                                src={currentMapSrc}
                                width="100%"
                                height="100%"
                                style={{ border:0 }}
                                allowFullScreen={false}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="CU Shuttle Location Map"
                            ></iframe>
                            {renderMapOverlay()}
                          </div>
                        )}
                        {trackViewMode === 'linear' && (
                            <LinearTrackDisplay
                                trainLocation={trainLocation}
                                routeStations={CU_TRAIN_ROUTE_STATIONS}
                            />
                        )}
                    </>
                ) : (
                    <div className={commonContainerClasses}>
                        <p className="text-lg text-center text-gray-500 dark:text-gray-400">
                            Unable to display shuttle information at this time.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
  };


  const renderBeTrackerView = () => (
    <div className="flex-grow flex flex-col items-center justify-start p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-5 sm:p-6 md:p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl sm:text-2xl font-semibold text-primary dark:text-primary-light mb-6 text-center">
          Broadcast Shuttle Location
        </h2>

        {!isThisDeviceTheTracker || !isBroadcasting ? (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Enter the valid token to register this device as the shuttle tracker.
              Your location will be broadcasted as the shuttle's current position.
            </p>
            <div className="mb-4">
              <label htmlFor="trackerToken" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Tracker Token
              </label>
              <input
                type="password"
                id="trackerToken"
                value={tokenInputValue}
                onChange={(e) => setTokenInputValue(e.target.value)}
                placeholder="Enter token"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                aria-describedby="tokenMessage"
              />
            </div>
            {tokenMessage && (
                <p id="tokenMessage" className={`text-xs mt-2 mb-3 p-2 rounded-md ${
                    tokenMessage.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700' :
                    tokenMessage.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                }`} role="alert">
                    {tokenMessage.text}
                </p>
            )}
            {permissionStatus === 'denied' && (
              <p className="text-xs text-red-500 dark:text-red-400 mb-3 p-2 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
                Location permission is denied. You must enable location access in your browser/device settings to become a tracker.
              </p>
            )}
            {permissionStatus === 'unavailable' && (
                 <p className="text-xs text-red-500 dark:text-red-400 mb-3 p-2 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
                    Geolocation is unavailable on this device. Cannot become a tracker.
                 </p>
            )}
            <button
              onClick={handleBecomeTracker}
              disabled={permissionStatus === 'denied' || permissionStatus === 'unavailable'}
              className="w-full bg-primary hover:bg-primary-dark focus:bg-primary-dark text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Broadcasting
            </button>
            {activeTrackerIdGlobal && activeTrackerIdGlobal !== myDeviceId && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 p-2 rounded-md bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700">
                    Note: Another device ({activeTrackerIdGlobal.substring(0,6)}...) is currently the active tracker. Starting broadcast here will attempt to take over.
                </p>
            )}
          </>
        ) : (
          <div className="text-center">
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
                <p className="text-lg font-semibold text-green-700 dark:text-green-300 flex items-center justify-center">
                    <BroadcastIcon /> <span className="ml-2">Broadcasting Live!</span>
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">This device is the active shuttle tracker.</p>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
              <p className="font-medium mb-1">Current Status:</p>
              <p className="text-xs break-words">
                {isGeoWatching && !geoError ? 'Actively sending location updates.' : 
                 geoError ? `GPS Error: ${geoError.message}` : 
                 permissionStatus === 'prompt' ? 'Waiting for location permission...' :
                 permissionStatus === 'denied' ? 'Location permission denied. Broadcasting impacted.' :
                 'Initializing GPS...'}
              </p>
              {broadcastStatus && <p className="mt-1 text-xs italic text-primary dark:text-primary-light">{broadcastStatus}</p>}
            </div>

            {deviceLocation && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 p-2 rounded-md border border-gray-200 dark:border-gray-600">
                <p>Lat: {deviceLocation.latitude.toFixed(5)}, Lon: {deviceLocation.longitude.toFixed(5)}</p>
                <p>Accuracy: {deviceLocation.accuracy?.toFixed(1)}m, Time: {formatTime(new Date(deviceLocation.timestamp!))}</p>
              </div>
            )}
            <button
              onClick={handleOpenStopTrackingModal}
              className="w-full bg-red-600 hover:bg-red-700 focus:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 dark:focus:ring-offset-gray-800"
            >
              Stop Broadcasting
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderStopTrackingModal = () => {
    if (!showStopTrackingModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4"  onClick={() => setShowStopTrackingModal(false)}>
        <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 ease-out animate-modal-appear" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="stop-tracking-modal-title"
        >
          <h3 id="stop-tracking-modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Confirm Stop Broadcasting</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Are you sure you want to stop broadcasting this device's location as the shuttle?
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Users will no longer see live updates from this device.
          </p>
           <div className="mb-4">
              <label htmlFor="stopConfirmInput" className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                Type "CONFIRM" to stop:
              </label>
              <input
                type="text"
                id="stopConfirmInput"
                value={stopTrackingConfirmInput}
                onChange={(e) => {
                    setStopTrackingConfirmInput(e.target.value);
                    if (stopTrackingConfirmError) setStopTrackingConfirmError(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="CONFIRM"
              />
              {stopTrackingConfirmError && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{stopTrackingConfirmError}</p>}
            </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowStopTrackingModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmStopTracking}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 disabled:opacity-60"
              disabled={stopTrackingConfirmInput !== "CONFIRM"}
            >
              Stop Broadcasting
            </button>
          </div>
        </div>
      </div>
    );
  };


  // NavButton for bottom bar
  const NavButtonMobile = ({ view, label, Icon }: { view: View, label: string, Icon: React.FC<{ className?: string }> }) => (
    <button
      onClick={() => navigateToView(view)}
      className={`flex flex-col items-center justify-center w-1/3 p-2 
                  ${currentView === view ? 'text-primary dark:text-primary-light' : 'text-gray-500 dark:text-gray-400'} 
                  hover:text-primary dark:hover:text-primary-light transition-colors duration-150 focus:outline-none rounded-lg focus:ring-2 focus:ring-primary-light`}
      aria-current={currentView === view ? "page" : undefined}
    >
      <Icon className={`w-6 h-6 mb-0.5 ${currentView === view ? 'text-primary dark:text-primary-light' : ''}`} />
      <span className="text-xs">{label}</span>
    </button>
  );

  // NavButton for desktop header
  const NavButtonDesktop = ({ view, label }: { view: View, label: string }) => (
    <button
      onClick={() => navigateToView(view)}
      className={`px-3 py-2 rounded-md text-sm font-medium
                  ${currentView === view ? 'bg-primary-light text-primary dark:bg-gray-700 dark:text-primary-light' : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light hover:bg-primary-light dark:hover:bg-gray-700'}`}
      aria-current={currentView === view ? "page" : undefined}
    >
      {label}
    </button>
  );

  const renderMobileMenu = () => {
      if (!isMenuOpen) return null;

      const menuItemClass = (view: View) =>
        `flex items-center px-4 py-3 text-sm rounded-md ${
          currentView === view
            ? 'bg-primary text-white dark:bg-primary-dark'
            : 'text-gray-700 dark:text-gray-200 hover:bg-primary-light hover:text-primary dark:hover:bg-gray-700 dark:hover:text-primary-light'
        }`;
      
      const menuItemClassNoView = `flex items-center px-4 py-3 text-sm rounded-md text-gray-700 dark:text-gray-200 hover:bg-primary-light hover:text-primary dark:hover:bg-gray-700 dark:hover:text-primary-light`;

      return (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" onClick={toggleMenu}></div>

          {/* Sidebar */}
          <div className="fixed top-0 right-0 bottom-0 w-3/4 max-w-xs bg-white dark:bg-gray-800 shadow-xl p-4 overflow-y-auto transition-transform duration-300 ease-in-out transform"
               style={{ transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)' }}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <CULogoWhite />
                <span className="ml-2 text-lg font-semibold text-primary dark:text-primary-light">CU Shuttle</span>
              </div>
              <button onClick={toggleMenu} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" aria-label="Close menu">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-2">
              <a href="#" onClick={(e) => { e.preventDefault(); navigateToView(View.TrackShuttle); }} className={menuItemClass(View.TrackShuttle)}><TrackIcon className="w-5 h-5 mr-3"/> Track Shuttle</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigateToView(View.BeTracker); }} className={menuItemClass(View.BeTracker)}><BroadcastIcon className="w-5 h-5 mr-3"/> Be a Tracker</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigateToView(View.Schedule); }} className={menuItemClass(View.Schedule)}><CalendarDaysIcon className="w-5 h-5 mr-3" /> Schedule</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigateToView(View.Contact); }} className={menuItemClass(View.Contact)}><UserCircleIconMenu className="w-5 h-5 mr-3"/> Contact</a>
              <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700"></div>
              <a href="#" onClick={(e) => { e.preventDefault(); openAboutModal(); }} className={menuItemClassNoView}><InfoIcon className="w-5 h-5 mr-3"/> About</a>
            </nav>
          </div>
        </div>
      );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case View.TrackShuttle:
        return renderTrackShuttleView();
      case View.BeTracker:
        return renderBeTrackerView();
      case View.Schedule:
        return <ScheduleView />;
      case View.Contact:
        return <ContactView />; 
      default:
        return renderTrackShuttleView();
    }
  };


  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-3 sm:px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <CULogoWhite />
            <h1 className="text-lg sm:text-xl font-semibold text-primary dark:text-primary-light ml-2">
              CU Shuttle Tracker
            </h1>
          </div>

          {/* Desktop Navigation (Hidden on md and below) */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavButtonDesktop view={View.TrackShuttle} label="Track Shuttle" />
            <NavButtonDesktop view={View.BeTracker} label="Be a Tracker" />
            <NavButtonDesktop view={View.Schedule} label="Schedule" />
            <NavButtonDesktop view={View.Contact} label="Contact" />
            <button onClick={openAboutModal} className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light px-3 py-2 rounded-md text-sm font-medium flex items-center">
               <InfoIcon className="w-4 h-4 mr-1.5"/> About
            </button>
            <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-gray-800"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>
          </nav>
          
          {/* Mobile Menu Button & Dark Mode Toggle (visible on md and below) */}
          <div className="md:hidden flex items-center">
             <button
                onClick={toggleDarkMode}
                className="p-2 mr-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-gray-800"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-gray-800"
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </header>

      {renderMobileMenu()}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-0 sm:px-4 py-4 relative z-0" style={{paddingBottom: 'env(safe-area-inset-bottom, 0)'}}>
        {renderCurrentView()}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-top p-1 border-t border-gray-200 dark:border-gray-700 z-30 flex justify-around items-center"
           style={{paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.25rem)'}} // 0.25rem is p-1
      >
        <NavButtonMobile view={View.TrackShuttle} label="Track" Icon={TrackIcon} />
        <NavButtonMobile view={View.BeTracker} label="Broadcast" Icon={BroadcastIcon} />
        <NavButtonMobile view={View.Schedule} label="Schedule" Icon={CalendarDaysIcon} />
      </nav>

      {renderStopTrackingModal()}
      {isAboutModalOpen && <AboutModal isOpen={isAboutModalOpen} onClose={closeAboutModal} />}
    </div>
  );
};

export default App;
