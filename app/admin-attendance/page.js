import { Suspense } from 'react';
import AdminAttendancePage from './AdminAttendancePage';

// Loading component
const AttendancePageLoading = () => (
  <div className="min-h-screen bg-gray-50 p-6 font-sans flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600 text-lg">Loading attendance dashboard...</p>
    </div>
  </div>
);

// Main page component with Suspense wrapper
export default function AdminAttendancePageWrapper() {
  return (
    <Suspense fallback={<AttendancePageLoading />}>
      <AdminAttendancePage />
    </Suspense>
  );
}
