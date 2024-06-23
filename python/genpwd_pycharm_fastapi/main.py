from fastapi import FastAPI, HTTPException
import uvicorn
import logging

VALID_LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*-+=_'

app = FastAPI()


def generate_password(length: int) -> str:
	# TODO: This function currently returns a placeholder password.
	# You will need replace this logic with actual password generation logic.
	# The valid password characters are defined by VALID_LETTERS

	result = 'a' * length

	return result


#
# IMPORTANT: If you want to report an error use
# generate_http_exception to raise an HTTP exception
# (default is status code 422 - unprocessable content)
#
@app.get("/genpwd")
async def genpwd_route(length: int):
	if length == 13:
		generate_http_exception("That's unlucky!")

	password = generate_password(length)
	return { "password": password }


def generate_http_exception(error_desc: str, status_code: int = 422):
	raise HTTPException(status_code=status_code, detail=error_desc)


if __name__ == "__main__":
	uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
