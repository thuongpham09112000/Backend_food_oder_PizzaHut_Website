function updatePreviewImage(inputFile, previewClass, oldImageClass = null) {
  const file = inputFile.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const form = inputFile.closest("form");
      if (!form) return;
      const previewImage = form.querySelector(`.${previewClass}`);
      if (previewImage) {
        previewImage.src = e.target.result;
        previewImage.style.display = "block";
      }

      if (oldImageClass) {
        const oldImage = form.querySelector(`.${oldImageClass}`);
        if (oldImage) {
          oldImage.style.display = "none";
        }
      }
    };
    reader.readAsDataURL(file);
  }
}

function handleImagePreview(inputId, previewClass, oldImageClass = null) {
  const inputFile = document.getElementById(inputId);
  if (inputFile) {
    inputFile.addEventListener("change", function () {
      updatePreviewImage(inputFile, previewClass, oldImageClass);
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  handleImagePreview("productImage", "previewImage", "oldImage");
  handleImagePreview("categoryImage", "previewImage", "oldImage");
});
