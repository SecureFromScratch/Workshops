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

- Go to swagger interface and try to call the api methods

  http://localhost:5000/ui/

- Use the API to create the database
- Register to the API
- Login
- Explore the API
## Postman

- Go to http://localhost:5000/openapi.json and save the file to your machine
- Open Postman
- Click the Import button to import the openapi.json file
- Explore the API

