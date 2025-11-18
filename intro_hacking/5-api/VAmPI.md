# Playing with VAmPI


## Installation

``` bash 
git clone https://github.com/erev0s/VAmPI.git
cd VAmPI
docker build -t vampi .
docker run -p 5000:5000 vampi
```

## Testing
Run:

```bash
curl http://localhost:5000
```
Expected Result:

```bash
{
  "message": "VAmPI is running"
}

```

