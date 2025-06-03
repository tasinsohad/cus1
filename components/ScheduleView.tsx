import React from 'react';

interface ScheduleTime {
  time: string;
  note?: string;
}

const regularDaysTownToCU: ScheduleTime[] = [
  { time: "7:15 am" },
  { time: "7:40 am" },
  { time: "9:30 am", note: "Sholoshohor" },
  { time: "10:15 am", note: "Sholoshohor" },
  { time: "11:30 am", note: "Sholoshohor" },
  { time: "2:30 pm" },
  { time: "3:30 pm" },
  { time: "5:00 pm" },
  { time: "8:30 pm" },
];

const regularDaysCUToTown: ScheduleTime[] = [
  { time: "8:40 am", note: "Sholoshohor" },
  { time: "9:05 am", note: "Sholoshohor" },
  { time: "10:30 am", note: "Sholoshohor" },
  { time: "1:00 pm" },
  { time: "2:00 pm", note: "Interpreted from 2:00 am" }, // Original image says 2:00 am, assumed PM
  { time: "3:35 pm" },
  { time: "4:40 pm" },
  { time: "6:20 pm" },
  { time: "9:45 pm" },
];

const weekendTownToCU: ScheduleTime[] = [
  { time: "7:40 am" },
  { time: "3:30 pm" },
  { time: "8:30 pm" },
];

const weekendCUToTown: ScheduleTime[] = [
  { time: "9:05 am", note: "Sholoshohor" },
  { time: "4:40 pm" },
  { time: "9:45 pm" },
];

const ScheduleCard: React.FC<{ title: string; scheduleTimes: ScheduleTime[] }> = ({ title, scheduleTimes }) => (
  <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
    <h4 className="text-lg sm:text-xl font-semibold text-primary-dark dark:text-primary-light mb-4 text-center">
      {title}
    </h4>
    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
      {scheduleTimes.map((item, index) => (
        <li key={index} className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0">
          <span className="text-sm sm:text-base">{item.time}</span>
          {item.note && (
            <span className={`text-xs sm:text-sm ${item.note === "Interpreted from 2:00 am" ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"} italic`}>
              ({item.note})
            </span>
          )}
        </li>
      ))}
      {scheduleTimes.length === 0 && (
        <li className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No schedule available.</li>
      )}
    </ul>
  </div>
);

const ScheduleView: React.FC = () => {
  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-semibold text-primary dark:text-primary-light mb-6 sm:mb-8 text-center">
        CU Shuttle Train Schedule
      </h2>

      <section className="mb-8 sm:mb-10">
        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-gray-200 mb-4 sm:mb-5 pb-2 border-b border-gray-300 dark:border-gray-600">
          Regular Days (Sunday - Thursday)
        </h3>
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <ScheduleCard title="Town to CU" scheduleTimes={regularDaysTownToCU} />
          <ScheduleCard title="CU to Town" scheduleTimes={regularDaysCUToTown} />
        </div>
      </section>

      <section>
        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-gray-200 mb-4 sm:mb-5 pb-2 border-b border-gray-300 dark:border-gray-600">
          Friday & Saturday
        </h3>
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <ScheduleCard title="Town to CU" scheduleTimes={weekendTownToCU} />
          <ScheduleCard title="CU to Town" scheduleTimes={weekendCUToTown} />
        </div>
      </section>

      <div className="mt-8 sm:mt-10 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <p>
          Note: "(Sholoshohor)" likely indicates departures/arrivals specific to Sholoshohor station or routes primarily serving it.
        </p>
      </div>
    </div>
  );
};

export default ScheduleView;