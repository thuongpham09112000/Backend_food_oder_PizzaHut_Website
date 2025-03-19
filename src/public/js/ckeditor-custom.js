document.addEventListener("DOMContentLoaded", function () {
  ClassicEditor.create(document.querySelector("#editor"), {
    language: "vi",
    placeholder: "Nhập mô tả...",
    toolbar: [
      "heading",
      "|",
      "bold",
      "italic",
      "link",
      "bulletedList",
      "numberedList",
      "|",
      "undo",
      "redo",
      "|",
      "blockQuote",
      "insertTable",
      "mediaEmbed",
    ],
    removePlugins: ["PasteFromOffice"],
  })
    .then((editor) => {
      console.log("CKEditor đã khởi tạo thành công!");
    })
    .catch((error) => console.error("Lỗi CKEditor:", error));
});
