import mimetypes
import uuid

import magic

from flask import Flask, request, jsonify
import os
from werkzeug.utils import redirect, secure_filename

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt'}
ALLOWED_MIME_TYPES = {'text/plain', 'ASCII text'}

def generate_random_filename(extension=''):
    random_filename = str(uuid.uuid4())
    if extension:
        random_filename += '.' + extension
    return random_filename

@app.route('/add_recipe', methods=['POST'])
def add_recipe():
    # Check if a file is present in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    # Check if the file has an allowed extension (e.g., txt)
    extension = file.filename.rsplit('.', 1)[1].lower()
    if '.' in file.filename and extension in ALLOWED_EXTENSIONS:
        # Process the file content (in this example, print the content)
        try:
            # Check the MIME type using mimetypes.guess_type
            mime = magic.Magic()
            mime_type = mime.from_buffer(file.read(1024))  # Read only the first 1024 bytes for efficiency

            if mime_type is None:
                return 'Could not determine MIME type'

            if mime_type is None:
                return jsonify({'error': f'Error processing file: {file.filename}'}), 500

            # You can compare the MIME type against an expected type
            if mime_type in ALLOWED_MIME_TYPES:
                filename = generate_random_filename() + extension
                file.save(os.path.join(UPLOAD_FOLDER, filename))
                return jsonify({'message': 'The file was uploaded successfully'}), 200
            else:
                return jsonify({'error': f'Error processing file: {filename}'}), 500
        except Exception as e:
            return jsonify({'error': f'Error processing file: {str(e)}'}), 500
    else:
        return jsonify({'error': 'Invalid file format'}), 400
@app.route('/get_recipe', methods=['GET'])
def get_recipe():
    try:
        recipe_file_name = secure_filename(request.args.get('recipe_file_name'))
        with open('uploads/' + recipe_file_name) as f:
            lines = f.readlines()

        return jsonify({'lines': lines}), 200
    except Exception as e:
        return jsonify({'error': f'Error reading file: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
