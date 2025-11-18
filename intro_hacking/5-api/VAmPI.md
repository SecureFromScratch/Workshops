# Playing with VAmPI


## Installation

``` bash 
git clone https://github.com/erev0s/VAmPI.git
cd VAmPI
docker build -t vampi .
docker run -p 5000:5000 vampi
```

## Testing
### Run

```bash
curl http://localhost:5000
```
### Expected Result

```bash
{
  "message": "VAmPI is running"
}

```
### Swagger

Go to swagger interface and try to call the api methods

http://localhost:5000/ui/

## Postman

- Click the Import button and paste the json file below
- Try to call the api methods 

```bash
{
  "info": {
    "name": "VAmPI - OWASP API Security Lab",
    "_postman_id": "5b82df2f-63b4-4ce0-9c89-e12ad9c61f15",
    "description": "Ready-to-use Postman collection for VAmPI (http://localhost:5000). Covers login, users, posts, transfers, and admin endpoints for OWASP API Top 10 labs.",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"user1\",\n  \"password\": \"user1\"\n}"
            },
            "url": {
              "raw": "http://localhost:5000/login",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["login"]
            }
          }
        }
      ]
    },
    {
      "name": "Users",
      "item": [
        {
          "name": "Get User 1",
          "request": { "method": "GET", "url": "http://localhost:5000/users/1" }
        },
        {
          "name": "Get User 2 (IDOR test)",
          "request": { "method": "GET", "url": "http://localhost:5000/users/2" }
        },
        {
          "name": "Edit User 1 (Mass Assignment)",
          "request": {
            "method": "PATCH",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"hack@example.com\",\n  \"isAdmin\": true\n}"
            },
            "url": "http://localhost:5000/users/1"
          }
        },
        {
          "name": "List All Users (Excessive Data Exposure)",
          "request": { "method": "GET", "url": "http://localhost:5000/users" }
        }
      ]
    },
    {
      "name": "Posts",
      "item": [
        {
          "name": "List Posts",
          "request": { "method": "GET", "url": "http://localhost:5000/posts" }
        },
        {
          "name": "Create Post",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"test post\",\n  \"content\": \"hello world\"\n}"
            },
            "url": "http://localhost:5000/posts"
          }
        }
      ]
    },
    {
      "name": "Transfers",
      "item": [
        {
          "name": "List Transfers",
          "request": { "method": "GET", "url": "http://localhost:5000/transfers" }
        },
        {
          "name": "Transfer Money (BOLA test)",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"from\": 1,\n  \"to\": 2,\n  \"amount\": 500\n}"
            },
            "url": "http://localhost:5000/transfers"
          }
        }
      ]
    },
    {
      "name": "Admin",
      "item": [
        {
          "name": "Admin Logs (Broken Function-Level Auth)",
          "request": {
            "method": "GET",
            "url": "http://localhost:5000/admin/logs"
          }
        }
      ]
    }
  ]
}


```




