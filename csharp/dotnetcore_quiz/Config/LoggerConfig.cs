using Serilog;
using Serilog.Events;

namespace SecureFromScratch.Quiz.Config
{
    public static class LoggerConfig
    {
        public static void Configure()
        {
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Information()
                .Enrich.FromLogContext()
                .WriteTo.Console()
                .WriteTo.File("Logs/log.txt", rollingInterval: RollingInterval.Day)
                .CreateLogger();
        }
    }
}
