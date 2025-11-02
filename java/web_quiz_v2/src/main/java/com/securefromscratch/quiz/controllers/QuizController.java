package com.securefromscratch.quiz.controllers;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.security.SecureRandom;
import java.util.logging.Logger;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static j2html.TagCreator.*;

import com.securefromscratch.quiz.safety.FullName;
import com.securefromscratch.quiz.config.LoggerConfig;
import com.securefromscratch.quiz.model.QuestionAndAnswers.ShuffledAnswers;
import com.securefromscratch.quiz.services.MultipleChoiceQuestion;
import com.securefromscratch.quiz.utils.IsCorrectObfuscator;
import com.securefromscratch.quiz.services.AnswerResultsStore;

@RestController
@RequestMapping("/")
public class QuizController {
    private static final Logger LOGGER = LoggerConfig.genLogger(QuizController.class.getSimpleName());
    private static final Logger ANSWERS_LOGGER = LoggerConfig.genLogger("Answers");

    private final MultipleChoiceQuestion m_quizService;

    private static String generateAnswerOption(String a_username, String a_optionText, boolean a_isCorrect) {
        return String.format(
            "<a href='/answer?username=%s&isCorrect=%s'>" 
            + a_optionText 
            + "</a><br>\n", a_username, IsCorrectObfuscator.encode(a_isCorrect));
    }

    public record QuestionDetails(String question, String[] answers) { }
    @GetMapping("/question")
    public String getQuestionDetails(@RequestParam("username") FullName username) {
        LOGGER.info(String.format("/question with name=%s", username));
        LOGGER.info(String.format("/question returning question: %s", m_quizService.getQuestion()));
        ShuffledAnswers shuffledAnswers = m_quizService.generateShuffledAnswers();
        String[] options = shuffledAnswers.options() ;
        int correctAnswerIdx = shuffledAnswers.correctAnswerIdx();
        return "<html>"
            + "<head><title>Answer The Daily Question</title></head>"
            + "<body>"
            + "<h2>" + m_quizService.getQuestion() + "</h2><br>\n"
            + "Here are the possible answers, choose the appropriate link:<br>\n"
            + generateAnswerOption(username.get(), options[0], 0 == correctAnswerIdx)
            + generateAnswerOption(username.get(), options[1], 1 == correctAnswerIdx)
            + generateAnswerOption(username.get(), options[2], 2 == correctAnswerIdx)
            + generateAnswerOption(username.get(), options[3], 3 == correctAnswerIdx)
            + "</body></html>";
    }

    @GetMapping("/answer")
    public String submitAnswer(@RequestParam("username") FullName username, @RequestParam("isCorrect") String isCorrectAsBase64) throws IOException {
        LOGGER.info(String.format("/answer with name=%s and answer=%s", username, isCorrectAsBase64));

        boolean isCorrect = IsCorrectObfuscator.decode(isCorrectAsBase64);
        writeAnswerResultToFile(username, isCorrect);

        return html(
            head(title("Done!")),
            body(
                h2("Thank you for submitting, " + username),
                a("Start Again").withHref("/index.html")
            )
        ).render();
    }

    private final AnswerResultsStore m_resultsStore;

    public QuizController(MultipleChoiceQuestion quizService, AnswerResultsStore resultsStore) {
        this.m_quizService = quizService;
        this.m_resultsStore = resultsStore;
    }

    private void writeAnswerResultToFile(FullName username, boolean isCorrect) throws IOException {
        m_resultsStore.addLine(...); // DO NOT USE COLON OR NEWLINE!

        /*try (BufferedWriter writer = Files.newBufferedWriter(
                Paths.get("answers.txt"), 
                StandardOpenOption.APPEND, 
                StandardOpenOption.CREATE)) {
            if (isCorrect) {
                writer.write("Right: ");
            }
            else {
                writer.write("Wrong: ");
            }
            writer.write(username.get());
            writer.newLine();
        }*/
    }
}
