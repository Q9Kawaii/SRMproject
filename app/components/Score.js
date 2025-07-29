import React from 'react';

const SCORE_CONFIG = {
  tenthPercentage: (val) => {
    if (!val || val === '0') return 0;
    const n = parseFloat(val);
    if (n >= 96) return 2.5;
    if (n >= 91) return 2;
    if (n >= 86) return 1.5;
    if (n >= 75) return 1;
    return 0.5;
  },
  twelfthPercentage: (val) => {
    if (!val || val === '0') return 0;
    const n = parseFloat(val);
    if (n >= 96) return 2.5;
    if (n >= 91) return 2;
    if (n >= 86) return 1.5;
    if (n >= 75) return 1;
    return 0.5;
  },
};

const ScoreBox = ({ tenthPercentage, twelfthPercentage }) => {
  const tenthScore = SCORE_CONFIG.tenthPercentage(tenthPercentage);
  const twelfthScore = SCORE_CONFIG.twelfthPercentage(twelfthPercentage);
  const totalScore = tenthScore + twelfthScore;

  return (
    <div className="mt-6 p-4 border rounded bg-gray-50 shadow-sm">
      <h2 className="text-lg font-semibold mb-2">Calculated Scores</h2>
      <p>10th Percentage: {tenthPercentage}% → Score: {tenthScore}</p>
      <p>12th Percentage: {twelfthPercentage}% → Score: {twelfthScore}</p>
      <hr className="my-2" />
      <p className="font-medium">Total Score: {totalScore} / 5</p>
    </div>
  );
};

export default ScoreBox;
