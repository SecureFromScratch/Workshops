package com.securefromscratch.quiz.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.stereotype.Service;

import com.securefromscratch.quiz.model.QuestionAndAnswers;
import com.securefromscratch.quiz.model.QuestionAndAnswers.ShuffledAnswers;

@Service
public class MultipleChoiceQuestion {
	private static final Path FILENAME = Paths.get("question.txt");

    private final QuestionAndAnswers m_questionData;

    public MultipleChoiceQuestion() throws IOException {
    	this(FILENAME);
    }

    public MultipleChoiceQuestion(Path a_filepath) throws IOException {
        m_questionData = loadQuestion(a_filepath);
    }

    public String getQuestion() {
        return m_questionData.getQuestion();
    }

    public ShuffledAnswers generateShuffledAnswers() {
        return m_questionData.generateShuffledAnswers();
    }

    public boolean isCorrectAnswer(String a_answer) {
        return m_questionData.isCorrectAnswer(a_answer);
    }

    private static QuestionAndAnswers loadQuestion(Path a_filepath) throws IOException {
        System.out.println(a_filepath.toAbsolutePath());
        List<String> lines = Files.readAllLines(a_filepath);
        String question = lines.remove(0);
        String correctAnswer = lines.remove(0);
        String[] wrongAnswerOptions = new String[lines.size()];
        if (lines.get(lines.size() - 1).trim().isEmpty()) {
            lines.remove(lines.size() - 1);
        }
        lines.toArray(wrongAnswerOptions);
        return new QuestionAndAnswers(question, correctAnswer, wrongAnswerOptions);
    }
}
