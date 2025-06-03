
import { TrainLocation, Coordinates } from '../types';

const VALID_TOKEN = "TRACKSHUTTLE";
const ACTIVE_TRACKER_DEVICE_ID_KEY = 'activeTrackerDeviceId';
const CURRENT_TRAIN_LOCATION_DATA_KEY = 'currentTrainLocationData';

// Helper to get device ID (if needed, though App.tsx manages its own)
// export const getMyDeviceId = (): string => { /* ... */ };

export const registerTracker = async (deviceId: string, token: string): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    if (token !== VALID_TOKEN) {
      resolve({ success: false, message: "Invalid token." });
      return;
    }

    const currentTrackerId = localStorage.getItem(ACTIVE_TRACKER_DEVICE_ID_KEY);
    if (currentTrackerId && currentTrackerId !== deviceId) {
      resolve({ success: false, message: "Another device is already acting as the tracker." });
      return;
    }

    localStorage.setItem(ACTIVE_TRACKER_DEVICE_ID_KEY, deviceId);
    resolve({ success: true, message: "Device successfully registered as tracker." });
  });
};

export const unregisterTracker = async (deviceId: string): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    const currentTrackerId = localStorage.getItem(ACTIVE_TRACKER_DEVICE_ID_KEY);
    if (currentTrackerId !== deviceId) {
      resolve({ success: false, message: "This device was not the active tracker or no tracker was active." });
      return;
    }

    localStorage.removeItem(ACTIVE_TRACKER_DEVICE_ID_KEY);
    localStorage.removeItem(CURRENT_TRAIN_LOCATION_DATA_KEY); // Clear last known location
    resolve({ success: true, message: "Device unregistered. Tracking stopped." });
  });
};

export const updateTrackedLocation = async (deviceId: string, location: Coordinates): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    const currentTrackerId = localStorage.getItem(ACTIVE_TRACKER_DEVICE_ID_KEY);
    if (currentTrackerId !== deviceId) {
      resolve({ success: false, message: "This device is not the active tracker. Location not updated." });
      return;
    }

    const trainLocation: TrainLocation = {
      ...location,
      statusMessage: `Location updated by tracker at ${new Date(location.timestamp!).toLocaleTimeString([], { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`,
    };
    localStorage.setItem(CURRENT_TRAIN_LOCATION_DATA_KEY, JSON.stringify(trainLocation));
    resolve({ success: true, message: "Location successfully updated." });
  });
};

export const getTrackedTrainLocation = async (): Promise<TrainLocation | null> => {
  return new Promise((resolve) => {
    const activeTrackerId = localStorage.getItem(ACTIVE_TRACKER_DEVICE_ID_KEY);
    if (!activeTrackerId) {
      resolve(null); // No active tracker
      return;
    }

    const locationDataString = localStorage.getItem(CURRENT_TRAIN_LOCATION_DATA_KEY);
    if (locationDataString) {
      try {
        const locationData = JSON.parse(locationDataString) as TrainLocation;
        resolve(locationData);
      } catch (error) {
        console.error("Error parsing stored train location:", error);
        resolve(null); // Corrupted data
      }
    } else {
      resolve(null); // Tracker active, but no location data sent yet
    }
  });
};

export const isAnyTrackerActive = (): boolean => {
    return localStorage.getItem(ACTIVE_TRACKER_DEVICE_ID_KEY) !== null;
}

export const getActiveTrackerId = (): string | null => {
    return localStorage.getItem(ACTIVE_TRACKER_DEVICE_ID_KEY);
}
