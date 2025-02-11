package com.securefromscratch.quiz.controllers;

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

@RestController
@RequestMapping("/")
public class QuizController {
    private static final Logger LOGGER = LoggerConfig.genLogger(QuizController.class.getSimpleName());
    private static final Logger ANSWERS_LOGGER = LoggerConfig.genLogger("Answers");

    private final MultipleChoiceQuestion m_quizService;

    public QuizController(MultipleChoiceQuestion quizService) {
        this.m_quizService = quizService;
    }

    private static String generateAnswerOption(String a_username, String a_optionText, boolean a_isCorrect) {
        return String.format(
            "<a href='/answer?username=%s&isCorrect=%s'>" 
            + a_optionText 
            + "</a><br>\n", a_username, a_isCorrect);
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
    public String submitAnswer(@RequestParam("username") FullName username, @RequestParam("isCorrect") boolean isCorrect) {
        LOGGER.info(String.format("/answer with name=%s and answer=%s", username, isCorrect));

        if (isCorrect) {
            ANSWERS_LOGGER.warning("Right: " + username);
        }
        else {
            ANSWERS_LOGGER.info("Wrong: " + username);
        }
        return html(
            head(title("Done!")),
            body(
                h2("Thank you for submitting, " + username),
                a("Start Again").withHref("/index.html")
            )
        ).render();
    }
}
