using SecureFromScratch.Quiz.Model;

namespace SecureFromScratch.Quiz.Services
{
    public class MultipleChoiceQuestion
    {
        public string GetQuestion() => "What is the capital of France?";

        public ShuffledAnswers GenerateShuffledAnswers() => new ShuffledAnswers
        {
            Options = new[] { "Paris", "Berlin", "Rome", "Madrid" },
            CorrectAnswerIdx = 0
        };
    }
}
