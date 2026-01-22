### Clone the repository with blob filtering (no initial checkout)
git clone --no-checkout --filter=blob:none https://github.com/SecureFromScratch/Workshops.git

### Enter the cloned repository directory
cd Workshops

### Initialize sparse checkout in cone mode
git sparse-checkout init --cone

### Set sparse checkout to only include the Recipes directory
git sparse-checkout set csharp/recipes_2026/challanges/Recipes

### Checkout the main branch
git checkout main
