# PREREQUISITES - COMPLETE BEFORE LAB

## ✅ What You Need

Before running the setup script, you must have:

### **1. Windows 10 or Windows 11**
- Home, Pro, or Enterprise edition
- 64-bit version

### **2. Administrator Access**
- You'll need to run PowerShell as Administrator

### **3. Docker Desktop (REQUIRED!)**

⚠️ **IMPORTANT: Install Docker Desktop BEFORE the workshop!**

#### **Installation Steps:**

1. **Download Docker Desktop:**
   - Go to: https://www.docker.com/products/docker-desktop
   - Download "Docker Desktop for Windows"

2. **Install:**
   - Run the installer
   - Accept defaults
   - **IMPORTANT:** When installation completes, it will ask you to restart

3. **RESTART YOUR COMPUTER** (Required!)
   - Docker Desktop will not work without a restart
   - This is why we need it installed beforehand!

4. **After Restart:**
   - Start Docker Desktop
   - Look for the whale icon 🐳 in system tray (bottom-right)
   - Wait until the whale icon stops animating (solid, not spinning)
   - The popup should say "Docker Desktop is running"

5. **Verify It's Working:**
   - Open PowerShell
   - Run: `docker ps`
   - Should show column headers (not an error)
   - Example output:
     ```
     CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
     ```

---

## 🚨 **Common Issues**

### **"docker: command not found"**
- Docker Desktop not installed → Install it
- Installed but didn't restart → Restart your computer
- Installed but not started → Start Docker Desktop

### **"error during connect"**
- Docker Desktop not running → Start it
- Not ready yet → Wait for whale icon to be solid

### **"This app can't run on your PC"**
- Need 64-bit Windows → Check your Windows version
- Need virtualization enabled → Enable in BIOS

---

## ✅ **Ready to Go?**

Checklist before the lab:
- [ ] Windows 10/11 (64-bit)
- [ ] Docker Desktop installed
- [ ] Computer restarted after Docker installation
- [ ] Docker Desktop started (whale icon visible)
- [ ] `docker ps` command works (no errors)

**Once all these are checked, you're ready for the lab!**

---

## 📅 **Workshop Day**

On the day of the workshop:

1. **Start Docker Desktop** (if not already running)
2. **Wait for the whale icon** to be solid
3. **Run the setup script:** `.\setup-lab.ps1`
4. Everything else installs automatically!

---

## ⏱️ **Time Estimates**

- **Docker Desktop installation:** 5-10 minutes
- **Computer restart:** 2-3 minutes
- **First-time Docker startup:** 2-3 minutes
- **Lab setup script:** 10-15 minutes

**Total:** About 20-30 minutes if Docker isn't pre-installed

**With Docker pre-installed:** Only 10-15 minutes!

---

## 💡 **Why Docker Desktop First?**

Docker Desktop requires a computer restart to work properly. If we tried to install it during the automated setup:

1. Script installs Docker ✅
2. Script says "Please restart" ❌
3. You restart
4. You have to rerun the script
5. Confusing experience!

**Better:** Install Docker once beforehand, restart once, then the automated setup runs smoothly from start to finish!

---

## ❓ **Questions?**

If you have any issues with Docker Desktop installation, reach out **before the workshop** so we can help you get set up!
