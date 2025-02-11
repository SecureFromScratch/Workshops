package com.securefromscratch.quiz.model;

import java.security.SecureRandom;
import java.util.Arrays;

public class QuestionAndAnswers {
    public String m_question;
    public String m_correctAnswer;
    public String[] m_wrongAnswerOptions;  

    public QuestionAndAnswers(String a_question, String a_correctAnswer, String[] a_wrongAnswerOptions) {
        m_question = a_question;
        m_correctAnswer = a_correctAnswer;
        m_wrongAnswerOptions = a_wrongAnswerOptions;
    }

    public String getQuestion() {
        return m_question;
    }

    public record ShuffledAnswers(String[] options, int correctAnswerIdx) { }
    public ShuffledAnswers generateShuffledAnswers() {
        String[] possibleAnswers = Arrays.copyOf(m_wrongAnswerOptions, m_wrongAnswerOptions.length + 1);
        possibleAnswers[m_wrongAnswerOptions.length] = m_correctAnswer;
        int correctAnswerIdx = secureShuffle(possibleAnswers, m_wrongAnswerOptions.length);
        return new ShuffledAnswers(possibleAnswers, correctAnswerIdx);
    }

    public boolean isCorrectAnswer(String a_answer) {
        return a_answer.equals(m_correctAnswer);
    }

    private static int secureShuffle(String[] a_toShuffle, int a_correctAnswerIdx) {
        SecureRandom random = new SecureRandom();
        for (int i = a_toShuffle.length - 1; i > 0; --i) {
            int toSwapWith = random.nextInt(i + 1);

            // Simple swap
            String savedFirstVal = a_toShuffle[toSwapWith];
            a_toShuffle[toSwapWith] = a_toShuffle[i];
            a_toShuffle[i] = savedFirstVal;
            if (a_correctAnswerIdx == toSwapWith) {
                a_correctAnswerIdx = i;
            }
        }
        return a_correctAnswerIdx;
    }
}
