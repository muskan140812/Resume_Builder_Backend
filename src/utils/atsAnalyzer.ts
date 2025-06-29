// import pdfParse from 'pdf-parse';
// import { IATSAnalysis } from '../types';

// const REQUIRED_KEYWORDS = ['experience', 'education', 'skills', 'projects', 'certifications'];

// export async function analyzeATS(buffer: Buffer): Promise<IATSAnalysis> {
//   const pdfData = await pdfParse(buffer);
//   const text = pdfData.text.toLowerCase();

//   // Keyword Matching
//   const matched = REQUIRED_KEYWORDS.filter(keyword => text.includes(keyword));
//   const missing = REQUIRED_KEYWORDS.filter(keyword => !text.includes(keyword));
//   const keywordScore = Math.round((matched.length / REQUIRED_KEYWORDS.length) * 100);

//   // Formatting Dummy Score
//   const formattingScore = 80;
//   const formattingIssues = [];
//   const formattingRecommendations = [];

//   // Completeness Dummy Score
//   const missingSections = missing; // just reuse keywords here
//   const completenessScore = 100 - missing.length * 10;

//   const score = Math.round((keywordScore + formattingScore + completenessScore) / 3);

//   const analysis: IATSAnalysis = {
//     score,
//     feedback: {
//       overall: score > 75 ? "Strong Resume" : "Needs Improvement",
//       strengths: matched,
//       weaknesses: missing,
//       recommendations: ["Add more relevant keywords", "Improve section clarity", "Optimize formatting for ATS"],
//     },
//     keywords: {
//       matched,
//       missing,
//       score: keywordScore,
//       suggestions: missing.map(k => `Consider adding "${k}" section or keyword.`),
//     },
//     formatting: {
//       score: formattingScore,
//       issues: formattingIssues,
//       recommendations: formattingRecommendations,
//     },
//     completeness: {
//       score: completenessScore,
//       missingSection: missingSections,
//       recommendations: missingSections.map(sec => `Add a section for "${sec}".`),
//     },
//     suggestions: ["Use clear section headings", "Avoid images and tables", "Keep fonts readable"],
//     analyzedAt: new Date(),
//   };

//   return analysis;
// }

// export function analyzeResumeText(text: string) {
 

export function analyzeResumeText(text: string) {
  const keywords = ['javascript', 'react', 'node.js', 'teamwork', 'communication'];
  const lowerText = text.toLowerCase();

  const matchedKeywords = keywords.filter(k => lowerText.includes(k));
  const missingKeywords = keywords.filter(k => !lowerText.includes(k));
  const score = Math.min(100, matchedKeywords.length * 20); // 5 keywords * 20 = 100

  return {
    score,
    matchedKeywords,
    missingKeywords,
  };
}