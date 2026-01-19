import React, { useCallback, useMemo, useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { storage } from '@/src/storage/storage';
import { MonthlyChallenge, Question, DailyResponse, ChallengeGoalType } from '@/src/types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

function startOfCurrentMonth(): string {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
}

function endOfCurrentMonth(): string {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d.toISOString().split('T')[0];
}

function computeProgress(
    challenge: MonthlyChallenge,
    allResponses: Map<string, DailyResponse[]>,
    questions: Question[],
): { current: number; goal: number; percent: number; label: string } {
    const { questionId, goalType, goalValue, startDate, endDate } = challenge;
    const isYesNo = questions.find((q) => q.id === questionId)?.type === 'yes-no';

    let current = 0;
    allResponses.forEach((dayResponses, dateString) => {
        if (dateString >= startDate && dateString <= endDate) {
            const filtered = dayResponses.filter((r) => r.questionId === questionId);
            if (goalType === 'yesCount') {
                current += filtered.filter((r) => r.response === true).length;
            } else if (goalType === 'sum') {
                current += filtered
                    .map((r) => (typeof r.response === 'number' ? (r.response as number) : 0))
                    .reduce((a, b) => a + b, 0);
            } else if (goalType === 'countEntries') {
                current += filtered.length;
            }
        }
    });

    const goal = goalValue;
    const percent = Math.min(100, Math.round((current / (goal || 1)) * 100));
    const label = isYesNo && goalType === 'yesCount' ? `${current} yes` : `${current}`;
    return { current, goal, percent, label };
}

export default function ChallengeScreen() {
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [challenges, setChallenges] = useState<MonthlyChallenge[]>([]);
    const [allResponses, setAllResponses] = useState<Map<string, DailyResponse[]>>(new Map());

    // Create form state
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    const [goalType, setGoalType] = useState<ChallengeGoalType>('countEntries');
    const [goalValue, setGoalValue] = useState<string>('10');
    const [title, setTitle] = useState<string>('Monthly Challenge');

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        setLoading(true);
        try {
            const qs = await storage.getQuestions();
            setQuestions(qs.filter((q) => !q.paused));
            const ch = await storage.getChallenges();
            setChallenges(ch.filter((c) => c.active));
            const all = await storage.getAllResponses();
            setAllResponses(all);
        } catch (error) {
            console.error('Error loading challenge data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChallenge = async () => {
        if (!selectedQuestionId) return;
        const challenge: MonthlyChallenge = {
            id: Date.now().toString(),
            title: title.trim() || 'Monthly Challenge',
            questionId: selectedQuestionId,
            goalType,
            goalValue: parseInt(goalValue, 10) || 1,
            startDate: startOfCurrentMonth(),
            endDate: endOfCurrentMonth(),
            active: true,
        };
        await storage.addChallenge(challenge);
        await loadData();
    };

    const deactivateChallenge = async (id: string) => {
        const existing = challenges.find((c) => c.id === id);
        if (!existing) return;
        await storage.updateChallenge({ ...existing, active: false });
        await loadData();
    };

    const goalTypesForQuestion = useMemo(() => {
        const q = questions.find((qq) => qq.id === selectedQuestionId);
        if (!q) return ['countEntries'] as ChallengeGoalType[];
        if (q.type === 'yes-no') return ['yesCount'] as ChallengeGoalType[];
        if (q.type === 'number') return ['sum', 'countEntries'] as ChallengeGoalType[];
        return ['countEntries'] as ChallengeGoalType[];
    }, [questions, selectedQuestionId]);

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
                <View style={styles.header}>
                    <IconSymbol name="flag.fill" size={28} color="#FF7FC0" style={{ marginRight: 6 }} />
                    <View>
                        <Text style={styles.headerTitle}>Monthly Challenge</Text>
                        <Text style={styles.headerSubtitle}>Track progress for this month</Text>
                    </View>
                </View>

                {/* Active challenges */}
                {challenges.length === 0 ? (
                    <Text style={styles.emptyText}>No active challenge yet. Create one below.</Text>
                ) : (
                    challenges.map((c) => {
                        const prog = computeProgress(c, allResponses, questions);
                        const q = questions.find((qq) => qq.id === c.questionId);
                        return (
                            <View key={c.id} style={styles.card}>
                                <Text style={styles.cardTitle}>{c.title}</Text>
                                <Text style={styles.cardSubtitle}>{q?.topic || q?.text}</Text>
                                <View style={styles.progressBarOuter}>
                                    <View style={[styles.progressBarInner, { width: `${prog.percent}%` }]} />
                                </View>
                                <Text style={styles.progressLabel}>
                                    {prog.label} / {prog.goal} ({prog.percent}%)
                                </Text>
                                <View style={styles.actionsRow}>
                                    <TouchableOpacity style={styles.deactivateButton} onPress={() => deactivateChallenge(c.id)}>
                                        <Text style={styles.deactivateButtonText}>End</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}

                {/* Create new challenge */}
                <Text style={styles.sectionTitle}>Create New Challenge</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Challenge title"
                    value={title}
                    onChangeText={setTitle}
                />
                <Text style={styles.label}>Select question</Text>
                <View style={styles.listBox}>
                    {questions.map((q) => (
                        <TouchableOpacity
                            key={q.id}
                            style={[styles.listItem, selectedQuestionId === q.id && styles.listItemActive]}
                            onPress={() => setSelectedQuestionId(q.id)}
                        >
                            <Text style={styles.listItemText}>{q.topic || q.text}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Goal type</Text>
                <View style={styles.buttonGroup}>
                    {goalTypesForQuestion.map((gt) => (
                        <TouchableOpacity
                            key={gt}
                            style={[styles.typeButton, goalType === gt && styles.typeButtonActive]}
                            onPress={() => setGoalType(gt)}
                        >
                            <Text style={[styles.typeButtonText, goalType === gt && styles.typeButtonTextActive]}>
                                {gt === 'yesCount' ? 'Yes count' : gt === 'sum' ? 'Sum' : 'Entry count'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Goal value</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., 20"
                    value={goalValue}
                    onChangeText={setGoalValue}
                    keyboardType="number-pad"
                />

                <TouchableOpacity style={styles.createButton} onPress={handleCreateChallenge} disabled={!selectedQuestionId}>
                    <Text style={styles.createButtonText}>Create Challenge</Text>
                </TouchableOpacity>
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
        backgroundColor: '#F0F4FF',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1A1A',
        fontFamily: Fonts.rounded,
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#718096',
        marginTop: 2,
    },
    emptyText: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#718096',
        marginBottom: 12,
    },
    progressBarOuter: {
        height: 10,
        borderRadius: 10,
        backgroundColor: '#E2E8F0',
        overflow: 'hidden',
    },
    progressBarInner: {
        height: '100%',
        backgroundColor: '#FF7FC0',
    },
    progressLabel: {
        marginTop: 8,
        fontSize: 12,
        color: '#4A5568',
    },
    actionsRow: {
        marginTop: 12,
        flexDirection: 'row',
        gap: 8,
    },
    deactivateButton: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: '#FF7FC0',
        borderRadius: 6,
    },
    deactivateButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginTop: 20,
        marginBottom: 10,
    },
    label: {
        fontSize: 12,
        color: '#4A5568',
        marginBottom: 6,
    },
    input: {
        borderWidth: 2,
        borderColor: '#20B2AA',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        marginBottom: 12,
        color: '#1A1A1A',
    },
    listBox: {
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 12,
    },
    listItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F7FAFC',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    listItemActive: {
        backgroundColor: '#20B2AA33',
    },
    listItemText: {
        fontSize: 14,
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
    createButton: {
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
    createButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
    },
});
