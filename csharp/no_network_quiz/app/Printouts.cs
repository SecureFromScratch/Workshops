using System;
using System.IO;

public static class Printouts
{
    public static void HelloUser(string name)
    {
        Console.Write("Hello, ");
        Console.Write(name);
        Console.WriteLine(",");
    }

    public static void QuestionAndAnswerOptions(string question, string[] answers)
    {
        Console.WriteLine(question);
        for (int i = 0; i < answers.Length; i++)
        {
            Console.Write(i + 1);
            Console.Write(") ");
            Console.WriteLine(answers[i]);
        }
    }

    public static void EmptyLine()
    {
        Console.WriteLine("");
    }

    public static void ThankYou()
    {
        Console.WriteLine("Thank you for participating.");
    }

    public static void ReportAnswerNumberError(int minimumAllowed, int maximumAllowed)
    {
        Console.WriteLine("You must enter an integer number between ");
        Console.Write(minimumAllowed);
        Console.Write(" and ");
        Console.WriteLine(maximumAllowed);
    }

    public static void PrintFile(string _filePath)
    {
        string[] lines = File.ReadAllLines(_filePath);
        foreach (string line in lines)
        {
            Console.WriteLine(line);
        }
    }
}
