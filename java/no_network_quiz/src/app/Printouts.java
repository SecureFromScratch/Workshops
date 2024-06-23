package app;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class Printouts {
    public static void helloUser(String a_name) {
        System.out.print("Hello, ");
        System.out.print(a_name);
        System.out.println(",");
    }

    public static void questionAndAnswerOptions(String a_question, String[] a_answers) {
        System.out.println(a_question);
        for (int i = 0 ; i < a_answers.length ; ++i) {
            System.out.print(i + 1);
            System.out.print(") ");
            System.out.println(a_answers[i]);
        }
    }

    public static void emptyLine() {
        System.out.println("");
    }

    public static void reportAnswerNumberError(int a_minimumAllowed, int a_maximumAllowed) {
        System.out.println("You must enter an integer number between ");
        System.out.print(a_minimumAllowed);
        System.out.print(" and ");
        System.out.println(a_maximumAllowed);
    }

    public static void printFile(Path a_filepath) throws IOException {
        List<String> lines = Files.readAllLines(a_filepath);
        for (String line : lines) {
            System.out.println(line);
        }
    }
}
