git clone --no-checkout --filter=blob:none https://github.com/SecureFromScratch/Workshops.git 

cd csharp/recipes_2026/challanges

git sparse-checkout init --cone

git sparse-checkout set Recipes

git checkout main