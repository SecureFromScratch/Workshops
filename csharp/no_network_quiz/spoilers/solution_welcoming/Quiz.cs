using System;
using System.IO;
using System.Text;

class Quiz
{
    private static readonly string ANSWERS_FILEPATH = "answers.txt";
    private static readonly string TEACHER_NAME = "the teacher";
    private static readonly string OUTPUT_FORMAT = "{0}: {1}";
    private static readonly string VALID_CHARS = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'()-";

    public static void Main(string[] args)
    {

        //while (5 == 5)
        //{
            string name = AskForName();
            Printouts.HelloUser(name);

            if (!IsTeacher(name))
            {
                QuizStudent(name);
            }
            else
            {
                PrintAnswerResults();
            }
        //}
    }

    private static bool hasOnlyValidChars(string input, string validChars)
    {
        foreach (char c in input)
        {
            if (!validChars.Contains(c))
            {
                return false;
            }
        }

        return true;
    }

    private static string AskForName()
    {
        while (true)
        {
            Console.WriteLine("Hello, what is your name?");
            string name = Console.ReadLine() ?? "";

            int nameLength = name.Length;

            if (!name.Contains(" "))
            {
                Console.Error.WriteLine("You must give your FULL name.");
                continue;
            }

            if (name.Length > 50)
            {
                Console.Error.WriteLine("Name is too long.");
                continue;
            }
            // ALSO check for length!
            if (!hasOnlyValidChars(name, VALID_CHARS))
            {
                Console.Error.WriteLine("Name contains invlaid characters");
                continue;
            }

            return name;
        }
    }

    private static int AskForAnswerNumber(int minimumAllowed, int maximumAllowed)
    {
        Console.WriteLine("Which is the correct answer?");
        while (true)
        {
            string response = Console.ReadLine() ?? "";
            try
            {
                int value = Int32.Parse(response);
                if (value >= minimumAllowed && value <= maximumAllowed)
                {
                    return value;
                }
                Printouts.ReportAnswerNumberError(minimumAllowed, maximumAllowed);
            }
            catch (FormatException)
            {
                Printouts.ReportAnswerNumberError(minimumAllowed, maximumAllowed);
            }
        }
    }

    private static void QuizStudent(string studentName)
    {
        MultipleChoiceQuestions questionAndAnswers = new MultipleChoiceQuestions();

        string[] answers = questionAndAnswers.GetShuffledAnswers();
        Printouts.QuestionAndAnswerOptions(questionAndAnswers.Question, answers);

        Printouts.EmptyLine();

        int answerNumberStartingAt1 = AskForAnswerNumber(1, answers.Length);

        string rightOrWrong = questionAndAnswers.IsCorrectAnswer(answers[answerNumberStartingAt1 - 1])
            ? "Right"
            : "Wrong";
        AddAnswerToAnswersFile(studentName, rightOrWrong);

        Printouts.ThankYou();
    }

    private static bool IsTeacher(string name)
    {
        return name.Equals(TEACHER_NAME, StringComparison.OrdinalIgnoreCase);
    }

    private static void PrintAnswerResults()
    {
        if (File.Exists(ANSWERS_FILEPATH))
        {
            Printouts.PrintFile(ANSWERS_FILEPATH);
        }
        else
        {
            Console.WriteLine("No answer results found.");
        }
    }

    private static void AddAnswerToAnswersFile(string studentName, string rightOrWrong)
    {
        string content = String.Format(OUTPUT_FORMAT, rightOrWrong, studentName);
        File.AppendAllText(ANSWERS_FILEPATH, content + Environment.NewLine, Encoding.UTF8);
    }
}
