from flask import Flask, request, jsonify, abort
from bounded_int import BoundedInt
# IMPORTANT: always prefer the "secrets" module over the "random" module
import secrets as random  # Cryptographically secure random
import logging

VALID_PWD_LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*-+=_'
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 50


def generate_password(length: int) -> str:
    result = ''.join(
        random.choice(VALID_PWD_LETTERS) for _ in range(length)
    )

    return result


""" Flask webserver platform stuff starts here """


# Define type for password length. This type performs all validation checks when a new value is created.
# This type will be used by the routing method(s) below
class PasswordLength(BoundedInt):
    MIN_BOUND: int = MIN_PASSWORD_LENGTH
    MAX_BOUND: int = MAX_PASSWORD_LENGTH


# Create flask platform
app = Flask(__name__)


# Begin routing definitions

@app.route("/genpwd", methods=['GET'])
def genpwd_route():
    length = request.args.get('length', type=PasswordLength)
    if length is None:
        generate_http_exception("A valid length parameter is required")

    password = generate_password(length)
    return jsonify(password=password)


def generate_http_exception(error_desc: str, status_code: int = 422):
    abort(status_code, description=error_desc)


# Start server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
