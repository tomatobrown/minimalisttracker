import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { QuestionForm } from '@/src/components/QuestionForm';
import { storage } from '@/src/storage/storage';
import { Question, DailyResponse } from '@/src/types';

export default function DailyCheckInScreen() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
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

      const dateData = await storage.getDailyResponses(selectedDate);
      const responseMap = new Map(
        dateData.map((r) => [r.questionId, r])
      );
      setTodayResponses(responseMap);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    const today = new Date().toISOString().split('T')[0];
    const newDate = date.toISOString().split('T')[0];
    if (newDate <= today) {
      setSelectedDate(newDate);
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const isTomorrow = selectedDate > new Date().toISOString().split('T')[0];

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedDate]);

  const handleSubmit = async (responses: DailyResponse[]) => {
    try {
      for (const response of responses) {
        await storage.saveDailyResponse(selectedDate, response);
      }
      Alert.alert('Success', `Your responses for ${selectedDate} have been saved!`);
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
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={goToPreviousDay} style={styles.navButton}>
          <Text style={styles.navButtonText}>← Prev</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>{selectedDate}</Text>
        <TouchableOpacity
          onPress={goToNextDay}
          style={[styles.navButton, isTomorrow && styles.navButtonDisabled]}
          disabled={isTomorrow}
        >
          <Text style={[styles.navButtonText, isTomorrow && styles.navButtonTextDisabled]}>Next →</Text>
        </TouchableOpacity>
      </View>
      <QuestionForm
        questions={questions}
        onSubmit={handleSubmit}
        initialResponses={todayResponses}
      />
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
  dateNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#20B2AA',
  },
  navButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  navButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  navButtonTextDisabled: {
    color: '#A0AEC0',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
