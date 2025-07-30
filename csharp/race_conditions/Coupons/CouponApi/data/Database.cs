using Microsoft.Data.Sqlite;

public static class Database
{
    //private const string ConnString = "Data Source=coupons.db";
    private const string ConnString = "Data Source=coupons.db;Mode=ReadWriteCreate;Cache=Shared";


    public static void Initialize()
    {
        using var conn = new SqliteConnection(ConnString);
        conn.Open();

        var pragma = conn.CreateCommand();
        pragma.CommandText = "PRAGMA journal_mode=WAL;";
        pragma.ExecuteNonQuery();

        var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            CREATE TABLE IF NOT EXISTS Coupons (
                Code TEXT PRIMARY KEY,
                IsUsed INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS Orders (
                Id INTEGER PRIMARY KEY,
                Amount REAL NOT NULL,
                CouponApplied INTEGER NOT NULL DEFAULT 0
            );
            INSERT OR IGNORE INTO Coupons (Code, IsUsed) VALUES ('SAVE10', 0);
            INSERT OR IGNORE INTO Coupons (Code, IsUsed) VALUES ('SAVE20', 0);
            INSERT OR IGNORE INTO Coupons (Code, IsUsed) VALUES ('SAVE30', 0);
            INSERT OR IGNORE INTO Coupons (Code, IsUsed) VALUES ('SAVE40', 0);
            INSERT OR IGNORE INTO Coupons (Code, IsUsed) VALUES ('SAVE50', 0);
            INSERT OR IGNORE INTO Coupons (Code, IsUsed) VALUES ('SAVE60', 0);
            INSERT OR IGNORE INTO Coupons (Code, IsUsed) VALUES ('SAVE70', 0);
            INSERT OR IGNORE INTO Coupons (Code, IsUsed) VALUES ('SAVE80', 0);
            INSERT OR IGNORE INTO Coupons (Code, IsUsed) VALUES ('SAVE90', 0);
            INSERT OR IGNORE INTO Coupons (Code, IsUsed) VALUES ('SAVE100', 0);
            INSERT OR IGNORE INTO Orders (Id, Amount, CouponApplied) VALUES (1, 100, 0);            
        ";
        cmd.ExecuteNonQuery();
    }

    public static SqliteConnection GetConnection() => new(ConnString);
}
