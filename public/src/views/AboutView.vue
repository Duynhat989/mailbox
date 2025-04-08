<template>
  <div>
    <!-- Upload hình ảnh -->
    <input type="file" @change="onFileChange" accept="image/*" />

    <!-- Khu vực hiển thị và chỉnh sửa hình ảnh -->
    <div v-if="imageBase64" style="margin-top: 20px;">
      <img ref="imageRef" :src="imageBase64" style="max-width: 100%;" />
    </div>

    <!-- Nút lấy ảnh sau khi cắt -->
    <button @click="getCroppedImage" style="margin-top: 20px;">Lấy ảnh đã cắt</button>

    <!-- Hiển thị ảnh đã cắt -->
    <div v-if="croppedImage" style="margin-top: 20px;">
      <h3>Ảnh đã cắt:</h3>
      <img :src="croppedImage" alt="Cropped Image" />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css"; // Import CSS của CropperJS

// State
const imageBase64 = ref(null); // Lưu trữ Base64 của ảnh tải lên
const croppedImage = ref(null); // Lưu trữ Base64 của ảnh đã cắt
const imageRef = ref(null); // Tham chiếu đến thẻ <img> để gắn CropperJS
let cropper = null; // Biến lưu instance của CropperJS

// Xử lý tải ảnh và khởi tạo CropperJS
const onFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    imageBase64.value = e.target.result;

    // Đợi DOM render xong rồi khởi tạo CropperJS
    await nextTick();
    if (cropper) cropper.destroy(); // Hủy instance cũ nếu có
    cropper = new Cropper(imageRef.value, {
      aspectRatio: NaN, // Không cố định tỉ lệ, cho phép tự do cắt
      viewMode: 1, // Hiển thị toàn bộ ảnh trong vùng hiển thị
      dragMode: "move", // Chế độ di chuyển hình
      scalable: true, // Cho phép phóng to/thu nhỏ
      zoomable: true, // Cho phép zoom
      rotatable: true, // Cho phép xoay hình
      cropBoxMovable: true, // Cho phép di chuyển khung cắt
      cropBoxResizable: true, // Cho phép thay đổi kích thước khung cắt
    });
  };
  reader.readAsDataURL(file);
};

// Xử lý lấy ảnh đã cắt
const getCroppedImage = () => {
  if (!cropper) return;

  // Lấy canvas từ vùng đã cắt
  const canvas = cropper.getCroppedCanvas();
  if (canvas) {
    croppedImage.value = canvas.toDataURL("image/png");
  }
};
</script>

<style>
/* Style tuỳ chỉnh nếu cần */
button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

button:hover {
  background-color: #45a049;
}
</style>
