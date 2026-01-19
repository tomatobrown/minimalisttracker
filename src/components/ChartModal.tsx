import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Question, DailyResponse } from '../types';
import { Colors } from '../../constants/theme';

interface ChartModalProps {
    visible: boolean;
    question: Question | null;
    responses: DailyResponse[];
    days: number;
    onClose: () => void;
}

export const ChartModal: React.FC<ChartModalProps> = ({
    visible,
    question,
    responses,
    days,
    onClose,
}) => {
    if (!question) return null;

    const chartWidth = Dimensions.get('window').width - 32;

    const prepareChartData = () => {
        const sortedResponses = [...responses].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        if (question.type === 'number') {
            const labels = sortedResponses.slice(-14).map((r) => {
                const date = new Date(r.date);
                return `${date.getMonth() + 1}/${date.getDate()}`;
            });

            const data = sortedResponses.slice(-14).map((r) => {
                return typeof r.response === 'number' ? r.response : 0;
            });

            return {
                labels,
                datasets: [
                    {
                        data: data.length > 0 ? data : [0],
                        strokeWidth: 2,
                    },
                ],
            };
        } else if (question.type === 'yes-no') {
            const labels = sortedResponses.slice(-14).map((r) => {
                const date = new Date(r.date);
                return `${date.getMonth() + 1}/${date.getDate()}`;
            });

            const data = sortedResponses.slice(-14).map((r) => {
                return r.response === true ? 1 : 0;
            });

            return {
                labels,
                datasets: [
                    {
                        data: data.length > 0 ? data : [0],
                    },
                ],
            };
        }

        return { labels: [], datasets: [{ data: [0] }] };
    };

    const chartData = prepareChartData();

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{question.topic || question.text}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.chartTitle}>
                        {question.type === 'number' ? 'Daily Values' : 'Yes/No Pattern'}
                    </Text>

                    {question.type === 'number' ? (
                        <LineChart
                            data={chartData}
                            width={chartWidth}
                            height={250}
                            chartConfig={{
                                backgroundColor: Colors.light.surface,
                                backgroundGradientFrom: Colors.light.surface,
                                backgroundGradientTo: Colors.light.surface,
                                color: () => Colors.light.primary,
                                strokeWidth: 2,
                                useShadowColorFromDataset: false,
                                decimalPlaces: 0,
                            }}
                            style={styles.chart}
                        />
                    ) : (
                        <BarChart
                            data={chartData}
                            width={chartWidth}
                            height={250}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={{
                                backgroundColor: Colors.light.surface,
                                backgroundGradientFrom: Colors.light.surface,
                                backgroundGradientTo: Colors.light.surface,
                                color: () => Colors.light.accent,
                                strokeWidth: 2,
                                useShadowColorFromDataset: false,
                                decimalPlaces: 0,
                            }}
                            style={styles.chart}
                        />
                    )}

                    <View style={styles.statsSection}>
                        <Text style={styles.statsTitle}>Statistics</Text>
                        {question.type === 'number' && (
                            <>
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Total Entries:</Text>
                                    <Text style={styles.statValue}>{responses.length}</Text>
                                </View>
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Average:</Text>
                                    <Text style={styles.statValue}>
                                        {(
                                            responses
                                                .map((r) => (typeof r.response === 'number' ? r.response : 0))
                                                .reduce((a, b) => a + b, 0) / (responses.length || 1)
                                        ).toFixed(1)}
                                    </Text>
                                </View>
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Highest:</Text>
                                    <Text style={styles.statValue}>
                                        {Math.max(
                                            ...responses.map((r) =>
                                                typeof r.response === 'number' ? r.response : 0
                                            ),
                                            0
                                        )}
                                    </Text>
                                </View>
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Lowest:</Text>
                                    <Text style={styles.statValue}>
                                        {Math.min(
                                            ...responses.map((r) =>
                                                typeof r.response === 'number' ? r.response : 0
                                            ),
                                            999
                                        )}
                                    </Text>
                                </View>
                            </>
                        )}
                        {question.type === 'yes-no' && (
                            <>
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Total Entries:</Text>
                                    <Text style={styles.statValue}>{responses.length}</Text>
                                </View>
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Yes Count:</Text>
                                    <Text style={styles.statValue}>
                                        {responses.filter((r) => r.response === true).length}
                                    </Text>
                                </View>
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>No Count:</Text>
                                    <Text style={styles.statValue}>
                                        {responses.filter((r) => r.response === false).length}
                                    </Text>
                                </View>
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Yes Rate:</Text>
                                    <Text style={styles.statValue}>
                                        {(
                                            ((responses.filter((r) => r.response === true).length /
                                                responses.length) *
                                                100) ||
                                            0
                                        ).toFixed(1)}
                                        %
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.surface,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: Colors.light.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.surface,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.light.text,
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 8,
    },
    backButton: {
        padding: 8,
        zIndex: 10,
        minWidth: 60,
        marginTop: 16,
    },
    backButtonText: {
        fontSize: 16,
        color: Colors.light.primary,
        fontWeight: '600',
    },
    closeButton: {
        padding: 8,
        zIndex: 10,
        minWidth: 40,
        marginTop: 16,
    },
    closeButtonText: {
        fontSize: 28,
        color: Colors.light.primary,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 16,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 12,
    },
    statsSection: {
        marginTop: 24,
        backgroundColor: Colors.light.background,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 16,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.surface,
    },
    statLabel: {
        fontSize: 15,
        color: Colors.light.textSecondary,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.primary,
    },
});
