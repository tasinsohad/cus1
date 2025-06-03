
import React, { useMemo } from 'react';
import { TrainLocation, Coordinates } from '../types';

export interface Station extends Coordinates {
  name: string;
}

interface LinearTrackDisplayProps {
  trainLocation: TrainLocation | null;
  routeStations: Station[]; 
}

const TrainIconSVG = ({ className = "w-7 h-7 text-primary dark:text-primary-light" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 2C4.89543 2 4 2.89543 4 4V17.0858C4 17.6232 4.22386 18.1373 4.61454 18.5028L6.09969 19.9003C6.49149 20.2721 6.99036 20.5022 7.51436 20.5295L7.57143 20.5301C8.01436 20.5271 8.50292 20.3033 8.90031 19.9003L10.3855 18.5028C10.7761 18.1373 11 17.6232 11 17.0858V4C11 2.89543 10.1046 2 9 2H6Z" />
    <path d="M13 4C13 2.89543 13.8954 2 15 2H18C19.1046 2 20 2.89543 20 4V17.0858C20 17.6232 19.7761 18.1373 19.3855 18.5028L17.9003 19.9003C17.5085 20.2721 17.0096 20.5022 16.4856 20.5295L16.4286 20.5301C15.9856 20.5271 15.4971 20.3033 15.0997 19.9003L13.6145 18.5028C13.2239 18.1373 13 17.6232 13 17.0858V4Z" />
    <path d="M4 21H20C20.5523 21 21 21.4477 21 22C21 22.5523 20.5523 23 20 23H4C3.44772 23 3 22.5523 3 22C3 21.4477 3.44772 21 4 21Z" />
  </svg>
);


const CheckmarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-2.5 h-2.5 text-white">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);


const LinearTrackDisplay: React.FC<LinearTrackDisplayProps> = ({ trainLocation, routeStations }) => {
  const STATION_ROW_HEIGHT = 64; // Approx height for each station row in pixels (adjust as needed for styling)
  const MARKER_AREA_WIDTH = 40; // Width of the area containing markers and lines

  const {
    stationsWithState,
    trainPositionStyle,
    activeSegmentIndices,
  } = useMemo(() => {
    if (!routeStations || routeStations.length < 1) {
      return { stationsWithState: [], trainPositionStyle: { display: 'none' }, activeSegmentIndices: null };
    }

    const sortedStations = [...routeStations].sort((a, b) => a.latitude - b.latitude); // South to North
    const minLat = sortedStations[0].latitude;
    const maxLat = sortedStations[sortedStations.length - 1].latitude;
    const totalTrackSpanLat = maxLat - minLat;

    let trainLat = trainLocation?.latitude;
    let currentTrainProgressPercent = -1; // Overall progress from first to last station
    let currentActiveSegmentIndices: { start: number; end: number } | null = null;
    
    if (trainLocation && trainLat !== undefined && totalTrackSpanLat > 0) {
        trainLat = Math.max(minLat, Math.min(maxLat, trainLat)); // Clamp train_lat within route bounds
        currentTrainProgressPercent = ((trainLat - minLat) / totalTrackSpanLat) * 100;

        for (let i = 0; i < sortedStations.length - 1; i++) {
            if (trainLat >= sortedStations[i].latitude && trainLat <= sortedStations[i + 1].latitude) {
                currentActiveSegmentIndices = { start: i, end: i + 1 };
                break;
            }
        }
         // Handle if train is exactly at the last station or beyond (clamped)
        if (!currentActiveSegmentIndices && trainLat >= sortedStations[sortedStations.length -1].latitude) {
            currentActiveSegmentIndices = { start: sortedStations.length -2, end: sortedStations.length -1};
        }
         // Handle if train is before the first station (clamped)
        if (!currentActiveSegmentIndices && trainLat <= sortedStations[0].latitude) {
             currentActiveSegmentIndices = { start: 0, end: 1};
        }

    }


    const newStationsWithState = sortedStations.map((station, index) => {
      let state: 'passed' | 'current' | 'upcoming' = 'upcoming';
      if (trainLat !== undefined) {
        const proximityThreshold = 0.0002; // Latitude difference to consider "at" station
        if (Math.abs(trainLat - station.latitude) < proximityThreshold) {
          state = 'current';
        } else if (trainLat > station.latitude) {
          state = 'passed';
        }
      }
      return { ...station, state, originalIndex: index }; // Keep originalIndex if needed for calculations
    });
    
    const displayHeight = sortedStations.length * STATION_ROW_HEIGHT;
    const trainTopOffset = (currentTrainProgressPercent / 100) * (displayHeight - STATION_ROW_HEIGHT) + (STATION_ROW_HEIGHT / 2) - 14 ; // 14 is half of icon height approx

    return {
      stationsWithState: newStationsWithState,
      trainPositionStyle: trainLocation && currentTrainProgressPercent >=0 ? {
        top: `${trainTopOffset}px`,
        left: `${MARKER_AREA_WIDTH / 2}px`, // Center in marker area
        transform: 'translate(-50%, -50%)', // Center icon itself
        display: 'block',
      } : { display: 'none' },
      activeSegmentIndices: currentActiveSegmentIndices,
    };
  }, [trainLocation, routeStations, STATION_ROW_HEIGHT]);

  if (!routeStations || routeStations.length === 0) {
    return (
      <div className="w-full h-72 sm:h-80 md:h-96 flex flex-col justify-center items-center bg-gray-200 dark:bg-gray-700/50 rounded-xl shadow-lg p-6 border border-gray-300 dark:border-gray-600">
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading route data...</p>
      </div>
    );
  }
  
  const getShortName = (name: string) => name.replace(" Station", " St.").replace(" Junction", " Jn.").replace("Technical", "Tech.").replace("Chowdhury Hat", "Ch. Hat");

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
      {/* Train Status Header */}
      {trainLocation && trainLocation.timestamp && (
         <div className="mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Last Update: <span className="font-semibold font-mono">{new Date(trainLocation.timestamp).toLocaleTimeString([], { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
            </p>
            {/* Could add direction text here if calculated */}
         </div>
      )}
      {!trainLocation && (
         <div className="mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 text-center">
            <p className="text-lg text-gray-500 dark:text-gray-400">Waiting for live shuttle location...</p>
         </div>
      )}

      <div className="relative" style={{ minHeight: `${stationsWithState.length * STATION_ROW_HEIGHT}px` }}>
        {/* Train Icon - Placed above stations so it can overlay lines */}
        <div className="absolute z-20 transition-all duration-500 ease-linear" style={trainPositionStyle}>
          <TrainIconSVG />
        </div>

        {stationsWithState.map((station, index) => {
          const isFirst = index === 0;
          const isLast = index === stationsWithState.length - 1;
          
          let markerClass = 'bg-gray-400 dark:bg-gray-500'; // Upcoming default
          let textClass = 'text-gray-700 dark:text-gray-300';
          let lineClassTop = 'bg-gray-300 dark:bg-gray-600';
          let lineClassBottom = 'bg-gray-300 dark:bg-gray-600';

          if (station.state === 'passed') {
            markerClass = 'bg-green-500 dark:bg-green-600'; // Green for passed, with checkmark
            textClass = 'text-gray-500 dark:text-gray-400 line-through';
            lineClassTop = 'bg-primary dark:bg-primary-light'; 
            lineClassBottom = 'bg-primary dark:bg-primary-light';
          } else if (station.state === 'current') {
            markerClass = 'bg-primary dark:bg-primary-light ring-2 ring-offset-2 ring-primary-light dark:ring-offset-gray-800 dark:ring-primary animate-pulse';
            textClass = 'font-bold text-primary dark:text-primary-light';
          }

          // Highlight active segment line
          if(activeSegmentIndices) {
            if (index === activeSegmentIndices.start) { // If this station is the start of active segment
                 lineClassBottom = 'bg-primary dark:bg-primary-light';
            }
            if (index > activeSegmentIndices.start && index <= activeSegmentIndices.end) { // If station is within active segment
                lineClassTop = 'bg-primary dark:bg-primary-light';
                lineClassBottom = 'bg-primary dark:bg-primary-light';
            }
            // If station is the end of an active segment, but train hasn't passed it yet
            if (index === activeSegmentIndices.end && station.state !== 'passed') {
                 lineClassTop = 'bg-primary dark:bg-primary-light';
            }
            // Ensure passed segments before active are fully primary color
            if (trainLocation && station.latitude < trainLocation.latitude && index < activeSegmentIndices.start){
                lineClassTop = 'bg-primary dark:bg-primary-light';
                lineClassBottom = 'bg-primary dark:bg-primary-light';
            }
          }
          // If it's the last station and it's part of the active segment (or passed), its top line should be active.
          if (isLast && activeSegmentIndices?.end === index && station.state !== 'upcoming') {
            lineClassTop = 'bg-primary dark:bg-primary-light';
          }


          return (
            <div
              key={station.name}
              className="relative flex items-start"
              style={{ height: `${STATION_ROW_HEIGHT}px` }}
            >
              {/* Timeline vertical lines and marker */}
              <div className="flex flex-col items-center h-full mr-3" style={{ width: `${MARKER_AREA_WIDTH}px`}}>
                {/* Top line segment */}
                {!isFirst && (
                  <div className={`w-1 flex-grow ${lineClassTop}`} style={{ minHeight: '10px'}}></div>
                )}
                 {isFirst && ( /* Spacer for first item to align markers */
                  <div className="flex-grow" style={{ minHeight: `${STATION_ROW_HEIGHT/2 -8}px`}}></div>
                )}

                {/* Marker */}
                <div className={`w-4 h-4 rounded-full shrink-0 ${markerClass} border-2 border-white dark:border-gray-800 z-10 flex items-center justify-center`}>
                  {station.state === 'passed' && <CheckmarkIcon />}
                </div>

                {/* Bottom line segment */}
                {!isLast && (
                  <div className={`w-1 flex-grow ${lineClassBottom}`} style={{ minHeight: '10px'}}></div>
                )}
                 {isLast && ( /* Spacer for last item */
                  <div className="flex-grow" style={{ minHeight: `${STATION_ROW_HEIGHT/2 -8}px`}}></div>
                )}
              </div>

              {/* Station Name and details */}
              <div className={`pt-1 sm:pt-0 flex flex-col justify-center h-full`} style={{ transform: `translateY(${STATION_ROW_HEIGHT/2 -12}px)`}} > {/* Adjust Y for vertical centering with marker */}
                <p className={`text-sm font-medium ${textClass}`}>
                  {getShortName(station.name)}
                </p>
                {/* Add more details if needed, like ETA to this station */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LinearTrackDisplay;
