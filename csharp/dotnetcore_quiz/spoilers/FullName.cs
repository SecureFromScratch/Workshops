namespace SecureFromScratch.Quiz.Safety.Spoilers
{
    public class FullName
    {
        private static readonly string VALID_CHARS = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'()-";

        public string Username { get; }

        public FullName(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                throw new ArgumentException("Username cannot be empty.");
            if (!hasOnlyValidChars(username, VALID_CHARS))
            {
                Console.Error.WriteLine("Name contains invlaid characters");
                throw new ArgumentException("Username is not valid.");
            }
            Username = username;
        }

        public override string ToString() => Username;

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
}
