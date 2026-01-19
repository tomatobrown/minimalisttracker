import React, { useCallback, useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Text,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TrendChart } from '../components/TrendChart';
import { storage } from '../storage/storage';
import { Question, DailyResponse } from '../types';

export const TrendsScreen: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [allResponses, setAllResponses] = useState<
        Map<string, DailyResponse[]>
    >(new Map());
    const [loading, setLoading] = useState(true);
    const [days] = useState(30);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        setLoading(true);
        try {
            const qs = await storage.getQuestions();
            // Only include active (not paused) questions in Trends
            setQuestions(qs.filter((q) => !q.paused));

            const allResp = await storage.getAllResponses();
            setAllResponses(allResp);
        } catch (error) {
            console.error('Error loading trends:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRecentResponses = (questionId: string) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffString = cutoffDate.toISOString().split('T')[0];

        const responses: DailyResponse[] = [];
        allResponses.forEach((dayResponses, dateString) => {
            if (dateString >= cutoffString) {
                const filtered = dayResponses.filter(
                    (r) => r.questionId === questionId
                );
                responses.push(...filtered);
            }
        });
        return responses;
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (questions.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No data yet</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Trends & Statistics</Text>
                <Text style={styles.subtitle}>Last {days} days</Text>
                {questions.map((question) => (
                    <TrendChart
                        key={question.id}
                        question={question}
                        responses={getRecentResponses(question.id)}
                        days={days}
                    />
                ))}
            </ScrollView>
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
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#999',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});
