import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
} from 'react-native';
import { Question, DailyResponse } from '../types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

interface QuestionFormProps {
    questions: Question[];
    onSubmit: (responses: DailyResponse[]) => void;
    initialResponses?: Map<string, DailyResponse>;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
    questions,
    onSubmit,
    initialResponses,
}) => {
    const [responses, setResponses] = useState<Map<string, boolean | number | string>>(
        () => {
            const map = new Map();
            if (initialResponses) {
                initialResponses.forEach((response) => {
                    map.set(response.questionId, response.response);
                });
            }
            return map;
        }
    );

    const handleYesNo = (questionId: string, value: boolean) => {
        setResponses((prev) => new Map(prev).set(questionId, value));
    };

    const handleNumber = (questionId: string, value: string) => {
        if (value === '') {
            // Remove the response if empty
            setResponses((prev) => {
                const newMap = new Map(prev);
                newMap.delete(questionId);
                return newMap;
            });
        } else {
            const num = parseInt(value, 10);
            if (!isNaN(num)) {
                setResponses((prev) => new Map(prev).set(questionId, num));
            }
        }
    };

    const handleText = (questionId: string, value: string) => {
        setResponses((prev) => new Map(prev).set(questionId, value));
    };

    const handleSubmit = () => {
        const today = new Date().toISOString().split('T')[0];
        const dailyResponses: DailyResponse[] = Array.from(responses.entries()).map(
            ([questionId, response]) => ({
                questionId,
                date: today,
                response,
                timestamp: Date.now(),
            })
        );
        onSubmit(dailyResponses);
    };

    const isComplete = responses.size === questions.length;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <IconSymbol
                    name="checkmark.circle.fill"
                    size={32}
                    color="#20B2AA"
                    style={styles.headerIcon}
                />
                <View style={styles.headerTextGroup}>
                    <Text style={styles.headerTitle}>End of Day</Text>
                    <Text style={styles.headerSubtitle}>Check-In</Text>
                </View>
            </View>
            <Text style={styles.headerDescription}>Take a moment to reflect.</Text>
            {questions.map((question) => (
                <View key={question.id} style={styles.questionContainer}>
                    {question.topic && (
                        <View style={styles.topicBadge}>
                            <Text style={styles.topicText}>{question.topic}</Text>
                        </View>
                    )}
                    <Text style={styles.questionText}>{question.text}</Text>
                    {question.type === 'yes-no' && (
                        <View style={styles.buttonGroup}>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    responses.get(question.id) === true && styles.buttonActive,
                                ]}
                                onPress={() => handleYesNo(question.id, true)}
                            >
                                <Text
                                    style={[
                                        styles.buttonText,
                                        responses.get(question.id) === true &&
                                        styles.buttonTextActive,
                                    ]}
                                >
                                    Yes
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    responses.get(question.id) === false && styles.buttonActive,
                                ]}
                                onPress={() => handleYesNo(question.id, false)}
                            >
                                <Text
                                    style={[
                                        styles.buttonText,
                                        responses.get(question.id) === false &&
                                        styles.buttonTextActive,
                                    ]}
                                >
                                    No
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {question.type === 'number' && (
                        <TextInput
                            style={styles.input}
                            placeholder="Enter number"
                            keyboardType="number-pad"
                            value={responses.has(question.id) ? String(responses.get(question.id)) : ''}
                            onChangeText={(value) => handleNumber(question.id, value)}
                        />
                    )}
                    {question.type === 'text' && (
                        <TextInput
                            style={styles.input}
                            placeholder="Enter text"
                            value={String(responses.get(question.id) || '')}
                            onChangeText={(value) => handleText(question.id, value)}
                        />
                    )}
                </View>
            ))}
            <TouchableOpacity
                style={[styles.submitButton, !isComplete && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!isComplete}
            >
                <Text style={styles.submitButtonText}>Save Responses</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F0F4FF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 6,
    },
    headerIcon: {
        marginRight: 2,
    },
    headerTextGroup: {
        flexDirection: 'column',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1A1A1A',
        fontFamily: Fonts.rounded,
        lineHeight: 30,
    },
    headerSubtitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#20B2AA',
        marginTop: 2,
        fontFamily: Fonts.rounded,
    },
    headerDescription: {
        fontSize: 14,
        color: '#4A5568',
        marginBottom: 20,
    },
    questionContainer: {
        marginBottom: 20,
        paddingBottom: 20,
        paddingTop: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    topicBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#20B2AA',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    topicText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    questionText: {
        fontSize: 17,
        fontWeight: '500',
        marginBottom: 12,
        color: '#1A1A1A',
        lineHeight: 24,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        backgroundColor: '#F7FAFC',
    },
    buttonActive: {
        backgroundColor: '#FF7FC0',
        borderColor: '#FF7FC0',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        color: '#4A5568',
    },
    buttonTextActive: {
        color: '#fff',
    },
    input: {
        borderWidth: 2,
        borderColor: '#20B2AA',
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#F7FAFC',
        color: '#1A1A1A',
    },
    submitButton: {
        backgroundColor: '#20B2AA',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginBottom: 32,
        marginTop: 8,
        shadowColor: '#20B2AA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: '#CBD5E0',
        shadowOpacity: 0,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
    },
});
