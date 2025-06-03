
import { useState, useEffect, useCallback } from 'react';
import { Coordinates } from '../types';

interface GeolocationHookResult {
  location: Coordinates | null;
  error: GeolocationPositionError | Error | null;
  startWatching: () => void;
  stopWatching: () => void;
  isWatching: boolean;
  permissionStatus: PermissionState | 'prompt' | 'unavailable';
}

const useGeolocation = (options?: PositionOptions): GeolocationHookResult => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<GeolocationPositionError | Error | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'prompt' | 'unavailable'>('prompt');

  const updatePermissionStatus = useCallback(async () => {
    if (!navigator.geolocation || !navigator.permissions) {
      setPermissionStatus('unavailable');
      return;
    }
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionStatus(status.state);
      status.onchange = () => setPermissionStatus(status.state);
    } catch (e) {
      // Browser might not support navigator.permissions.query for geolocation (e.g. older Safari)
      // Default to 'prompt' or handle based on specific browser if needed
      setPermissionStatus('prompt'); 
    }
  }, []);

  useEffect(() => {
    updatePermissionStatus();
  }, [updatePermissionStatus]);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    });
    setError(null); // Clear previous errors on success
  }, []);

  const stopWatchingInternal = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsWatching(false);
  }, [watchId]);

  const handleError = useCallback((err: GeolocationPositionError) => {
    console.error("Geolocation error:", err);
    setError(err);
    // If permission is denied, or another critical error, stop watching.
    if (err.code === err.PERMISSION_DENIED || err.code === err.POSITION_UNAVAILABLE) {
      stopWatchingInternal();
    }
    // Update permission status again in case it changed via prompt
    updatePermissionStatus();
  }, [stopWatchingInternal, updatePermissionStatus]);


  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation is not supported by your browser.'));
      setIsWatching(false);
      setPermissionStatus('unavailable');
      return;
    }
    if (isWatching || watchId !== null) { // Already watching
        return;
    }

    setIsWatching(true);
    setError(null); // Clear previous errors
    // Request location once to trigger permission prompt if needed, then watch
    navigator.geolocation.getCurrentPosition(
      (initialPos) => {
        handleSuccess(initialPos);
        // If getCurrentPosition is successful, start watching
        if (isWatching && watchId === null) { // Check isWatching again in case it was stopped
            const id = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
            setWatchId(id);
        }
      },
      (initialErr) => {
        handleError(initialErr);
        // Do not start watchPosition if getCurrentPosition fails (e.g. permission denied)
        setIsWatching(false); 
      },
      options
    );
    updatePermissionStatus(); // Update permission status after attempting to get location
  }, [isWatching, watchId, options, handleSuccess, handleError, updatePermissionStatus]);


  const stopWatching = useCallback(() => {
    stopWatchingInternal();
  }, [stopWatchingInternal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return { location, error, startWatching, stopWatching, isWatching, permissionStatus };
};

export default useGeolocation;
