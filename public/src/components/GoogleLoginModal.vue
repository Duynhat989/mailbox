<template>
  <div class="modal">
    <div class="modal-content">
      <button @click="$emit('close')" class="modal-close">&times;</button>
      <h2>Đăng nhập</h2>
      
      <div class="login-container">
        <div class="login-message">
          <p>Đăng nhập để sử dụng đầy đủ các tính năng</p>
        </div>
        
        <button class="btn-gmail" @click="$emit('google-login')">
          <img src="@/assets/images/gmail-icon.jpg" alt="Gmail" class="gmail-icon" />
          <span>Đăng nhập với Google</span>
        </button>
        
        <div class="login-terms">
          Bằng cách đăng nhập, bạn đồng ý với <a href="#" @click.prevent>Điều khoản sử dụng</a> và <a href="#" @click.prevent>Chính sách bảo mật</a> của chúng tôi.
        </div>
      </div>
      
      <div class="form-footer">
        Chưa có tài khoản? 
        <a href="#" @click.prevent="$emit('show-register')">Đăng ký</a>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close', 'google-login', 'show-register']);
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background-color: var(--modal-bg, #ffffff);
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  padding: 30px;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-muted, #6b7280);
  cursor: pointer;
}

.modal-content h2 {
  margin-bottom: 20px;
  text-align: center;
  color: var(--text-color, #111827);
  font-weight: 600;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-bottom: 30px;
}

.login-message {
  text-align: center;
  color: var(--text-muted, #6b7280);
  font-size: 15px;
  line-height: 1.5;
}

.btn-gmail {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color: #ffffff;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 18px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.btn-gmail:hover {
  background-color: #f9fafb;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
  border-color: #d1d5db;
}

.btn-gmail:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.gmail-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  transition: transform 0.3s ease;
}

.btn-gmail:hover .gmail-icon {
  transform: scale(1.1);
}

.login-terms {
  font-size: 12px;
  color: var(--text-muted, #6b7280);
  text-align: center;
  line-height: 1.5;
  max-width: 320px;
}

.login-terms a {
  color: var(--primary-color, #4f46e5);
  text-decoration: none;
}

.login-terms a:hover {
  text-decoration: underline;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: var(--text-muted, #6b7280);
  border-top: 1px solid var(--border-color, #f3f4f6);
  padding-top: 20px;
}

.form-footer a {
  color: var(--primary-color, #4f46e5);
  font-weight: 500;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: 90%;
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 20px;
  }
  
  .btn-gmail {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
}
</style>