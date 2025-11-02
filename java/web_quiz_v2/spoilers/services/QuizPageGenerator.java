package com.securefromscratch.quiz.services;

import static j2html.TagCreator.*;

import java.util.List;

import j2html.tags.specialized.DivTag;
import j2html.tags.specialized.HtmlTag;

public class QuizPageGenerator {
    public static HtmlTag generateOptionsPage(String a_username, String a_question, String[] a_options, int a_correctAnswerIdx) {
        return html(
            head(title("Answer The Daily Question")),
            body(
                h2(a_question),
                form()
                .withId("quiz-form")
                .withMethod("POST")
                .withAction("/answer")
                .with(
                    generateAnswerChoice(0, a_options[0]),
                    generateAnswerChoice(1, a_options[1]),
                    generateAnswerChoice(2, a_options[2]),
                    generateAnswerChoice(3, a_options[3]),
                    input().withType("hidden")
                        .withName("answerIdx")
                        .withValue("" + a_correctAnswerIdx),
                    input().withType("hidden")
                        .withName("username")
                        .withValue(a_username),
                    button("Submit Answer").withType("submit")
                )
            )
        );
    }

    private static DivTag generateAnswerChoice(int a_answerIdx, String a_answer) {
        return div(
            input().withType("radio")
                .withName("answer")
                .withValue("" + a_answerIdx)
                .withId("ans" + a_answerIdx)
                .isRequired(),
            label(a_answer).withFor("ans" + a_answerIdx),
            br()
        );
    }
}
