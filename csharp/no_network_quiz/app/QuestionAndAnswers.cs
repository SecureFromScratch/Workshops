using System;
using System.Linq;
using System.Security.Cryptography;

public class QuestionAndAnswers
{
    public string Question { get; }
    public string CorrectAnswer { get; }
    private readonly string[] m_wrongAnswerOptions;

    public QuestionAndAnswers(string _question, string _correctAnswer, string[] _wrongAnswerOptions)
    {
        Question = _question;
        CorrectAnswer = _correctAnswer;
        m_wrongAnswerOptions = _wrongAnswerOptions;
    }

    public string[] GetShuffledAnswers()
    {
        string[] possibleAnswers = new string[m_wrongAnswerOptions.Length + 1];
        Array.Copy(m_wrongAnswerOptions, possibleAnswers, m_wrongAnswerOptions.Length);
        possibleAnswers[m_wrongAnswerOptions.Length] = CorrectAnswer;
        SecureShuffle(possibleAnswers);
        return possibleAnswers;
    }

    public bool IsCorrectAnswer(string _answer)
    {
        return _answer.Equals(CorrectAnswer);
    }

    private static void SecureShuffle(string[] _toShuffle)
    {
        using (var rng = new RNGCryptoServiceProvider())
        {
            int n = _toShuffle.Length;
            while (n > 1)
            {
                byte[] box = new byte[1];
                do rng.GetBytes(box);
                while (!(box[0] < n * (Byte.MaxValue / n)));
                int k = (box[0] % n);
                n--;
                string value = _toShuffle[k];
                _toShuffle[k] = _toShuffle[n];
                _toShuffle[n] = value;
            }
        }
    }
}
