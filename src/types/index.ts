export interface Question {
    id: string;
    text: string;
    type: 'yes-no' | 'number' | 'text';
    category?: string;
    topic?: string;
    paused?: boolean; // when true, question is kept but not asked
}

export interface DailyResponse {
    questionId: string;
    date: string; // YYYY-MM-DD
    response: boolean | number | string;
    timestamp: number;
}

export interface DailyEntry {
    date: string;
    responses: DailyResponse[];
}

export type ChallengeGoalType = 'yesCount' | 'sum' | 'countEntries';

export interface MonthlyChallenge {
    id: string;
    title: string;
    questionId: string;
    goalType: ChallengeGoalType;
    goalValue: number;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    active: boolean;
}
