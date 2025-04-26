public class LoggerEx
{
    private readonly ILogger _logger;
    private static readonly string VALID_CHARS = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'()-";

    public LoggerEx(ILogger logger)
    {
        _logger = logger;
    }
    public void LogInformation(string message, params object[] args)
    {
        checkMessage(args);
        _logger.LogInformation(message, args);
    }
    public void LogWarning(string message, params object[] args)
    {
        checkMessage(args);
        _logger.LogWarning(message, args);
    }
    public void checkMessage(params object[] args)
    {
        foreach (string item in args)
        {
            if (!hasOnlyValidChars(item, VALID_CHARS))
            {
                Console.Error.WriteLine("Log contains invlaid characters");
                throw new ArgumentException("Log is not valid.");
            }
        }
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



}