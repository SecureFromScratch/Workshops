# Quick Reference - Recipes Lab

## 🚀 First Time Setup (Day 1)
```powershell
# Run as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force
.\setup-lab.ps1
```
**Wait 10 minutes** ☕

---

## 🔄 Daily Startup (Day 2+)
```powershell
.\restart-lab.ps1
```
**Wait 1-2 minutes**

---

## ▶️ Running the Application

### 1️⃣ Open VS Code
```bash
cd Workshops/csharp/recipes_2026/challanges/Recipes
code .
```
⚠️ **Important:** Root folder must be `Recipes` (with `Recipes.sln`)

### 2️⃣ Start Backend (API + BFF)
| Action | Command |
|--------|---------|
| Open debugger | `Ctrl + Shift + D` |
| Select | `API + BFF` from dropdown |
| Run | `F5` or click green ▶️ |
| Verify | http://localhost:5000/swagger |

### 3️⃣ Start Frontend (Angular)
```bash
# In VS Code terminal (Ctrl + `)
cd src/recipes-ui
ng s
```
Open: http://localhost:4200

---

## 🛑 Shutdown

```powershell
# Stop debugging in VS Code: Shift+F5
# Stop Angular: Ctrl+C in terminal

# Stop Docker services
cd src/Recipes.Api
docker compose down
```

---

## 🔍 Quick Checks

### Is everything running?
```powershell
docker ps  # Should show localstack and sqlserver
```

### Are secrets configured?
```powershell
aws --endpoint-url=http://localhost:4566 secretsmanager list-secrets
```

### Full verification
```powershell
.\verify-setup.ps1
```

---

## 🐛 Quick Fixes

### "Docker not running"
1. Start Docker Desktop
2. Wait for whale icon 🐳
3. Rerun `.\restart-lab.ps1`

### "Can't find Recipes.sln"
- Close VS Code
- Open at correct folder: `Workshops/csharp/recipes_2026/challanges/Recipes`
- Should see `Recipes.sln` in root

### "API won't start"
```powershell
cd src/Recipes.Api
docker compose restart sqlserver
```

### "Angular compilation errors"
```bash
cd src/recipes-ui
rm -rf node_modules
npm install
ng s
```

### "Secrets not found"
```powershell
.\restart-lab.ps1  # Recreates secrets automatically
```

---

## 📍 Important URLs

| Service | URL |
|---------|-----|
| Swagger (API docs) | http://localhost:5000/swagger |
| Angular App | http://localhost:4200 |
| LocalStack | http://localhost:4566 |
| SQL Server | localhost,14333 |

---

## 🗝️ Credentials

### LocalStack Secrets
```powershell
# SA Password
aws --endpoint-url=http://localhost:4566 secretsmanager get-secret-value \
    --secret-id recipes/dev/sa-password \
    --query SecretString --output text

# App Connection String
aws --endpoint-url=http://localhost:4566 secretsmanager get-secret-value \
    --secret-id recipes/dev/app-db-connection \
    --query SecretString --output text
```

### Database Users
| User | Password | Purpose |
|------|----------|---------|
| `sa` | From LocalStack | System admin |
| `recipes_admin` | StrongP4ssword123 | Migrations |
| `recipes_app` | StrongP4ssword123 | Runtime |

---

## 📂 Folder Structure

```
Recipes/                        ← Open VS Code HERE
├── Recipes.sln                 ← Should see this!
├── src/
│   ├── Recipes.Api/            ← Backend API
│   │   ├── docker-compose.yml
│   │   └── start-db.ps1
│   ├── Recipes.Bff/            ← Backend for Frontend
│   └── recipes-ui/             ← Angular app
├── setup-lab.ps1               ← First time only
├── restart-lab.ps1             ← Every day
└── verify-setup.ps1            ← When something's wrong
```

---

## 💡 VS Code Shortcuts

| Action | Shortcut |
|--------|----------|
| Open debugger | `Ctrl + Shift + D` |
| Start debugging | `F5` |
| Stop debugging | `Shift + F5` |
| New terminal | `Ctrl + \`` |
| Command palette | `Ctrl + Shift + P` |

---

## 🎯 Typical Workflow

### Morning (2 minutes):
1. Start Docker Desktop
2. Run `.\restart-lab.ps1`
3. Open VS Code at Recipes folder
4. `Ctrl+Shift+D` → Select "API + BFF" → `F5`
5. New terminal → `cd src/recipes-ui` → `ng s`
6. Start coding! 🚀

### During Development:
- Backend changes: Just save, hot reload works
- Database changes: Might need to restart API
- Frontend changes: Auto-reloads on save

### End of Day:
1. Stop debugger (`Shift+F5`)
2. Stop Angular (`Ctrl+C`)
3. `docker compose down`
4. Close VS Code

---

## 📞 Help

1. **First:** Run `.\verify-setup.ps1`
2. **Check:** Troubleshooting section above
3. **Read:** QUICK-START.md for detailed help
4. **Ask:** Your instructor

---

**💾 Print this and keep it handy!**
