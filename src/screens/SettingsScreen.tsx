import React, { useCallback, useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Text,
    Alert,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { storage } from '../storage/storage';
import { Question } from '../types';
import { subscriptionService, SubscriptionStatus } from '../services/subscriptionService';

export const SettingsScreen: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState('');
    const [newQuestionType, setNewQuestionType] = useState<'yes-no' | 'number'>(
        'yes-no'
    );
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadQuestions();
            loadSubscriptionStatus();
        }, [])
    );

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const qs = await storage.getQuestions();
            setQuestions(qs);
        } catch (error) {
            console.error('Error loading questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSubscriptionStatus = async () => {
        try {
            const status = await subscriptionService.getSubscriptionStatus();
            setSubscriptionStatus(status);
        } catch (error) {
            console.error('Error loading subscription status:', error);
        }
    };

    const handleAddQuestion = async () => {
        if (!newQuestion.trim()) {
            Alert.alert('Error', 'Please enter a question');
            return;
        }

        try {
            const question: Question = {
                id: Date.now().toString(),
                text: newQuestion,
                type: newQuestionType,
                category: 'Custom',
                paused: false,
            };
            await storage.addQuestion(question);
            setNewQuestion('');
            await loadQuestions();
            Alert.alert('Success', 'Question added!');
        } catch (error) {
            Alert.alert('Error', 'Failed to add question');
        }
    };

    const handleDeleteQuestion = (questionId: string) => {
        Alert.alert(
            'Delete Question',
            'Are you sure you want to delete this question?',
            [
                { text: 'Cancel', onPress: () => { } },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            await storage.deleteQuestion(questionId);
                            await loadQuestions();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete question');
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Settings</Text>

                {/* Subscription Status Section */}
                <View style={styles.subscriptionSection}>
                    <Text style={styles.sectionTitle}>Subscription Status</Text>
                    {subscriptionStatus && (
                        <View style={styles.subscriptionCard}>
                            {subscriptionStatus.isSubscribed ? (
                                <>
                                    <Text style={styles.subscriptionStatus}>
                                        ✅ Active Subscription
                                    </Text>
                                    {subscriptionStatus.isLifetime && (
                                        <Text style={styles.subscriptionDetail}>
                                            Lifetime Access
                                        </Text>
                                    )}
                                    {subscriptionStatus.isMonthly && (
                                        <Text style={styles.subscriptionDetail}>
                                            Monthly Subscription
                                            {subscriptionStatus.expirationDate &&
                                                ` • Renews ${new Date(subscriptionStatus.expirationDate).toLocaleDateString()}`}
                                        </Text>
                                    )}
                                </>
                            ) : subscriptionStatus.isInTrial ? (
                                <>
                                    <Text style={styles.subscriptionStatus}>
                                        🎉 Free Trial Active
                                    </Text>
                                    <Text style={styles.subscriptionDetail}>
                                        {subscriptionStatus.trialDaysRemaining} days remaining
                                    </Text>
                                </>
                            ) : (
                                <Text style={styles.subscriptionStatus}>
                                    ⚠️ Trial Expired
                                </Text>
                            )}
                        </View>
                    )}
                </View>

                <Text style={styles.sectionTitle}>Add Custom Question</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your question..."
                    value={newQuestion}
                    onChangeText={setNewQuestion}
                />
                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            newQuestionType === 'yes-no' && styles.typeButtonActive,
                        ]}
                        onPress={() => setNewQuestionType('yes-no')}
                    >
                        <Text
                            style={[
                                styles.typeButtonText,
                                newQuestionType === 'yes-no' &&
                                styles.typeButtonTextActive,
                            ]}
                        >
                            Yes/No
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            newQuestionType === 'number' && styles.typeButtonActive,
                        ]}
                        onPress={() => setNewQuestionType('number')}
                    >
                        <Text
                            style={[
                                styles.typeButtonText,
                                newQuestionType === 'number' &&
                                styles.typeButtonTextActive,
                            ]}
                        >
                            Number
                        </Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddQuestion}
                >
                    <Text style={styles.addButtonText}>Add Question</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Your Questions</Text>
                {questions.map((question) => (
                    <View key={question.id} style={styles.questionItem}>
                        <View style={styles.questionInfo}>
                            <Text style={styles.questionText}>{question.text}</Text>
                            <Text style={styles.questionType}>
                                Type: {question.type} {question.category && `• ${question.category}`}
                            </Text>
                            {question.paused && (
                                <Text style={styles.pausedBadge}>Paused</Text>
                            )}
                        </View>
                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                onPress={() => storage.setQuestionPaused(question.id, !question.paused).then(loadQuestions)}
                                style={[styles.pauseButton, question.paused && styles.resumeButton]}
                            >
                                <Text style={[styles.pauseButtonText, question.paused && styles.resumeButtonText]}>
                                    {question.paused ? 'Resume' : 'Pause'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleDeleteQuestion(question.id)}
                                style={styles.deleteButton}
                            >
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        marginTop: 16,
    },
    subscriptionSection: {
        marginBottom: 16,
    },
    subscriptionCard: {
        backgroundColor: '#f0f8ff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    subscriptionStatus: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    subscriptionDetail: {
        fontSize: 14,
        color: '#666',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#f5f5f5',
        marginBottom: 12,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f5f5f5',
    },
    typeButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    typeButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    typeButtonTextActive: {
        color: '#fff',
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 24,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    questionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    questionInfo: {
        flex: 1,
    },
    questionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    questionType: {
        fontSize: 12,
        color: '#999',
    },
    pausedBadge: {
        marginTop: 4,
        fontSize: 12,
        color: '#FF7FC0',
        fontWeight: '700',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        marginLeft: 8,
    },
    pauseButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#FF7FC0',
        borderRadius: 6,
    },
    pauseButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    resumeButton: {
        backgroundColor: '#20B2AA',
    },
    resumeButtonText: {
        color: '#fff',
    },
    deleteButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#ff3b30',
        borderRadius: 6,
        marginLeft: 8,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});
