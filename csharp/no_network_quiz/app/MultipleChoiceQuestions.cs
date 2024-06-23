using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

public class MultipleChoiceQuestions
{
    private static readonly string FILENAME = "question.txt";

    private readonly QuestionAndAnswers m_questionData;

    public MultipleChoiceQuestions()
    {
        m_questionData = LoadQuestion(FILENAME);
    }

    public MultipleChoiceQuestions(string _filePath)
    {
        m_questionData = LoadQuestion(_filePath);
    }

    public string Question {
        get { return m_questionData.Question; }
    }

    public string[] GetShuffledAnswers()
    {
        return m_questionData.GetShuffledAnswers();
    }

    public bool IsCorrectAnswer(string _answer)
    {
        return m_questionData.IsCorrectAnswer(_answer);
    }

    private static QuestionAndAnswers LoadQuestion(string _filePath)
    {
        var lines = File.ReadAllLines(_filePath).ToList();
        string question = lines[0];
        lines.RemoveAt(0);
        string correctAnswer = lines[0];
        lines.RemoveAt(0);
        string[] wrongAnswerOptions = lines.ToArray();
        return new QuestionAndAnswers(question, correctAnswer, wrongAnswerOptions);
    }
}
