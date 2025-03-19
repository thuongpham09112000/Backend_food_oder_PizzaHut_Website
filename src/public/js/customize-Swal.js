document.addEventListener("DOMContentLoaded", function () {
  if (flashMessages.success.length > 0) {
    Swal.fire({
      icon: "success",
      title: flashMessages.success,
      showConfirmButton: false,
      timer: 2000,
    });
  }

  if (flashMessages.error.length > 0) {
    Swal.fire({
      icon: "error",
      title: flashMessages.error,
      showConfirmButton: true,
    });
  }

  if (flashMessages.info.length > 0) {
    Swal.fire({
      icon: "info",
      title: flashMessages.info,
      showConfirmButton: false,
      timer: 2500,
    });
  }

  document
    .getElementById("logout-link")
    ?.addEventListener("click", function (event) {
      event.preventDefault();

      Swal.fire({
        title: "Bạn có chắc chắn muốn đăng xuất?",
        text: "Hành động này sẽ đưa bạn ra khỏi hệ thống!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Đăng xuất",
        cancelButtonText: "Hủy bỏ",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/admin/logout";
        }
      });
    });
});
