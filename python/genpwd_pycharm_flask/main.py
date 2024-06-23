from flask import Flask, request, jsonify, abort
import logging

VALID_PWD_LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*-+=_'


def generate_password(length: int) -> str:
    # TODO: This function currently returns a placeholder password.
    # You will need replace this logic with actual password generation logic.
    # The valid password characters are defined by VALID_PWD_LETTERS

    result = 'a' * length

    return result


""" Flask webserver platform stuff starts here """

# Create flask platform
app = Flask(__name__)


# Begin routing definitions

#
# IMPORTANT: If you want to report an error use
# generate_http_exception to return a http error status
# (default is status code 422 - unprocessable content)
#

@app.route("/genpwd", methods=['GET'])
def genpwd_route():
    length = request.args.get('length', type=int)
    if length is None:
        generate_http_exception("Length parameter is required")
    if length == 13:
        generate_http_exception("That's unlucky!")

    password = generate_password(length)
    return jsonify(password=password)


def generate_http_exception(error_desc: str, status_code: int = 422):
    abort(status_code, description=error_desc)


# Start server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
