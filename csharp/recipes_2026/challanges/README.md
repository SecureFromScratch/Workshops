# Preparation

## Packages
1. Install the following nugets
Project 'Recipes.Api' has the following package references
   [net8.0]: 
   Top-level Package                                    Requested   Resolved
   > AWSSDK.SecretsManager                              4.0.4.3     4.0.4.3 
   > Microsoft.AspNetCore.Authentication.JwtBearer      8.*         8.0.23  
   > Microsoft.AspNetCore.OpenApi                       8.0.16      8.0.16  
   > Microsoft.EntityFrameworkCore                      8.*         8.0.23  
   > Microsoft.EntityFrameworkCore.SqlServer            8.*         8.0.23  
   > Microsoft.EntityFrameworkCore.Tools                8.*         8.0.23  
   > Swashbuckle.AspNetCore                             6.6.2       6.6.2   

Project 'Recipes.Bff' has the following package references
   [net8.0]: 
   Top-level Package        Requested   Resolved
   > Yarp.ReverseProxy      2.3.0       2.3.0   

2. Install the angular packages for this solution

4. Download Docker 
   - Go to: https://www.docker.com/products/docker-desktop
   - Click "Download for Windows"
   - Or direct link: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe
4. **Run the Installer:**
   - Double-click `Docker Desktop Installer.exe`
   - Follow the installation wizard
   - **Important:** Check "Use WSL 2 instead of Hyper-V" (recommended)
   - Click "Ok" to proceed

5. **Restart Your Computer:**
   - Docker Desktop will prompt you to restart

6. **Start Docker Desktop:**
   - Open Docker Desktop from the Start menu
   - Wait for Docker to start (you'll see a whale icon in the system tray)
   - You may be prompted to install WSL 2 Linux kernel update - follow the link and install it

7. **Verify Installation:**
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

---


