<template>
    <div class="modal">
      <div class="modal-content">
        <button @click="$emit('close')" class="modal-close">&times;</button>
        <h2>Tạo tài khoản Email mới</h2>
        
        <form @submit.prevent="createAccount">
          <div class="form-group">
            <label for="new-username">Tên người dùng</label>
            <input 
              type="text" 
              id="new-username" 
              v-model="formData.username" 
              required 
              placeholder="Nhập tên người dùng"
            />
          </div>
          
          <div class="form-group">
            <label for="new-domain">Tên miền</label>
            <select id="new-domain" v-model="formData.domain" required>
              <option v-for="domain in availableDomains" :key="domain.id" :value="domain.domain">
                {{ domain.domain }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="new-password">Mật khẩu</label>
            <div class="password-input">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="new-password" 
                v-model="formData.password" 
                required 
                placeholder="Nhập mật khẩu"
              />
              <button 
                type="button" 
                class="toggle-password" 
                @click="showPassword = !showPassword"
              >
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="formData.generatePassword" />
              Tạo mật khẩu ngẫu nhiên
            </label>
          </div>
          
          <div class="form-preview">
            <div class="preview-label">Email sẽ được tạo:</div>
            <div class="preview-value">{{ previewEmail }}</div>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="$emit('close')" class="btn-cancel">Hủy</button>
            <button type="submit" class="btn-submit">Tạo tài khoản</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  
  const props = defineProps({
    availableDomains: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['close', 'create']);
  
  const showPassword = ref(false);
  const formData = ref({
    username: '',
    domain: props.availableDomains.length > 0 ? props.availableDomains[0].domain : '',
    password: '',
    generatePassword: false
  });
  
  // Generate a random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };
  
  // Watch for changes to generatePassword
  watch(() => formData.value.generatePassword, (newValue) => {
    if (newValue) {
      formData.value.password = generateRandomPassword();
    } else {
      formData.value.password = '';
    }
  });
  
  // Computed email preview
  const previewEmail = computed(() => {
    if (!formData.value.username || !formData.value.domain) {
      return 'username@domain.com';
    }
    return `${formData.value.username}@${formData.value.domain}`;
  });
  
  // Create account
  const createAccount = () => {
    // If generatePassword is checked but password is empty, generate one
    if (formData.value.generatePassword && !formData.value.password) {
      formData.value.password = generateRandomPassword();
    }
    
    // Emit the create event with the form data
    emit('create', { ...formData.value });
  };
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
    background-color: var(--modal-bg);
    border-radius: 8px;
    width: 100%;
    max-width: 450px;
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
    color: var(--text-muted);
    cursor: pointer;
  }
  
  .modal-content h2 {
    margin-bottom: 24px;
    text-align: center;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .form-group input[type="text"],
  .form-group input[type="password"],
  .form-group select {
    width: 100%;
    padding: 10px 12px;
    border-radius: 4px;
    border: 1px solid var(--input-border);
    background-color: var(--input-bg);
    color: var(--text-color);
    font-size: 14px;
  }
  
  .form-group input[type="checkbox"] {
    margin-right: 8px;
  }
  
  .password-input {
    position: relative;
  }
  
  .toggle-password {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
  }
  
  .form-preview {
    background-color: var(--bg-color);
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 24px;
  }
  
  .preview-label {
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 4px;
  }
  
  .preview-value {
    font-weight: 500;
    word-break: break-all;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  
  .btn-cancel {
    background-color: var(--button-bg);
    color: var(--text-color);
    border: none;
    border-radius: 4px;
    padding: 10px 16px;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }
  
  .btn-cancel:hover {
    background-color: var(--hover-bg);
  }
  
  .btn-submit {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 16px;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }
  
  .btn-submit:hover {
    background-color: var(--primary-hover);
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  </style>