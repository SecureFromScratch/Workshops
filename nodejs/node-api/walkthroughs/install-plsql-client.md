### 1. Install PostgreSQL (includes `psql`)

* Download from: [https://www.postgresql.org/download/windows](https://www.postgresql.org/download/windows)
* Run installer → make sure **“Command Line Tools”** is checked.
* After install, add the `bin` folder to your PATH, e.g.:

  ```
  C:\Program Files\PostgreSQL\16\bin
  ```
* Open a new terminal and run:

  ```powershell
  psql --version
  ```

---

### 2. Use **pgAdmin / standalone psql**

* Instead of full Postgres, you can install just **pgcli / psql** from the same page, or with **choco**:

  ```powershell
  choco install postgresql
  ```

  (adds `psql` to PATH automatically after restart).

---

### 3. Use **WSL**

If you have WSL Ubuntu/Debian:

```bash
sudo apt update
sudo apt install postgresql-client
psql -h 127.0.0.1 -U postgres -d nodeapi
```

