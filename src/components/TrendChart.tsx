import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Question, DailyResponse } from '../types';

interface TrendChartProps {
    question: Question;
    responses: DailyResponse[];
    days: number;
    onPress?: () => void;
}

export const TrendChart: React.FC<TrendChartProps> = ({
    question,
    responses,
    days,
    onPress,
}) => {
    const calculateStats = () => {
        if (responses.length === 0) {
            return null;
        }

        if (question.type === 'yes-no') {
            const yesCount = responses.filter(
                (r) => r.response === true
            ).length;
            const percentage = ((yesCount / responses.length) * 100).toFixed(1);
            return {
                value: `${yesCount}/${responses.length}`,
                percentage: `${percentage}%`,
                label: 'times (yes)',
            };
        }

        if (question.type === 'number') {
            const numbers = responses
                .map((r) => (typeof r.response === 'number' ? r.response : 0))
                .filter((n) => n > 0);
            const avg = (
                numbers.reduce((a, b) => a + b, 0) / numbers.length
            ).toFixed(1);
            const total = numbers.reduce((a, b) => a + b, 0);
            return {
                value: total,
                average: avg,
                label: `avg: ${avg}`,
            };
        }

        return null;
    };

    const stats = calculateStats();
    const responseRate = (
        (responses.length / days) *
        100
    ).toFixed(0);

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {question.topic && (
                <View style={styles.topicBadge}>
                    <Text style={styles.topicText}>{question.topic}</Text>
                </View>
            )}
            <Text style={styles.questionText}>{question.text}</Text>
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Last {days} days</Text>
                    <Text style={styles.statValue}>{responses.length}</Text>
                    <Text style={styles.statSubtext}>entries</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Response Rate</Text>
                    <Text style={styles.statValue}>{responseRate}%</Text>
                </View>
                {stats && (
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>{stats.label}</Text>
                        <Text style={styles.statValue}>{stats.value}</Text>
                        {stats.average && (
                            <Text style={styles.statSubtext}>avg: {stats.average}</Text>
                        )}
                        {stats.percentage && (
                            <Text style={styles.statSubtext}>{stats.percentage}</Text>
                        )}
                    </View>
                )}
            </View>
            <View style={styles.graphButton}>
                <Text style={styles.graphButtonText}>View Graph →</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    topicBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#FF7FC0',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    topicText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    questionText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 12,
        lineHeight: 22,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#F0F4FF',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    statLabel: {
        fontSize: 11,
        color: '#718096',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#20B2AA',
    },
    statSubtext: {
        fontSize: 11,
        color: '#666',
        marginTop: 4,
    },
    graphButton: {
        marginTop: 12,
        paddingVertical: 10,
        backgroundColor: '#20B2AA',
        borderRadius: 8,
        alignItems: 'center',
    },
    graphButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
