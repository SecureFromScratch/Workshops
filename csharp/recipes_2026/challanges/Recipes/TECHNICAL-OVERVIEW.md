# Technical Overview - Lab Automation

## 🏗️ Architecture & Dependencies

This document explains how all the pieces fit together for instructors who want to understand or customize the automation.

---

## 📊 Startup Sequence Flow

```
1. LocalStack starts (port 4566)
   └─> Waits for health check
       │
2. AWS CLI configured for LocalStack
       │
3. Secrets created in LocalStack
   ├─> recipes/dev/sa-password
   ├─> recipes/dev/app-db-connection
   └─> recipes/dev/jwt-config
       │
4. start-db.ps1 executes
   ├─> Reads SA password from LocalStack
   ├─> Sets MSSQL_SA_PASSWORD environment variable
   ├─> Starts SQL Server container (port 14333)
   ├─> Removes environment variable (security)
   ├─> Waits for SQL Server ready
   ├─> Tests SA connection
   ├─> Runs init-db.sql (creates database & users)
   └─> Runs EF migrations (as recipes_admin)
       │
5. ✅ Environment Ready
```

**Key Insight:** SQL Server needs the SA password from LocalStack, which is why LocalStack must start first and secrets must be seeded before SQL Server starts.

---

## 🔐 Secrets in LocalStack

### Three secrets are created:

#### 1. `recipes/dev/sa-password`
```
Value: "StrongP4ssword123"
Used by: SQL Server SA account (system admin)
Purpose: Bootstrap database, create users
```

#### 2. `recipes/dev/app-db-connection`
```
Value: "Server=localhost,14333;Database=Recipes;User Id=recipes_app;Password=StrongP4ssword123;TrustServerCertificate=true;"
Used by: Recipes.Api application at runtime
Purpose: Application database access (least privilege)
```

#### 3. `recipes/dev/jwt-config`
```
Value: {"Secret":"ThisIsAStrongJwtSecretKey1234567","Issuer":"recipes-api","Audience":"recipes-client"}
Used by: Recipes.Api for JWT authentication
Purpose: Token signing and validation
```

---

## 🗄️ Database User Roles

Your `init-db.sql` creates three users with different privileges:

| User | Purpose | Privileges |
|------|---------|-----------|
| `sa` | System admin | Full control (from LocalStack secret) |
| `recipes_admin` | Migrations | db_owner (DDL: CREATE, ALTER, DROP) |
| `recipes_app` | Runtime | db_datareader, db_datawriter (DML only) |

**Security principle:** The app runs with minimal privileges (`recipes_app`), while migrations use elevated privileges (`recipes_admin`).

---

## 🐳 Docker Compose Structure

Your `docker-compose.yml` should look something like:

```yaml
services:
  localstack:
    image: localstack/localstack
    ports:
      - "4566:4566"
    environment:
      - SERVICES=secretsmanager
      - DEBUG=1
    volumes:
      - localstack-data:/var/lib/localstack

  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: recipes-sqlserver
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=${MSSQL_SA_PASSWORD}  # Injected by start-db.ps1
    ports:
      - "14333:1433"
    volumes:
      - ./init-db.sql:/init/init-db.sql  # Your database initialization script
      - sqlserver-data:/var/opt/mssql

volumes:
  localstack-data:
  sqlserver-data:
```

**Important notes:**
- `MSSQL_SA_PASSWORD` comes from environment variable (set by `start-db.ps1`)
- `init-db.sql` is mounted at `/init/init-db.sql`
- Container name is `recipes-sqlserver` (referenced in `start-db.ps1`)

---

## 📜 The start-db.ps1 Script

Your existing script does this:

```powershell
# 1. Get SA password from LocalStack
$saPassword = aws secretsmanager get-secret-value ...

# 2. Set as environment variable
$env:MSSQL_SA_PASSWORD = $saPassword

# 3. Start SQL Server (reads env var)
docker compose up -d sqlserver

# 4. Remove env var (security)
Remove-Item Env:\MSSQL_SA_PASSWORD

# 5. Wait and test connection
Start-Sleep -Seconds 15
docker exec recipes-sqlserver /opt/mssql-tools18/bin/sqlcmd ...

# 6. Run init-db.sql
docker exec -i recipes-sqlserver /opt/mssql-tools18/bin/sqlcmd \
    -i /init/init-db.sql

# 7. Run EF migrations (as recipes_admin)
dotnet ef database update --connection "...recipes_admin..."
```

**Why this approach?**
- ✅ Password never stored in files (only in LocalStack)
- ✅ Environment variable immediately cleared after use
- ✅ Proper user separation (SA → admin → app)
- ✅ Repeatable (can tear down and rebuild)

---

## 🔄 Automation Script Integration

### setup-lab.ps1 Flow:

```
1. Install prerequisites (winget)
2. Clone repository (sparse checkout)
3. Start LocalStack only
4. Seed secrets into LocalStack
5. Install packages (dotnet + npm)
6. Call start-db.ps1 ← Your existing script
   └─> Handles all database setup
7. Done!
```

**Why not start SQL Server directly?**
- `start-db.ps1` has additional logic (retry, connection testing, init-db.sql)
- It's already proven to work in your lab
- Reusing it reduces duplication and errors

### restart-lab.ps1 Flow:

```
1. Start LocalStack
2. Verify secrets (recreate if missing)
3. Call start-db.ps1 ← Same script
4. Done!
```

**Why might secrets be missing?**
- LocalStack data can be ephemeral (depending on docker-compose config)
- Students might have run `docker compose down -v` (deletes volumes)
- `restart-lab.ps1` handles this gracefully

---

## 🛠️ Required Files in Repository

For automation to work, students need:

```
Recipes/
├── src/
│   ├── Recipes.Api/
│   │   ├── docker-compose.yml        ← Defines localstack + sqlserver
│   │   ├── start-db.ps1              ← Your existing database setup script
│   │   └── init-db.sql               ← Database initialization (CREATE DATABASE, users)
│   ├── Recipes.Bff/
│   └── recipes-ui/
├── setup-lab.ps1                     ← NEW: One-time setup automation
├── restart-lab.ps1                   ← NEW: Daily restart automation
├── verify-setup.ps1                  ← NEW: Diagnostics
└── QUICK-START.md                    ← NEW: Student guide
```

**If init-db.sql is missing:**
- `start-db.ps1` will fail at step 6
- Students will need to create database manually
- Consider adding a fallback in automation if needed

---

## 🔍 Verification Points

The `verify-setup.ps1` checks:

1. ✅ Prerequisites installed (.NET, Node, Git, Docker, AWS CLI)
2. ✅ LocalStack container running
3. ✅ SQL Server container running
4. ✅ LocalStack API responding (http://localhost:4566)
5. ✅ All 3 secrets exist in LocalStack
6. ✅ Repository cloned correctly
7. ✅ NuGet packages restored
8. ✅ Node modules installed

**If any check fails:** Script shows exactly which step failed for easy debugging.

---

## ⚙️ Customization Points

### Change Passwords:

**In setup-lab.ps1 (lines 157-165):**
```powershell
aws secretsmanager create-secret \
    --name recipes/dev/sa-password \
    --secret-string "YourNewPassword123!"  # ← Change here
```

**Also update in:**
- `restart-lab.ps1` (lines 70-80)
- `init-db.sql` (if passwords are hardcoded there)
- `start-db.ps1` (if admin password is hardcoded)

### Change Ports:

**In docker-compose.yml:**
```yaml
ports:
  - "14333:1433"  # ← Change 14333 to your port
```

**Also update in:**
- `recipes/dev/app-db-connection` secret
- Any hardcoded connection strings
- `start-db.ps1` connection string

### Add Additional Secrets:

```powershell
# In setup-lab.ps1 and restart-lab.ps1
aws --endpoint-url=$endpoint secretsmanager create-secret \
    --name recipes/dev/your-new-secret \
    --secret-string "your-value"
```

**Also add verification in:**
- `verify-setup.ps1` (around line 125)

---

## 🐛 Common Issues & Solutions

### Issue: "SA password not found"
**Cause:** LocalStack not ready when secrets were created  
**Fix:** Automation has 30-second wait with health checks

### Issue: "SQL Server won't start"
**Cause:** Port 14333 already in use  
**Fix:** 
```powershell
netstat -ano | findstr :14333
# Kill the process or change port in docker-compose.yml
```

### Issue: "Secrets don't persist after restart"
**Cause:** LocalStack volume not configured in docker-compose  
**Fix:** Add volume to docker-compose.yml:
```yaml
volumes:
  - localstack-data:/var/lib/localstack
```

### Issue: "init-db.sql not found"
**Cause:** File not mounted in docker-compose  
**Fix:** Add volume mount:
```yaml
volumes:
  - ./init-db.sql:/init/init-db.sql
```

---

## 📈 Performance Notes

### Typical Execution Times:

| Task | Time | Can be parallelized? |
|------|------|---------------------|
| Install prerequisites | 2-3 min | ❌ (sequential downloads) |
| Clone repository | 30 sec | ❌ |
| Start LocalStack | 10-20 sec | ❌ |
| Seed secrets | 5 sec | ✅ (but minimal gain) |
| Install NuGet packages | 1-2 min | ❌ (dotnet restore is already parallel) |
| Install npm packages | 2-3 min | ❌ |
| Start SQL Server + init | 30-45 sec | ❌ |
| **Total (setup-lab.ps1)** | **8-12 min** | |
| **Total (restart-lab.ps1)** | **1-2 min** | |

---

## 🔒 Security Considerations

### What's good:
✅ Passwords stored in secret manager, not files  
✅ Environment variables cleared immediately after use  
✅ Least-privilege user for application runtime  
✅ Separate users for migration vs runtime  

### What to remind students:
⚠️ This is **local development only**  
⚠️ LocalStack is not AWS - credentials are fake  
⚠️ Never commit passwords to Git  
⚠️ Production would use real AWS Secrets Manager  

### For production:
- Use real AWS Secrets Manager with IAM roles
- Rotate passwords regularly
- Use Azure Key Vault or similar if on Azure
- Enable audit logging
- Use managed identities where possible

---

## 📚 Related Documentation

Students should read:
1. **QUICK-START.md** - How to use the automation
2. **Secret Manager tutorial** - Why we use secrets (your existing doc)

Instructors should read:
1. **INSTRUCTOR-GUIDE.md** - How to deploy and troubleshoot
2. **This document** - How it all works under the hood

---

## 🎓 Teaching Moments

While automation handles setup, use these teaching opportunities:

1. **While packages install (~3 min):**
   - Explain the architecture
   - Show the docker-compose.yml
   - Discuss why secrets matter

2. **When showing start-db.ps1:**
   - Point out the security pattern (get secret → use → clear)
   - Explain user privilege separation
   - Discuss why we can't just hardcode passwords

3. **After setup completes:**
   - Show LocalStack UI: http://localhost:4566/_localstack/health
   - Show how to query secrets: `aws secretsmanager list-secrets`
   - Demonstrate connecting to SQL Server

---

## 🔄 Update Workflow

If you need to update the workshop:

1. **Update the lab code** in GitHub
2. **Test on clean VM** with automation scripts
3. **Update scripts** if needed (e.g., new packages)
4. **Version the scripts** (e.g., v1.1) if major changes
5. **Notify students** to rerun setup if breaking changes

**Recommended:** Tag releases in GitHub:
```bash
git tag -a v1.0 -m "Initial lab release"
git push origin v1.0
```

Then students can use:
```bash
git checkout v1.0
```

---

## ✅ Pre-Deployment Checklist

Before releasing to students:

- [ ] Tested on Windows 10 and Windows 11
- [ ] Tested with Docker Desktop (not Docker CLI only)
- [ ] Tested on clean machine (no prior .NET/Node/etc)
- [ ] Verified all file paths match your repo structure
- [ ] Checked that init-db.sql exists and is mounted
- [ ] Confirmed container name in start-db.ps1 matches docker-compose
- [ ] Tested both setup-lab.ps1 and restart-lab.ps1
- [ ] Ran verify-setup.ps1 and confirmed all checks pass
- [ ] Updated QUICK-START.md with your specific repo URL
- [ ] Added scripts to your GitHub repo or distribution method

---

**You're ready to deploy!** The automation handles the complexity, you focus on teaching. 🎯
