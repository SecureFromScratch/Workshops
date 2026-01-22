## Usefull & easy to run

### Sql terminal
```bash
docker exec -it recipes-sqlserver /opt/mssql-tools18/bin/sqlcmd   -S localhost   -U your user   -P yourpassword -C
    
```
## SQL commands
```SQL
USE Recipes;
GO
SELECT * FROM Users;
GO
```
### Add openapi api secret
aws --endpoint-url=http://localhost:4566 secretsmanager create-secret \
  --name recipes/dev/openai \
  --secret-string "sk-proj-..."

### Get the secret value
aws --endpoint-url=http://localhost:4566 secretsmanager get-secret-value \
  --secret-id recipes/dev/openai


 ### Install sqlcmd on your linux host machine
curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
curl https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/prod.list | sudo tee /etc/apt/sources.list.d/mssql-release.list
sudo apt-get update
sudo apt-get install -y mssql-tools18 unixodbc-dev

