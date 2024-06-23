from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

app = Flask(__name__)

@app.route('/add_recipe', methods=['POST'])
def add_recipe():
    # Check if a file is present in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    # Check if the file has an allowed extension (e.g., txt)
    allowed_extensions = {'txt'}
    if '.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions:
        # Process the file content (in this example, print the content)
        try:
            file_content = file.read().decode('utf-8')
            print(file_content)
            # Save the file content instead of printing it
            return jsonify({'message': 'The file was uploaded successfully'}), 200
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
