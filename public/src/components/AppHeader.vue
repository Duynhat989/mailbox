<template>
  <header class="header">
    <div class="user-info" v-if="user">
      <div v-if="isAdmin && activeAccount" class="active-account-info">
        <span class="active-account-label">Đang xem:</span>
        <span class="active-account-address">{{ activeAccount.address }}</span>
      </div>
      <div v-else class="user-email">
        <span v-if="domainInfo?.email">{{ domainInfo?.email }}</span>
        <span v-else><i class='bx bx-dots-horizontal-rounded bx-flashing bx-flip-horizontal'></i></span>
      </div>
      <div v-if="isAdmin" class="admin-badge">Admin</div>
    </div>
    <div class="user-info" v-else>
      <div class="user-email" v-if="domainInfo?.email">{{ domainInfo?.email }}</div>
      <span v-else><i class='bx bx-dots-horizontal-rounded bx-flashing bx-flip-horizontal'></i></span>
      <span @click="onGetEmail"><i style="font-size: 1.5em;" class='bx bx-refresh'></i></span>
    </div>
    <div class="header-actions">
      <button class="icon-button" title="Trợ giúp">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </button>

      <button class="icon-button" @click="$emit('toggle-theme')" title="Chuyển đổi chế độ tối/sáng">
        <svg v-if="darkMode" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>

      <button class="icon-button" title="Setup">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
          </path>
        </svg>
      </button>

      <button class="icon-button" @click="$emit('logout')" title="Đăng xuất" v-if="user">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import request from '@/utils/request';
import randomEnglishNameEmail from "../utils/rdName.js";
defineProps({
  user: {
    type: Object,
    default: null
  },
  darkMode: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  activeAccount: {
    type: Object,
    default: null
  }
});
const emit = defineEmits(['toggle-theme', 'logout', 'new-refresh']);

const domainInfo = ref({})

const getDomain = () => {
  return new Promise((resolve, reject) => {
    request.get('api/domains')
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  })
};
function generateRandomPassword(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}
const onGetEmail = async () => {
  // Logic to get email
  const password = generateRandomPassword(10); // 10 ký tự
  domainInfo.value = {}
  let domain = await getDomain();
  const user = randomEnglishNameEmail(domain.data);
  console.log(user.fullName); // John Smith
  console.log(user.email);    // john.smith@example.com //fullName, email, domainName
  console.log(password);    // john.smith@example.com //fullName, email, domainName
  request.post('api/mailboxes', {
    "domain_id": user.domainId,
    "username": user.email,
    "password": password,
    "quota": "1024"
  })
    .then(response => {
      // Handle the response
      domainInfo.value = response.data.data
      console.log(response.data);
      emit('new-refresh', domainInfo.value)
      localStorage.setItem('mail', JSON.stringify(domainInfo.value))
    })
    .catch(error => {
      // Handle the error
      console.error(error);
    });

};
onMounted(() => {
  // Logic to run on component mount
  domainInfo.value = JSON.parse(localStorage.getItem('mail')) || null
  console.log("dfsdf",domainInfo.value)
  if (!domainInfo.value) {
    onGetEmail();
  }else{
    emit('new-refresh', domainInfo.value)
  }
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-email {
  font-size: 14px;
  font-weight: 500;
}

.admin-badge {
  background-color: var(--primary-color);
  color: white;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
}

.active-account-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.active-account-label {
  font-size: 12px;
  color: var(--text-muted);
}

.active-account-address {
  font-size: 14px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.icon-button {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-button:hover {
  color: var(--text-color);
  background-color: var(--hover-bg);
}

@media (max-width: 768px) {
  .active-account-label {
    display: none;
  }

  .header {
    padding: 10px 15px;
  }

  .user-email,
  .active-account-address {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>