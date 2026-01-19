import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question, DailyResponse, DailyEntry, MonthlyChallenge } from '../types';

const QUESTIONS_KEY = '@eod_questions';
const RESPONSES_KEY = '@eod_responses_';
const CHALLENGES_KEY = '@eod_challenges';
const NOTIFICATION_TIME_KEY = '@eod_notification_time';

export const storage = {
    // Questions Management
    async getQuestions(): Promise<Question[]> {
        try {
            const data = await AsyncStorage.getItem(QUESTIONS_KEY);
            return data ? JSON.parse(data) : getDefaultQuestions();
        } catch (error) {
            console.error('Error reading questions:', error);
            return getDefaultQuestions();
        }
    },

    async saveQuestions(questions: Question[]): Promise<void> {
        try {
            await AsyncStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
        } catch (error) {
            console.error('Error saving questions:', error);
        }
    },

    async addQuestion(question: Question): Promise<void> {
        const questions = await this.getQuestions();
        questions.push(question);
        await this.saveQuestions(questions);
    },

    async deleteQuestion(questionId: string): Promise<void> {
        const questions = await this.getQuestions();
        const filtered = questions.filter((q) => q.id !== questionId);
        await this.saveQuestions(filtered);
    },

    async setQuestionPaused(questionId: string, paused: boolean): Promise<void> {
        const questions = await this.getQuestions();
        const updated = questions.map((q) =>
            q.id === questionId ? { ...q, paused } : q
        );
        await this.saveQuestions(updated);
    },

    // Daily Responses
    async getDailyResponses(date: string): Promise<DailyResponse[]> {
        try {
            const key = `${RESPONSES_KEY}${date}`;
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading daily responses:', error);
            return [];
        }
    },

    async saveDailyResponse(
        date: string,
        response: DailyResponse
    ): Promise<void> {
        try {
            const key = `${RESPONSES_KEY}${date}`;
            const responses = await this.getDailyResponses(date);
            const index = responses.findIndex(
                (r) => r.questionId === response.questionId
            );
            if (index >= 0) {
                responses[index] = response;
            } else {
                responses.push(response);
            }
            await AsyncStorage.setItem(key, JSON.stringify(responses));
        } catch (error) {
            console.error('Error saving daily response:', error);
        }
    },

    async getAllResponses(): Promise<Map<string, DailyResponse[]>> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const responseKeys = keys.filter((key) =>
                key.startsWith(RESPONSES_KEY)
            );

            const map = new Map<string, DailyResponse[]>();
            for (const key of responseKeys) {
                const date = key.replace(RESPONSES_KEY, '');
                const data = await AsyncStorage.getItem(key);
                if (data) {
                    map.set(date, JSON.parse(data));
                }
            }
            return map;
        } catch (error) {
            console.error('Error reading all responses:', error);
            return new Map();
        }
    },

    // Monthly Challenges
    async getChallenges(): Promise<MonthlyChallenge[]> {
        try {
            const data = await AsyncStorage.getItem(CHALLENGES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading challenges:', error);
            return [];
        }
    },

    async saveChallenges(challenges: MonthlyChallenge[]): Promise<void> {
        try {
            await AsyncStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
        } catch (error) {
            console.error('Error saving challenges:', error);
        }
    },

    async addChallenge(challenge: MonthlyChallenge): Promise<void> {
        const challenges = await this.getChallenges();
        challenges.push(challenge);
        await this.saveChallenges(challenges);
    },

    async updateChallenge(challenge: MonthlyChallenge): Promise<void> {
        const challenges = await this.getChallenges();
        const updated = challenges.map((c) => (c.id === challenge.id ? challenge : c));
        await this.saveChallenges(updated);
    },

    async deleteChallenge(challengeId: string): Promise<void> {
        const challenges = await this.getChallenges();
        const updated = challenges.filter((c) => c.id !== challengeId);
        await this.saveChallenges(updated);
    },

    // Notification Settings
    async getNotificationTime(): Promise<string | null> {
        try {
            const time = await AsyncStorage.getItem(NOTIFICATION_TIME_KEY);
            return time;
        } catch (error) {
            console.error('Error reading notification time:', error);
            return null;
        }
    },

    async setNotificationTime(time: string): Promise<void> {
        try {
            await AsyncStorage.setItem(NOTIFICATION_TIME_KEY, time);
        } catch (error) {
            console.error('Error saving notification time:', error);
        }
    },
};

function getDefaultQuestions(): Question[] {
    return [
        {
            id: '1',
            text: 'Did you drink alcohol today?',
            type: 'yes-no',
            category: 'Health',
            topic: 'Alcohol',
            paused: false,
        },
        {
            id: '2',
            text: 'How many hours did you sleep?',
            type: 'number',
            category: 'Sleep',
            topic: 'Sleep',
            paused: false,
        },
        {
            id: '3',
            text: 'Did you exercise today?',
            type: 'yes-no',
            category: 'Exercise',
            topic: 'Exercise',
            paused: false,
        },
        {
            id: '4',
            text: 'How many cups of water did you drink?',
            type: 'number',
            category: 'Health',
            topic: 'Hydration',
            paused: true,
        },
        {
            id: '5',
            text: 'Did you meditate today?',
            type: 'yes-no',
            category: 'Wellness',
            topic: 'Meditation',
            paused: true,
        },
        {
            id: '6',
            text: 'How many minutes of screen time did you have?',
            type: 'number',
            category: 'Wellness',
            topic: 'Screen Time',
            paused: true,
        },
        {
            id: '7',
            text: 'Did you take your vitamins today?',
            type: 'yes-no',
            category: 'Health',
            topic: 'Vitamins',
            paused: true,
        },
        {
            id: '8',
            text: 'How many minutes did you spend outdoors?',
            type: 'number',
            category: 'Wellness',
            topic: 'Outdoors',
            paused: true,
        },
    ];
}
