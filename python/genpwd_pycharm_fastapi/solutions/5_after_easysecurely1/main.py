from fastapi import FastAPI, HTTPException
import uvicorn
import secrets as random # <---- Cryptographically secure random
import logging

VALID_LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*-+=_'
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 50

app = FastAPI()


def generate_password(length: int) -> str:
	result = ''.join(
		random.choice(VALID_LETTERS) for _ in range(0, length)
	)

	return result


@app.get("/genpwd")
async def genpwd_route(length: int):
	if length <= 0:
		generate_http_exception("Password length must be positive")
	if length < MIN_PASSWORD_LENGTH:
		generate_http_exception(f"Password length must at least {MIN_PASSWORD_LENGTH}")
	if length > MAX_PASSWORD_LENGTH:
		generate_http_exception("Password too long")
	
	password = generate_password(length)
	return { "password": password }


def generate_http_exception(error_desc: str, status_code: int = 422):
	raise HTTPException(status_code=status_code, detail=error_desc)


if __name__ == "__main__":
	uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
