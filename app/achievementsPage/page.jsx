'use client'
import { useSearchParams } from 'next/navigation';
import StudentAchievementsPortal from './StudentAchievementsPortal'; // adjust import as needed

export default function AchievementsPage() {
  const searchParams = useSearchParams();
  const regNo = searchParams.get('regNo');

  return (
    <StudentAchievementsPortal studentRegNo={regNo} />
  );
}
