import os

from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'uploads'

app = Flask(__name__)

@app.route('/add_recipe', methods=['POST'])
def add_recipe():
    # Check if a file is present in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    try:
        file.save(os.path.join(UPLOAD_FOLDER, file.filename))
        return jsonify({'message': 'The file was uploaded successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

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
