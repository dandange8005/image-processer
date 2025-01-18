const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewContainer = document.getElementById('imagePreviewContainer'); // New
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const resizeButton = document.getElementById('resizeButton');
const downloadLink = document.getElementById('downloadLink');
const qualityInput = document.getElementById('qualityInput');
const outputFormat = document.getElementById('outputFormat');
const aspectRatioSelect = document.getElementById('aspectRatio');

let cropper; // Cropper instance
let originalImage;

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        imagePreview.src = event.target.result;

        if (cropper) {
            cropper.destroy(); // Destroy existing cropper
        }
        imagePreview.onload = () => {
            originalImage = imagePreview;
            cropper = new Cropper(imagePreview, {
                aspectRatio: NaN, // Start with no aspect ratio
                viewMode: 1,
                autoCropArea: 1,
                zoomable: false,
                movable: false,
                scalable: false,
                cropBoxMovable: false,
                cropBoxResizable: false,
            });
            widthInput.value = imagePreview.naturalWidth;
            heightInput.value = imagePreview.naturalHeight;
        };
    };
    reader.readAsDataURL(file);
});

function calculateHeight(width, ratio) {
    const ratios = ratio.split(':');
    return (width / parseInt(ratios[0])) * parseInt(ratios[1]);
}

widthInput.addEventListener('input', () => {
    const selectedRatio = aspectRatioSelect.value;
    if (selectedRatio !== 'custom' && cropper) {
        heightInput.value = Math.round(calculateHeight(widthInput.value, selectedRatio));
        cropper.setAspectRatio(eval(selectedRatio.replace(':', '/')));
    }
});

aspectRatioSelect.addEventListener('change', () => {
    if (aspectRatioSelect.value !== 'custom' && cropper) {
        heightInput.value = Math.round(calculateHeight(widthInput.value, aspectRatioSelect.value));
        cropper.setAspectRatio(eval(aspectRatioSelect.value.replace(':', '/')));
    } else if (cropper) {
      cropper.setAspectRatio(NaN)
    }
});

resizeButton.addEventListener('click', () => {
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
        width: widthInput.value,
        height: heightInput.value,
    });

    const quality = parseInt(qualityInput.value) / 100;
    const format = outputFormat.value;

    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = `cropped_image.${format}`;
        downloadLink.style.display = 'block';
        downloadLink.click();
        URL.revokeObjectURL(url);
    }, `image/${format}`, quality);
});