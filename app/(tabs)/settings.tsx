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
import { storage } from '@/src/storage/storage';
import { Question } from '@/src/types';
import { initializeNotifications, scheduleNotification } from '@/src/utils/notificationScheduler';

export default function SettingsScreen() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState('');
    const [newTopic, setNewTopic] = useState('');
    const [newQuestionType, setNewQuestionType] = useState<'yes-no' | 'number'>(
        'yes-no'
    );
    const [notificationTime, setNotificationTime] = useState<string>('20:00');

    useFocusEffect(
        useCallback(() => {
            loadQuestions();
            loadNotificationTime();
        }, [])
    );

    const loadNotificationTime = async () => {
        try {
            const time = await storage.getNotificationTime();
            if (time) {
                setNotificationTime(time);
            }
        } catch (error) {
            console.error('Error loading notification time:', error);
        }
    };

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
                topic: newTopic.trim() || undefined,
                paused: false,
            };
            await storage.addQuestion(question);
            setNewQuestion('');
            setNewTopic('');
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

    const handleSaveNotificationTime = async () => {
        try {
            await storage.setNotificationTime(notificationTime);
            await scheduleNotification(notificationTime);
            Alert.alert('Success', `Notification set for ${notificationTime}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to save notification time');
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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Notification Settings</Text>
                <Text style={styles.label}>Daily check-in reminder time</Text>
                <View style={styles.timeInputContainer}>
                    <TextInput
                        style={styles.timeInput}
                        placeholder="HH:MM"
                        value={notificationTime}
                        onChangeText={setNotificationTime}
                        maxLength={5}
                    />
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleSaveNotificationTime}
                >
                    <Text style={styles.addButtonText}>Set Reminder</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Add Custom Question</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Topic (e.g., Sleep, Exercise)"
                    value={newTopic}
                    onChangeText={setNewTopic}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter your question..."
                    value={newQuestion}
                    onChangeText={setNewQuestion}
                    multiline
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
                            {question.topic && (
                                <View style={styles.topicBadge}>
                                    <Text style={styles.topicBadgeText}>{question.topic}</Text>
                                </View>
                            )}
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
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4FF',
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 16,
        marginTop: 8,
    },
    input: {
        borderWidth: 2,
        borderColor: '#20B2AA',
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        marginBottom: 12,
        color: '#1A1A1A',
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        backgroundColor: '#F7FAFC',
    },
    typeButtonActive: {
        backgroundColor: '#FF7FC0',
        borderColor: '#FF7FC0',
    },
    typeButtonText: {
        color: '#4A5568',
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
    },
    typeButtonTextActive: {
        color: '#fff',
    },
    addButton: {
        backgroundColor: '#20B2AA',
        paddingVertical: 14,
        borderRadius: 10,
        marginBottom: 24,
        shadowColor: '#20B2AA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
    },
    label: {
        fontSize: 13,
        color: '#4A5568',
        marginBottom: 8,
        fontWeight: '600',
    },
    timeInputContainer: {
        marginBottom: 12,
    },
    timeInput: {
        borderWidth: 2,
        borderColor: '#20B2AA',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 18,
        backgroundColor: '#FFFFFF',
        color: '#1A1A1A',
        fontWeight: '600',
        textAlign: 'center',
    },
    questionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    questionInfo: {
        flex: 1,
    },
    topicBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#FF7FC0',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
        marginBottom: 6,
    },
    topicBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    questionText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1A1A1A',
        marginBottom: 6,
        lineHeight: 21,
    },
    questionType: {
        fontSize: 12,
        color: '#718096',
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
        paddingVertical: 8,
        paddingHorizontal: 14,
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
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: '#FF7FC0',
        borderRadius: 6,
        marginLeft: 8,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});
