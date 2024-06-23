package spoilers.welcome_list;

import app.MultipleChoiceQuestions;
import app.Printouts;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.nio.file.Files;
import java.util.Arrays;


class Quiz {
    private static final Path ANSWERS_FILEPATH = Paths.get("answers.txt");
    private static final String TEACHER_NAME = "the teacher";
    private static final String OUTPUT_FORMAT = "%s: %s";
    // VALID_CHARACTERS - This is the Welcome(Allow)-List of legal characters
    private static final String VALID_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ '.()";

    private static final BufferedReader s_consoleReader = new BufferedReader(new InputStreamReader(System.in));

    public static void main(String[] a_args) throws IOException { 
        //while (true) {
        String name = askForName();
        Printouts.helloUser(name);

        if (!isTeacher(name)) {
            quizStudent(name);
        }

        printAnswerResults();
        //}
    }

    private static String askForName() throws IOException {
        while (true) {
            System.out.println("Hello, what is your name?");
            String name = s_consoleReader.readLine();
            // Rule 1 of validation - limit size/length
            if (name.length() > 50) {
                System.err.println("Name too long");
                continue;
            }
            // Rule 2 of validation - Use a Welcome(Allow)-List
            if (!hasOnlyValidCharacters(name, VALID_CHARACTERS)) {
                System.err.println("Name contains illegal characters");
                continue;
            }
        	if (!name.contains(" ")) {
                System.err.println("Your full name, please");
                continue;
        	}
            return name;        
        }
    }

    // This is the test function to check that a string contains only legal characters
    private static boolean hasOnlyValidCharacters(String a_str, String a_validCharacters) {
        for (int i = 0; i < a_str.length() ; ++i) {
            if (a_validCharacters.indexOf(a_str.charAt(i)) == -1) {
                return false;
            }
        }
        return true;
    }

    private static int askForAnswerNumber(int a_minimumAllowed, int a_maximumAllowed) throws IOException {
        System.out.println("Which is the correct answer?");
        while (true) {
            String response = s_consoleReader.readLine();
            try {
                int value = Integer.parseInt(response);
                if ((value >= a_minimumAllowed) && (value <= a_maximumAllowed)) {
                    return value;
                }
            }
            catch (NumberFormatException ex) {
            }
            Printouts.reportAnswerNumberError(a_minimumAllowed, a_maximumAllowed);
        }
    }

    private static void quizStudent(String a_studentName) throws IOException {
        MultipleChoiceQuestions questionAndAnswers = new MultipleChoiceQuestions();

        String[] answers = questionAndAnswers.getShuffledAnswers();
        Printouts.questionAndAnswerOptions(questionAndAnswers.getQuestion(), answers);

        Printouts.emptyLine();

        int answerNumberStartingAt1 = askForAnswerNumber(1, answers.length);

        String rightOrWrong = (questionAndAnswers.isCorrectAnswer(answers[answerNumberStartingAt1 - 1]))
            ? "Right"
            : "Wrong";
        addAnswerToAnswersFile(a_studentName, rightOrWrong);
    }

    private static boolean isTeacher(String _name) {
        return _name.toLowerCase().equals(TEACHER_NAME.toLowerCase());
    }

    private static void addAnswerToAnswersFile(String a_studentName, String a_resultDescription) throws IOException {
        String outputLine = String.format(OUTPUT_FORMAT, a_resultDescription, a_studentName);
        Files.write(ANSWERS_FILEPATH, Arrays.asList(outputLine), new StandardOpenOption[]{ StandardOpenOption.CREATE, StandardOpenOption.APPEND });
    }

    private static void printAnswerResults() throws IOException {
        Printouts.printFile(ANSWERS_FILEPATH);
    }
}
