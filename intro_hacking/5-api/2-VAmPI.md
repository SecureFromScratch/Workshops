# Playing with VAmPI


## Step 1 - Installation

``` bash 
docker run -p 5000:5000 erev0s/vampi:latest
```

## Step 2 - Testing
### A. Basic Run

```bash
curl http://localhost:5000
```
Expected Result

```bash
{
  "message": "VAmPI is running"
}

```
### B. Swagger

- Go to swagger interface and try to call the api methods

  http://localhost:5000/ui/

- Use the API to create the database
- Register to the API
- Login
- Pay attention, for other requests you need to supplly the JWT you got from the log in process
- Explore the API
### C. Postman

- Go to http://localhost:5000/openapi.json and save the file to your machine
- Open Postman
- Click the Import button to import the openapi.json file
- Explore the API

## Burp And Postman
- Go to Postman settings
- Set Burp as a custom proxy

##  VAmPI Exploitation

- Find an endpoint the reveals a very sensitive information
- Find a way to decide if users exist in the system or not
  









