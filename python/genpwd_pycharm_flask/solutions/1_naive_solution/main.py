from flask import Flask, request, jsonify, abort
import random
import logging

VALID_PWD_LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*-+=_'


def generate_password(length: int) -> str:
    result = ''.join(
        random.choice(VALID_PWD_LETTERS) for _ in range(length)
    )

    return result


""" Flask webserver platform stuff starts here """

# Create flask platform
app = Flask(__name__)


# Begin routing definitions
@app.route("/genpwd", methods=['GET'])
def genpwd_route():
    length = request.args.get('length', type=int)
    if length is None:
        generate_http_exception("Length parameter is required")

    password = generate_password(length)
    return jsonify(password=password)


def generate_http_exception(error_desc: str, status_code: int = 422):
    abort(status_code, description=error_desc)


# Start server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

