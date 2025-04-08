<template>
    <transition name="fade">
      <div v-if="isVisible" class="popup-overlay" @click.self="closeOnOutsideClick && closePopup()">
        <div class="popup-container">
          <div class="popup-header">
            <div class="popup-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="popup-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h3>Yêu cầu đăng nhập</h3>
            </div>
            <button class="close-button" @click="closePopup">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="popup-content">
            <div class="popup-icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            
            <p class="popup-message">{{ message || 'Bạn cần đăng nhập để sử dụng tính năng này.' }}</p>
            <p class="popup-description">{{ description || 'Vui lòng đăng nhập hoặc đăng ký để tiếp tục trải nghiệm đầy đủ các tính năng của ứng dụng.' }}</p>
            
            <div class="popup-actions">
              <button class="btn-secondary" @click="closePopup">{{ cancelText || 'Hủy' }}</button>
              <button class="btn-primary" @click="login">{{ loginText || 'Đăng nhập' }}</button>
              <button v-if="showRegisterButton" class="btn-outline" @click="register">{{ registerText || 'Đăng ký' }}</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const props = defineProps({
    isVisible: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    featureName: {
      type: String,
      default: ''
    },
    loginText: {
      type: String,
      default: ''
    },
    cancelText: {
      type: String,
      default: ''
    },
    registerText: {
      type: String,
      default: ''
    },
    showRegisterButton: {
      type: Boolean,
      default: true
    },
    closeOnOutsideClick: {
      type: Boolean,
      default: true
    }
  });
  
  const emit = defineEmits(['close', 'login', 'register']);
  
  const closePopup = () => {
    emit('close');
  };
  
  const login = () => {
    emit('login');
    closePopup();
  };
  
  const register = () => {
    emit('register');
    closePopup();
  };
  </script>
  
  <style scoped>
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 16px;
  }
  
  .popup-container {
    background-color: var(--bg-color, white);
    border-radius: 8px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color, #eaeaea);
  }
  
  .popup-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .popup-title h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: var(--text-color, #333);
  }
  
  .popup-icon {
    color: var(--primary-color, #6366f1);
  }
  
  .popup-content {
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .popup-icon-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 96px;
    height: 96px;
    background-color: rgba(99, 102, 241, 0.1);
    border-radius: 50%;
    margin-bottom: 20px;
  }
  
  .feature-icon {
    color: var(--primary-color, #6366f1);
    stroke-width: 1.5;
  }
  
  .popup-message {
    font-size: 18px;
    font-weight: 600;
    text-align: center;
    margin: 0 0 8px 0;
    color: var(--text-color, #333);
  }
  
  .popup-description {
    font-size: 14px;
    text-align: center;
    margin: 0 0 24px 0;
    color: var(--text-muted, #666);
    line-height: 1.5;
  }
  
  .popup-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    width: 100%;
  }
  
  .close-button {
    background: none;
    border: none;
    color: var(--text-muted, #666);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .close-button:hover {
    color: var(--text-color, #333);
    background-color: var(--hover-bg, #f5f5f5);
  }
  
  .btn-primary {
    background-color: var(--primary-color, #6366f1);
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .btn-primary:hover {
    background-color: var(--primary-color-dark, #4f46e5);
  }
  
  .btn-secondary {
    background-color: var(--secondary-bg, #f5f5f5);
    color: var(--text-color, #333);
    border: none;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .btn-secondary:hover {
    background-color: var(--hover-bg, #e5e5e5);
  }
  
  .btn-outline {
    background-color: transparent;
    color: var(--primary-color, #6366f1);
    border: 1px solid var(--primary-color, #6366f1);
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .btn-outline:hover {
    background-color: rgba(99, 102, 241, 0.1);
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  @media (max-width: 768px) {
    .popup-container {
      max-width: 100%;
    }
    
    .popup-actions {
      flex-direction: column;
    }
    
    .popup-actions button {
      width: 100%;
    }
  }
  </style>