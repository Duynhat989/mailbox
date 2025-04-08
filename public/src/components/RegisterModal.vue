<template>
  <div class="modal">
    <div class="modal-content">
      <button @click="$emit('close')" class="modal-close">&times;</button>
      <h2>Create Account</h2>
      
      <form @submit.prevent="$emit('register')">
        <div class="form-group">
          <label for="register-email">Email</label>
          <div class="email-input-group">
            <input type="text" id="register-username" v-model="registerForm.username" required />
            <span>@</span>
            <select v-model="registerForm.domain">
              <option v-for="domain in availableDomains" :key="domain.id" :value="domain.domain">
                {{ domain.domain }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="register-password">Password</label>
          <input type="password" id="register-password" v-model="registerForm.password" required />
        </div>
        <button type="submit" class="btn-submit">Create Account</button>
      </form>
      
      <div class="form-footer">
        Already have an account? 
        <a href="#" @click.prevent="$emit('show-login')">Login</a>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  registerForm: {
    type: Object,
    required: true
  },
  availableDomains: {
    type: Array,
    default: () => []
  }
});

defineEmits(['close', 'register', 'show-login']);
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
  color: var(--text-muted);
  cursor: pointer;
}

.modal-content h2 {
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--input-border);
  background-color: var(--input-bg);
  color: var(--text-color);
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.email-input-group {
  display: flex;
  align-items: center;
}

.email-input-group input {
  flex: 1;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.email-input-group span {
  padding: 10px 5px;
  background-color: var(--button-bg);
  border-top: 1px solid var(--input-border);
  border-bottom: 1px solid var(--input-border);
  color: var(--text-muted);
}

.email-input-group select {
  width: auto;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-submit:hover {
  background-color: var(--primary-hover);
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: var(--text-muted);
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
</style>