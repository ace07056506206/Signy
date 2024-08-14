import cv2
import io
import numpy as np
from flask import Flask, request, jsonify, render_template
from skimage.feature import hog
from sklearn.preprocessing import normalize

app = Flask(__name__)

def preprocess_image(image):
    # Resize image to a fixed size
    resized_image = cv2.resize(image, (100, 100))
    return resized_image

def extract_features(image):
    # Extract HOG features from the image
    features = hog(image, orientations=8, pixels_per_cell=(8, 8),
                   cells_per_block=(2, 2), transform_sqrt=True, block_norm="L2-Hys")
    return features

def verify_signatures(signature1, signature2):
    try:
        # Decode images
        img1 = cv2.imdecode(np.frombuffer(signature1.read(), np.uint8), cv2.IMREAD_GRAYSCALE)
        img2 = cv2.imdecode(np.frombuffer(signature2.read(), np.uint8), cv2.IMREAD_GRAYSCALE)

        # Check if images are decoded successfully
        if img1 is None or img2 is None:
            raise ValueError("Failed to decode one or both images")

        # Preprocess images
        img1 = preprocess_image(img1)
        img2 = preprocess_image(img2)

        # Extract features from the images
        features1 = extract_features(img1)
        features2 = extract_features(img2)

        # Normalize feature vectors
        features1_norm = normalize(features1.reshape(1, -1))
        features2_norm = normalize(features2.reshape(1, -1))

        # Compute cosine similarity
        similarity_score = np.dot(features1_norm, features2_norm.T)[0, 0]

        # Convert similarity score to percentage
        similarity_percentage = similarity_score * 100

        return similarity_percentage
    except Exception as e:
        print("Error:", e)
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/verify_signatures', methods=['POST'])
def handle_verification_request():
    try:
        # Get signature images from the request
        signature1 = request.files['signature1']
        signature2 = request.files['signature2']

        # Process signature images using the model
        similarity_score = verify_signatures(signature1, signature2)

        if similarity_score is not None:
            # Return similarity score as JSON response
            return jsonify({'similarity_score': similarity_score})
        else:
            return jsonify({'error': 'Failed to verify signatures'}), 500
    except Exception as e:
        print("Error:", e)
        return jsonify({'error': 'An unexpected error occurred'}), 500

if __name__ == '__main__':
    app.run(debug=True)
