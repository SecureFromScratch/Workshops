# Install PostgreSQL Client Tools (Windows)

## 1. Download client binaries

* Go to: [https://www.enterprisedb.com/download-postgresql-binaries](https://www.enterprisedb.com/download-postgresql-binaries)
* Select **Windows**, version **16.x (64-bit)**.
* Download the `.zip` archive.

## 2. Extract the tools

* Unzip the archive to `C:\PostgreSQL\16` (or any folder you prefer).
* Inside you’ll see a `bin` folder containing `psql.exe`.

## 3. Add to PATH

1. Press **Win + R**, type `sysdm.cpl` → Enter.
2. Go to **Advanced → Environment Variables**.
3. Select **Path** → Edit → Add:

   ```
   C:\PostgreSQL\16\bin
   ```
4. Save and close. Open a new terminal.

## 4. Verify installation

Open **PowerShell** or **CMD**:

```powershell
psql --version
```

You should see the version number.

## 5. Connect to your database

Run:

```powershell
psql -h 127.0.0.1 -U postgres -d nodeapi
```

When prompted, enter the password (in this tutorial: `postgres`).


Do you want me to also write a **short “quick install” section** (one-page cheat sheet) for students, so they don’t have to read all the steps?
