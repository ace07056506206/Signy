document.getElementById('verifyButton').addEventListener('click', async () => {
    const canvas1 = document.getElementById('signatureCanvas1');
    const canvas2 = document.getElementById('signatureCanvas2');

    const signature1Blob = await new Promise(resolve => canvas1.toBlob(resolve, 'image/jpeg'));
    const signature2Blob = await new Promise(resolve => canvas2.toBlob(resolve, 'image/jpeg'));

    const formData = new FormData();
    formData.append('signature1', signature1Blob, 'signature1.jpg'); // Assign a filename
    formData.append('signature2', signature2Blob, 'signature2.jpg'); // Assign a filename

    try {
        const response = await fetch('/verify_signatures', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            showMessage(`Similarity Score: ${result.similarity_score}`);
        } else {
            showMessage('Error: Unable to verify signatures');
        }
    } catch (error) {
        showMessage('Error: Network error');
    }
});

function showMessage(message) {
    const popupMessage = document.getElementById("popupMessage");
    popupMessage.textContent = message;
    document.getElementById("popup").style.display = "block";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

document.getElementById('signatureInput1').addEventListener('change', function() {
    const canvas1 = document.getElementById('signatureCanvas1');
    const ctx1 = canvas1.getContext('2d');
    const file = this.files[0];

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            canvas1.width = 400; // Set canvas width to 400px
            canvas1.height = 400 * (img.height / img.width); // Maintain aspect ratio
            ctx1.drawImage(img, 0, 0, canvas1.width, canvas1.height);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
});

document.getElementById('signatureInput2').addEventListener('change', function() {
    const canvas2 = document.getElementById('signatureCanvas2');
    const ctx2 = canvas2.getContext('2d');
    const file = this.files[0];

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            canvas2.width = 400; // Set canvas width to 400px
            canvas2.height = 400 * (img.height / img.width); // Maintain aspect ratio
            ctx2.drawImage(img, 0, 0, canvas2.width, canvas2.height);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
});
