<template>
  <div class="empty-state">
    <div class="empty-state-content">
      <div class="empty-state-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="M22 7l-10 5-10-5"></path>
        </svg>
      </div>
      <h2>Temp Mail</h2>
      <p class="empty-state-description">
        Protect your personal email address from spam, bots, phishing, and other
        online abuse with our free temporary disposable anonymous email service. No
        commitments, no risks—just secure, instant access to a temp email address.
      </p>
      
      <div class="feature-cards">
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h3>Secure Temporary Email</h3>
          <p>
            Your temporary email address is protected by a reliable
            password, generated randomly in your browser, providing a
            barrier against unauthorized access and potential breaches.
          </p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h3>Instant Disposable Email</h3>
          <p>
            No more wasting precious time on registrations, form-filling, or
            solving captchas. Your temp email address is ready for use
            instantly, putting you in control effortlessly.
          </p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
          </div>
          <h3>Fast and Anonymous Email Service</h3>
          <p>
            Experience fast message delivery without delays or
            restrictions. Our service is finely tuned for maximum delivery
            speed, ensuring you stay connected seamlessly.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['show-login', 'show-register']);
</script>

<style scoped>
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}

.empty-state-content {
  max-width: 800px;
  text-align: center;
  padding: 40px 20px;
  animation: fadeIn 0.3s ease;
}

.empty-state-icon {
  margin-bottom: 20px;
  color: var(--primary-color);
}

.empty-state h2 {
  font-size: 24px;
  margin-bottom: 15px;
}

.empty-state-description {
  color: var(--text-muted);
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Feature Cards */
.feature-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.feature-card {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
  flex: 1;
  min-width: 250px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: left;
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  color: var(--primary-color);
  margin-bottom: 15px;
}

.feature-card h3 {
  margin-bottom: 10px;
  font-size: 16px;
}

.feature-card p {
  color: var(--text-muted);
  font-size: 14px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.btn-login, .btn-register {
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-login {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.btn-login:hover {
  background-color: var(--primary-hover);
}

.btn-register {
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.btn-register:hover {
  background-color: var(--hover-bg);
}

@media (max-width: 768px) {
  .feature-cards {
    flex-direction: column;
  }
  
  .feature-card {
    min-width: 100%;
  }
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