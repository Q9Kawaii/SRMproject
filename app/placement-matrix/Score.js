import React from 'react';

const SCORE_CONFIG = {
  tenthPercentagePoints: (val) => {
    const n = parseFloat(val);
    let score = 0.5;
    if (!val || isNaN(n)) {
      console.log('percent10 input:', val, 'score:', score);
      return score;
    }
    if (n >= 96) score = 2.5;
    else if (n >= 91) score = 2;
    else if (n >= 86) score = 1.5;
    else if (n >= 75) score = 1;
    console.log('percent10 input:', val, 'score:', score);
    return score;
  },

  twelfthPercentagePoints: (val) => {
    const n = parseFloat(val);
    let score = 0.5;
    if (!val || isNaN(n)) {
      console.log('percent12 input:', val, 'score:', score);
      return score;
    }
    if (n >= 96) score = 2.5;
    else if (n >= 91) score = 2;
    else if (n >= 86) score = 1.5;
    else if (n >= 75) score = 1;
    console.log('percent12 input:', val, 'score:', score);
    return score;
  },

  cgpaUptoSixthSem: (val) => {
    const n = parseFloat(val);
    let score = 1;
    if (!val || isNaN(n)) {
      console.log('cgpa input:', val, 'score:', score);
      return score;
    }
    if (n > 9.5) score = 5;
    else if (n >= 9.1) score = 4;
    else if (n >= 8.6) score = 3;
    else if (n >= 7.5) score = 2;
    console.log('cgpa input:', val, 'score:', score);
    return score;
  },

  githubContributionsPoints: (val) => {
    const n = parseInt(val);
    let score = 0;
    if (!val || isNaN(n)) {
      console.log('githubContri input:', val, 'score:', score);
      return score;
    }
    if (n > 20) score = 5;
    else if (n >= 16) score = 4;
    else if (n >= 11) score = 3;
    else if (n >= 6) score = 2;
    else if (n >= 1) score = 1;
    console.log('githubContri input:', val, 'score:', score);
    return score;
  },

  githubFrequencyPoints: (val) => {
    const n = parseFloat(val);
    let score = 0;
    if (!val || isNaN(n)) {
      console.log('githubContriFreq input:', val, 'score:', score);
      return score;
    }
    if (n >= 2) score = 2;
    else if (n >= 1) score = 1;
    console.log('githubContriFreq input:', val, 'score:', score);
    return score;
  },

  communityProjectsPoints: (val) => {
    const n = parseInt(val);
    const score = isNaN(n) ? 0 : Math.min(n * 2, 3);
    console.log('ProjectsDoneForComunity input:', val, 'score:', score);
    return score;
  },

  collaborationsPoints: (val) => {
    const n = parseInt(val);
    const score = isNaN(n) ? 0 : Math.min(n * 2, 5);
    console.log('githubCollaborations input:', val, 'score:', score);
    return score;
  },

 
  codingPracticeQuestionsPoints: (val) => {
    const n = parseInt(val);
    let score = 0;
    if (!val || isNaN(n)) {
      console.log('MediumDifficultQuestions input:', val, 'score:', score);
      return score;
    }
    if (n > 200) score = 5;
    else if (n >= 150) score = 4;
    else if (n >= 100) score = 3;
    else if (n >= 50) score = 2;
    else if (n >= 25) score = 1;
    console.log('MediumDifficultQuestions input:', val, 'score:', score);
    return score;
  },

  trainingDetails: (val) => {
    let score = 0;
    if (!val) {
      console.log('trainingDetails input:', val, 'score:', score);
      return score;
    }
    const str = val.toLowerCase();
    if (str.includes("google") || str.includes("microsoft")) score = 5;
    else if (str.includes("startup")) score = 3;
    else score = 1;
    console.log('trainingDetails input:', val, 'score:', score);
    return score;
  },

  fsdProjectPoints: (val) => {
    const n = parseInt(val);
    const score = isNaN(n) ? 0 : (n > 0 ? 5 : 0);
    console.log('fsdProjects input:', val, 'score:', score);
    return score;
  },

  codingCompetitionFirstPoints: (val) => {
    const n = parseInt(val);
    const score = isNaN(n) ? 0 : Math.min(n, 4) * 5;
    console.log('firstprize input:', val, 'score:', score);
    return score;
  },

  codingCompetitionSecondPoints: (val) => {
    const n = parseInt(val);
    const score = isNaN(n) ? 0 : Math.min(n, 4) * 4;
    console.log('secondprize input:', val, 'score:', score);
    return score;
  },

  codingCompetitionThirdPoints: (val) => {
    const n = parseInt(val);
    const score = isNaN(n) ? 0 : Math.min(n, 4) * 3;
    console.log('thirdprize input:', val, 'score:', score);
    return score;
  },

  codingCompetitionParticipatedPoints: (val) => {
    const n = parseInt(val);
    const score = isNaN(n) ? 0 : Math.min(n, 4);
    console.log('participated input:', val, 'score:', score);
    return score;
  },

  inhouseEachProjectPoints: (val) => {
    const n = parseInt(val);
    const score = isNaN(n) ? 0 : Math.min(n * 4, 8);
    console.log('inhouseprojects input:', val, 'score:', score);
    return score;
  },

  professionalBodiesMembershipPoints: (val) => {
    const n = parseInt(val);
    const score = isNaN(n) ? 0 : (n > 0 ? 2 : 0);
    console.log('memberships input:', val, 'score:', score);
    return score;
  },

 assessmentMarksPoints: (val) => {
    const n = parseInt(val);
    let score = 0;
    if (!val || isNaN(n)) {
      console.log('assessmentScore input:', val, 'score:', score);
      return score;
    }
    if (n >= 90) score = 10;
    else if (n >= 80) score = 9;
    else if (n >= 70) score = 8;
    else if (n >= 65) score = 7;
    else if (n >= 60) score = 6;
    else if (n >= 55) score = 5;
    else if (n >= 50) score = 4;
    else if (n >= 40) score = 3;
    else if (n >= 30) score = 2;
    else if (n >= 25) score = 1;
    console.log('assessmentScore input:', val, 'score:', score);
    return score;
  }
};

const ScoreBox = ({ tenthPercentagePoints, twelfthPercentagePoints,cgpaUptoSixthSem,githubContributionsPoints,githubFrequencyPoints,communityProjectsPoints,collaborationsPoints,codingPracticeQuestionsPoints,trainingDetails,fsdProjectPoints,codingCompetitionFirstPoints,codingCompetitionSecondPoints,codingCompetitionThirdPoints,codingCompetitionParticipatedPoints,inhouseEachProjectPoints,professionalBodiesMembershipPoints,assessmentMarksPoints}) => {
  const tenthScore = SCORE_CONFIG.tenthPercentagePoints(tenthPercentagePoints);
  const twelfthScore = SCORE_CONFIG.twelfthPercentagePoints(twelfthPercentagePoints);
  const cgpaScore = SCORE_CONFIG.cgpaUptoSixthSem(cgpaUptoSixthSem);
  const githubContributionsScore = SCORE_CONFIG.githubContributionsPoints(githubContributionsPoints);
  const githubFrequencyScore = SCORE_CONFIG.githubFrequencyPoints(githubFrequencyPoints);
  const communityProjectsScore = SCORE_CONFIG.communityProjectsPoints(communityProjectsPoints);
  const collaborationsScore = SCORE_CONFIG.collaborationsPoints(collaborationsPoints);
  const codingPracticeQuestionsScore = SCORE_CONFIG.codingPracticeQuestionsPoints(codingPracticeQuestionsPoints);
  const trainingDetailsScore = SCORE_CONFIG.trainingDetails(trainingDetails);
  const fsdProjectScore = SCORE_CONFIG.fsdProjectPoints(fsdProjectPoints);
  const codingCompetitionFirstScore = SCORE_CONFIG.codingCompetitionFirstPoints(codingCompetitionFirstPoints);
  const codingCompetitionSecondScore = SCORE_CONFIG.codingCompetitionSecondPoints(codingCompetitionSecondPoints);
  const codingCompetitionThirdScore = SCORE_CONFIG.codingCompetitionThirdPoints(codingCompetitionThirdPoints);
  const codingCompetitionParticipatedScore = SCORE_CONFIG.codingCompetitionParticipatedPoints(codingCompetitionParticipatedPoints);
  const inhouseEachProjectScore = SCORE_CONFIG.inhouseEachProjectPoints(inhouseEachProjectPoints);
  const professionalBodiesMembershipScore = SCORE_CONFIG.professionalBodiesMembershipPoints(professionalBodiesMembershipPoints);
  const assessmentMarksScore = SCORE_CONFIG.assessmentMarksPoints(assessmentMarksPoints);


  const totalScore = tenthScore + twelfthScore + cgpaScore + githubContributionsScore + githubFrequencyScore + communityProjectsScore + collaborationsScore + codingPracticeQuestionsScore + trainingDetailsScore + fsdProjectScore + codingCompetitionFirstScore + codingCompetitionSecondScore + codingCompetitionThirdScore + codingCompetitionParticipatedScore + inhouseEachProjectScore + professionalBodiesMembershipScore + assessmentMarksScore;
  return (
    <div className="mt-6 p-4 border rounded bg-gray-50 shadow-sm">
      <h2 className="text-lg font-semibold mb-2">Calculated Scores</h2>
      
      <hr className="my-2" />
      <p className="font-medium">Total Score: {totalScore} / 100</p>
    </div>
  );
};

export default ScoreBox;
