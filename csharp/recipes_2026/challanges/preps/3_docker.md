## Install Docker
1. **Download Docker** 
   - Go to: https://www.docker.com/products/docker-desktop
   - Click "Download for Windows"
   - Or direct link: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe
2. **Run the Installer:**
   - Double-click `Docker Desktop Installer.exe`
   - Follow the installation wizard
   - **Important:** Check "Use WSL 2 instead of Hyper-V" (recommended)
   - Click "Ok" to proceed

3. **Restart Your Computer:**
   - Docker Desktop will prompt you to restart

4. **Start Docker Desktop:**
   - Open Docker Desktop from the Start menu
   - Wait for Docker to start (you'll see a whale icon in the system tray)
   - You may be prompted to install WSL 2 Linux kernel update - follow the link and install it

5. **Verify Installation:**
   Open PowerShell or Command Prompt:
   ```powershell
   docker --version
   docker-compose --version
   ```

   You should see something like:
   ```
   Docker version 24.0.x, build xxxxx
   Docker Compose version v2.x.x
   ```
