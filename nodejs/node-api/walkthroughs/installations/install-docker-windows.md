On Windows you have two main ways to run Docker commands:

### 1. Install **Docker Desktop for Windows** (recommended)

* Download from: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).
* During installation, enable **WSL 2 backend**.
* After install, open **PowerShell** or **Command Prompt** and run:

  ```powershell
  docker --version
  docker run hello-world
  ```

  This confirms the CLI is available.

### 2. Use **Docker CLI only** with WSL2

* Install **WSL2** and a Linux distro (e.g., Ubuntu).
* Install Docker inside that Linux environment.
* You can then use Docker commands directly from your Linux shell inside Windows.

👉 Best practice: go with **Docker Desktop** unless you want a lighter setup. It gives you both GUI + CLI (`docker` command works in PowerShell, CMD, or Git Bash).


