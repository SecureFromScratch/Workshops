## Installation 
Please follow the instructions below to install the lab.
Detailed explanations are linked to each step.
### 1. Install .net8

### 2. Nodejs

### 3. Install git
https://github.com/git-for-windows/git/releases/download/v2.52.0.windows.1/Git-2.52.0-64-bit.exe

### 4. Clone
Clone the challanges folder using [spars checkout](preps/1_spars_checkout.md)


### 5. Visual Studio Code (not Visual Studio)
Open the folder `challenges/Recipes` in VS Code (the one that contains the `.sln` file).

### 6. Packages
Install [API, BFF Client packages](preps/2_packages.md) 

### 7. Docker
Install [docker & docker compose](preps/3_docker.md) 

### 8. Secret manager
Follow the secret manager walkthrough: [Secret Manager](preps/4_secret_manager.md)

### 9. Run the server side 
1. Make sure the vscode root is Recipes with the Recipes.sln
2. Go to Run & Debug (ctrl+shift+d)
3. Chose API + BFF and click run
4. After the serice is up open [swagger](http://localhost:7000/swagger/index.html)

### 10. Run the client 
1. Go to src/recipes-ui folder
2. run
```bash
ng s
```
---


