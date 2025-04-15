using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SecureFromScratch.Quiz.Model;
using SecureFromScratch.Quiz.Services;
using SecureFromScratch.Quiz.Safety;
using SecureFromScratch.Quiz.Config;

namespace SecureFromScratch.Quiz.Controllers
{
    [ApiController]
    [Route("/")]
    public class QuizController : ControllerBase
    {
        private readonly ILogger<QuizController> _logger;
        private readonly ILogger _answersLogger;
        private readonly MultipleChoiceQuestion _quizService;

        public QuizController(
            ILogger<QuizController> logger,
            ILoggerFactory loggerFactory,
            MultipleChoiceQuestion quizService)
        {
            _logger = logger;
            _answersLogger = loggerFactory.CreateLogger("Answers");
            _quizService = quizService;
        }




        private static string GenerateAnswerOption(string username, string optionText, bool isCorrect)
        {
            return $"<a href='/answer?username={username}&isCorrect={isCorrect}'>{optionText}</a><br>\n";
        }

        public record QuestionDetails(string Question, string[] Answers);

        [HttpGet("question")]
        public ContentResult GetQuestionDetails([FromQuery(Name = "username")] string rawUsername)
        {
            _logger.LogInformation("/question with name={Username}", rawUsername);

            var question = _quizService.GetQuestion();
            _logger.LogInformation("/question returning question: {Question}", question);

            var username = new FullName(rawUsername);
            var shuffledAnswers = _quizService.GenerateShuffledAnswers();
            var options = shuffledAnswers.Options;
            var correctAnswerIdx = shuffledAnswers.CorrectAnswerIdx;

            var html = "<html>" +
                       "<head><title>Answer The Daily Question</title></head>" +
                       "<body>" +
                       $"<h2>{question}</h2><br>\n" +
                       "Here are the possible answers, choose the appropriate link:<br>\n" +
                       GenerateAnswerOption(username.Username, options[0], correctAnswerIdx == 0) +
                       GenerateAnswerOption(username.Username, options[1], correctAnswerIdx == 1) +
                       GenerateAnswerOption(username.Username, options[2], correctAnswerIdx == 2) +
                       GenerateAnswerOption(username.Username, options[3], correctAnswerIdx == 3) +
                       "</body></html>";

            return Content(html, "text/html");
        }


        private string GenerateAnswerOption(object value, string v1, bool v2)
        {
            throw new NotImplementedException();
        }

        [HttpGet("answer")]
        public ContentResult SubmitAnswer([FromQuery(Name = "username")] string rawUsername, [FromQuery] bool isCorrect)
        {
            _logger.LogInformation("/answer with name={Username} and answer={Answer}", rawUsername, isCorrect);

            var username = new FullName(rawUsername);

            if (isCorrect)
                _answersLogger.LogWarning("Right: {Username}", username.Username);
            else
                _answersLogger.LogInformation("Wrong: {Username}", username.Username);

            var html = "<html>" +
                       "<head><title>Done!</title></head>" +
                       "<body>" +
                       $"<h2>Thank you for submitting, {username.Username}</h2>" +
                       "<a href='/index.html'>Start Again</a>" +
                       "</body></html>";

            return Content(html, "text/html");
        }

    }
}
