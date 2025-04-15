namespace SecureFromScratch.Quiz.Safety
{
    public class FullName
    {
        
        public string Username { get; }

        public FullName(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                throw new ArgumentException("Username cannot be empty.");
            Username = username;
        }

        public override string ToString() => Username;
    }
}
