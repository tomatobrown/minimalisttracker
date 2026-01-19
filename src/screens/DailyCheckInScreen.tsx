import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { QuestionForm } from '../components/QuestionForm';
import { storage } from '../storage/storage';
import { Question, DailyResponse } from '../types';

export const DailyCheckInScreen: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [todayResponses, setTodayResponses] = useState<
        Map<string, DailyResponse>
    >(new Map());

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        setLoading(true);
        try {
            const qs = await storage.getQuestions();
            // Only ask non-paused questions
            setQuestions(qs.filter((q) => !q.paused));

            const today = new Date().toISOString().split('T')[0];
            const todayData = await storage.getDailyResponses(today);
            const responseMap = new Map(
                todayData.map((r) => [r.questionId, r])
            );
            setTodayResponses(responseMap);
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Error', 'Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (responses: DailyResponse[]) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            for (const response of responses) {
                await storage.saveDailyResponse(today, response);
            }
            Alert.alert('Success', 'Your responses have been saved!');
            await loadData();
        } catch (error) {
            console.error('Error saving responses:', error);
            Alert.alert('Error', 'Failed to save responses');
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <QuestionForm
                questions={questions}
                onSubmit={handleSubmit}
                initialResponses={todayResponses}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
