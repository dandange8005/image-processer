const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const resizeButton = document.getElementById('resizeButton');
const downloadLink = document.getElementById('downloadLink');
const qualityInput = document.getElementById('qualityInput');
const outputFormat = document.getElementById('outputFormat');
const aspectRatioSelect = document.getElementById('aspectRatio');

let originalImage;

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target.result;
        img.onload = () => {
          originalImage = img;
          imagePreview.innerHTML = '';
          imagePreview.appendChild(img);
          widthInput.value = img.width;
          heightInput.value = img.height;
        }
    };
    reader.readAsDataURL(file);
});

// Function to calculate height based on width and aspect ratio
function calculateHeight(width, ratio) {
    const ratios = ratio.split(':');
    return (width / parseInt(ratios[0])) * parseInt(ratios[1]);
}

widthInput.addEventListener('input', () => {
    const selectedRatio = aspectRatioSelect.value;
    if (selectedRatio !== 'custom') { // Only auto-calculate if not 'custom'
        heightInput.value = Math.round(calculateHeight(widthInput.value, selectedRatio));
    }
});

aspectRatioSelect.addEventListener('change', () => {
    if (aspectRatioSelect.value !== 'custom') {
        heightInput.value = Math.round(calculateHeight(widthInput.value, aspectRatioSelect.value));
    }
});

resizeButton.addEventListener('click', () => {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    let width = parseInt(widthInput.value);
    let height = parseInt(heightInput.value);

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(originalImage, 0, 0, width, height);

    const quality = parseInt(qualityInput.value) / 100;
    const format = outputFormat.value;

    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = `resized_image.${format}`;
        downloadLink.style.display = 'block';
        downloadLink.click();
        URL.revokeObjectURL(url);
    }, `image/${format}`, quality);
});