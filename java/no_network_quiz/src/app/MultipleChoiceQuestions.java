package app;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

public class MultipleChoiceQuestions {
	private static final Path FILENAME = Paths.get("question.txt");

    private final QuestionAndAnswers m_questionData;

    public MultipleChoiceQuestions() throws IOException {
    	this(FILENAME);
    }

    public MultipleChoiceQuestions(Path a_filepath) throws IOException {
        m_questionData = loadQuestion(a_filepath);
    }

    public String getQuestion() {
        return m_questionData.getQuestion();
    }

    public String[] getShuffledAnswers() {
        return m_questionData.getShuffledAnswers();
    }

    public boolean isCorrectAnswer(String a_answer) {
        return m_questionData.isCorrectAnswer(a_answer);
    }

    private static QuestionAndAnswers loadQuestion(Path a_filepath) throws IOException {
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
