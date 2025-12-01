"use client";
import { Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import StudentAchievementsPortal from './StudentAchievementsPortal';

function AchievementsPageContent() {
  const searchParams = useSearchParams();
  const regNo = searchParams.get('regNo');
  return <StudentAchievementsPortal studentRegNo={regNo} />;
}

export default function AchievementsPage() {
  return (
    <Suspense fallback={<div>Loading achievements...</div>}>
      <AchievementsPageContent />
    </Suspense>
  );
}
