// File: web/src/actions/index.ts
import { connectToDatabase } from '@/db';
import { ObjectId } from 'mongodb';
import { B5Error, DbResult, Feedback } from '@/types';
import calculateScore from '@bigfive-org/score';
import generateResult, { getInfo, Language, Domain } from '@bigfive-org/results';

const collectionName = process.env.DB_COLLECTION || 'results';
const resultLanguages = getInfo().languages;

export type Report = {
  id: string;
  timestamp: number;
  availableLanguages: Language[];
  language: string;
  results: Domain[];
};

export async function getTestResult(id: string, language?: string): Promise<Report | undefined> {
  console.log(`getTestResult called with id: ${id} and language: ${language}`);
  try {
    const query = { _id: new ObjectId(id) };
    const db = await connectToDatabase();
    const collection = db.collection(collectionName);
    const report = await collection.findOne(query);
    console.log('Report from DB:', report);
    if (!report) {
      console.error(`The test results with id ${id} is not found in the database!`);
      throw new B5Error({ name: 'NotFoundError', message: `The test results with id ${id} is not found in the database!` });
    }
    const selectedLanguage = language || (!!resultLanguages.find((l) => l.code === report.lang) ? report.lang : 'en');
    const scores = calculateScore({ answers: report.answers });
    const results = generateResult({ lang: selectedLanguage, scores });
    console.log('Generated results:', results);
    return {
      id: report._id.toString(),
      timestamp: report.dateStamp,
      availableLanguages: resultLanguages,
      language: selectedLanguage,
      results,
    };
  } catch (error) {
    console.error('Error in getTestResult:', error);
    if (error instanceof B5Error) {
      throw error;
    }
    throw new Error('Something wrong happened. Failed to get test result!');
  }
}