<template>
  <div class="mail-app" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <div class="app-container">
      <LanguageSelectorPopup :isVisible="showLanguageSelector" @close="hideLanguageSelector"
        @language-changed="onLanguageChanged" />
      <!-- Sidebar Component -->
      <AppSidebar :is-collapsed="isSidebarCollapsed" :current-folder="currentFolder" :is-admin="isAdmin"
        :managed-accounts="managedAccounts" :active-account="activeAccount" @toggle-sidebar="toggleSidebar"
        @change-folder="changeFolder" @refresh-emails="refreshEmails" @switch-account="switchAccount"
        @reset-language="showLanguageSelector = true" @login-account="showLoginModal = true"
        @create-new-account="showCreateAccountModal = true" />

      <!-- Main Content -->
      <div class="main-content">
        <!-- Header Component -->
        <AppHeader :user="user" :dark-mode="darkMode" :is-admin="isAdmin" :active-account="activeAccount"
          @toggle-theme="toggleTheme" @logout="logout" @new-refresh="newRefresh" />

        <!-- Email Container -->
        <div class="email-container">
          <AdminDashboard v-if="isAdmin && !activeAccount && !selectedEmail" :managed-accounts="managedAccounts"
            @create-account="showCreateAccountModal = true" @view-account="switchAccount"
            @delete-account="deleteAccount" />

          <EmailList v-else-if="emails.length > 0 && !selectedEmail" :emails="filteredEmails"
            @select-email="selectEmail" />

          <EmailView v-else-if="selectedEmail" :email="selectedEmail" @back="selectedEmail = null" @delete="deleteEmail"
            @reply="replyToEmail" />

          <WelcomeScreen v-else @show-login="showLoginModal = true" @show-register="showRegisterModal = true" />
        </div>
        <!-- Welcome Screen (When Not Logged In) -->
        <WelcomeScreen v-if="!user && emails.length == 0" @show-login="showLoginModal = true"
          @show-register="showRegisterModal = true" />
      </div>
    </div>

    <!-- Auth Modals -->
    <GoogleLoginModal v-if="showLoginModal" @close="showLoginModal = false" @google-login="handleGoogleLogin"
      @show-register="showRegisterModal = true" />

    <CreateAccountModal v-if="showRegisterModal" :available-domains="availableDomains" :register-form="registerForm"
      @close="showRegisterModal = false" @register="register" @show-login="showLoginModal = true" />



  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { googleTokenLogin } from 'vue3-google-login';
import request from '@/utils/request';

// Component imports
import AppSidebar from './components/AppSidebar.vue';
import AppHeader from './components/AppHeader.vue';
import EmailList from './components/EmailList.vue';
import EmailView from './components/EmailView.vue';
import WelcomeScreen from './components/WelcomeScreen.vue';
import GoogleLoginModal from './components/GoogleLoginModal.vue';
import AdminDashboard from './components/AdminDashboard.vue';
import CreateAccountModal from './components/CreateAccountModal.vue';
import LanguageSelectorPopup from './components/LanguageSelectorPopup.vue';

// State
const user = ref(null);
const emails = ref([]);
const selectedEmail = ref(null);
const currentFolder = ref('inbox');
const unreadCount = ref(0);
const searchQuery = ref('');
const availableDomains = ref([]);
const darkMode = ref(true);
const isSidebarCollapsed = ref(false);

// Admin state
const isAdmin = ref(false);
const managedAccounts = ref([]);
const activeAccount = ref(null);

// Modal state
const showLoginModal = ref(false);
const showRegisterModal = ref(false);
const showComposeForm = ref(false);
const showCreateAccountModal = ref(false);

const showLanguageSelector = ref(false);
const hideLanguageSelector = () => {
  showLanguageSelector.value = false;
};

const onLanguageChanged = (languageCode) => {
  console.log(`User selected language: ${languageCode}`);
  // Có thể thực hiện các thao tác khác ở đây, ví dụ: tải nội dung mới
};
// Form data
const registerForm = ref({
  username: '',
  domain: '',
  password: ''
});

const composeForm = ref({
  to: '',
  subject: '',
  body: ''
});
const newRefresh = (newEmail) => {
  console.log(newEmail)
  newRefreshEmail(newEmail.token)
}
let setIntervalId = null
const newRefreshEmail = (token) => {
  if (setIntervalId) {
    clearInterval(setIntervalId)
  }
  const unLoad = () => {
    request.get(`api/message/${token}`)
      .then(response => {
        // Handle the response
        emails.value = response.data.data
        console.log(emails.value);
      })
      .catch(error => {
        // Handle the error
        console.error(error);
      });
  }
  unLoad()
  setIntervalId = setInterval(() => {
    unLoad()
  }, 2000);
}
// Computed properties
const filteredEmails = computed(() => {
  if (!searchQuery.value) {
    return emails.value;
  }

  const query = searchQuery.value.toLowerCase();
  return emails.value.filter(email => {
    return email.subject?.toLowerCase().includes(query) ||
      email.from?.name?.toLowerCase().includes(query) ||
      email.from?.address?.toLowerCase().includes(query) ||
      email.text?.toLowerCase().includes(query);
  });
});

// Toggle sidebar
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

// Theme toggle
const toggleTheme = () => {
  darkMode.value = !darkMode.value;
  document.body.classList.toggle('light-mode', !darkMode.value);
  localStorage.setItem('darkMode', darkMode.value);
};

// Format date helpers
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const formatFullDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// API functions
const fetchDomains = async () => {
  try {
    // Mock data
    availableDomains.value = [
      { id: '1', domain: 'mail.tm' },
      { id: '2', domain: 'tempmail.net' },
      { id: '3', domain: 'disposable.email' }
    ];

    if (availableDomains.value.length > 0) {
      registerForm.value.domain = availableDomains.value[0].domain;
    }
  } catch (error) {
    console.error('Failed to fetch domains:', error);
  }
};

const fetchEmails = async (accountId = null) => {
  // If admin is viewing a specific account, use that account's emails
  const targetAccount = accountId || (activeAccount.value ? activeAccount.value.id : (user.value ? user.value.id : null));

  if (!targetAccount) return;

  try {
    // Mock data - in a real app, you'd fetch emails for the specific account
    emails.value = [
      {
        id: '1',
        from: { name: 'John Doe', address: 'john@example.com' },
        to: { address: activeAccount.value ? activeAccount.value.address : user.value.address },
        subject: 'Welcome to Mail.clone',
        text: 'Thank you for using our service. This is a temporary, secure and private email.',
        html: '<p>Thank you for using our service. This is a temporary, secure and private email.</p>',
        seen: false,
        starred: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        from: { name: 'Support Team', address: 'support@mail.clone' },
        to: { address: activeAccount.value ? activeAccount.value.address : user.value.address },
        subject: 'How to use Mail.clone',
        text: 'Please refer to this guide to learn how to effectively use our temporary email service.',
        html: '<p>Please refer to this guide to learn how to effectively use our temporary email service.</p>',
        seen: true,
        starred: true,
        createdAt: new Date(Date.now() - 86400000).toISOString() // Yesterday
      }
    ];

    // Add some account-specific emails if viewing as admin
    if (activeAccount.value) {
      emails.value.push({
        id: '3',
        from: { name: 'Admin System', address: 'admin@mail.clone' },
        to: { address: activeAccount.value.address },
        subject: 'Account Created by Admin',
        text: `This account (${activeAccount.value.address}) was created by an administrator.`,
        html: `<p>This account (${activeAccount.value.address}) was created by an administrator.</p>`,
        seen: false,
        starred: false,
        createdAt: new Date().toISOString()
      });
    }

    // Count unread emails
    unreadCount.value = emails.value.filter(email => !email.seen).length;
  } catch (error) {
    console.error('Failed to fetch emails:', error);
  }
};

// Fetch managed accounts (for admin)
const fetchManagedAccounts = async () => {
  if (!isAdmin.value) return;

  try {
    // Mock data
    managedAccounts.value = [
      {
        id: 'acc1',
        address: 'user1@mail.tm',
        username: 'user1',
        domain: 'mail.tm',
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        unreadCount: 3
      },
      {
        id: 'acc2',
        address: 'user2@tempmail.net',
        username: 'user2',
        domain: 'tempmail.net',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        unreadCount: 1
      },
      {
        id: 'acc3',
        address: 'test@disposable.email',
        username: 'test',
        domain: 'disposable.email',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        unreadCount: 0
      }
    ];
  } catch (error) {
    console.error('Failed to fetch managed accounts:', error);
  }
};

// Google Auth functions
const handleGoogleLogin = async () => {
  try {
    const response = await googleTokenLogin({
      prompt: 'select_account',
      scope: "email profile https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/userinfo.email",
      popup: true,
    });
    handleSignInWithGoogle(response);
  } catch (error) {
    console.error('Google login error:', error);
  }
};

const handleSignInWithGoogle = async (response) => {
  if (response.access_token) {
    // Gọi Google API để lấy thông tin người dùng
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${response.access_token}`
      }
    });

    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json();
      try {
        try {
          const apiResponse = await request.post('/api/auth/google-login', {
            googleId: userInfo.sub,
            email: userInfo.email,
            fullName: userInfo.name,
            picture: userInfo.picture,
            access_token: response.access_token
          })
          if (apiResponse.data.success) {
            isAdmin.value = true;
            await fetchManagedAccounts();
            // Lưu thông tin người dùng
            user.value = apiResponse.data.data;
            localStorage.setItem('user', JSON.stringify(apiResponse.data));
            localStorage.setItem('isAdmin', JSON.stringify(isAdmin.value));
          }
        } catch (error) {
          console.error('Google login error:', error)
          // Show error message to user
        }
        // Đóng modal và tải email
        showLoginModal.value = false;
        await fetchEmails();
      } catch (error) {
        console.error('Google login error:', error);
      }
    } else {
      console.error('Failed to fetch user info:', await userInfoResponse.text());
    }
  } else {
    console.error('No access token found in response');
  }
};

// Auth functions
const register = async () => {
  try {
    const email = `${registerForm.value.username}@${registerForm.value.domain}`;

    // Mock successful registration
    console.log('Registered with:', email);

    // Create user object
    user.value = {
      id: Date.now().toString(),
      address: email,
      token: 'mock-jwt-token',
      username: registerForm.value.username,
      domain: registerForm.value.domain
    };

    isAdmin.value = false;
    localStorage.setItem('user', JSON.stringify(user.value));
    localStorage.setItem('isAdmin', JSON.stringify(isAdmin.value));

    // Fetch emails
    await fetchEmails();

    // Close registration modal
    showRegisterModal.value = false;
  } catch (error) {
    console.error('Registration failed:', error);
    alert('Registration failed. Please try again.');
  }
};

const logout = () => {
  user.value = null;
  emails.value = [];
  selectedEmail.value = null;
  isAdmin.value = false;
  managedAccounts.value = [];
  activeAccount.value = null;
  localStorage.removeItem('user');
  localStorage.removeItem('isAdmin');
};

// Admin functions
const switchAccount = (account) => {
  activeAccount.value = account;
  selectedEmail.value = null;
  fetchEmails(account?.id);
};


const deleteAccount = (accountId) => {
  // Find the account
  const accountIndex = managedAccounts.value.findIndex(acc => acc.id === accountId);

  if (accountIndex !== -1) {
    // If we're currently viewing this account, go back to admin dashboard
    if (activeAccount.value && activeAccount.value.id === accountId) {
      activeAccount.value = null;
      emails.value = [];
    }

    // Remove the account
    managedAccounts.value.splice(accountIndex, 1);
  }
};

// Email functions
const changeFolder = (folder) => {
  currentFolder.value = folder;
  selectedEmail.value = null;
};

const selectEmail = (email) => {
  selectedEmail.value = email;

  // Mark as read if it wasn't already
  if (!email.seen) {
    email.seen = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);

    // If viewing as admin, update the unread count for the account
    if (activeAccount.value) {
      const account = managedAccounts.value.find(acc => acc.id === activeAccount.value.id);
      if (account && account.unreadCount > 0) {
        account.unreadCount--;
      }
    }
  }
};

const deleteEmail = (email) => {
  // Remove from the list
  emails.value = emails.value.filter(e => e.id !== email.id);
  selectedEmail.value = null;
};

const refreshEmails = () => {
  fetchEmails(activeAccount.value ? activeAccount.value.id : null);
};

const replyToEmail = (email) => {
  composeForm.value = {
    to: email.from.address,
    subject: `Re: ${email.subject}`,
    body: `\n\n-------- Original Message --------\nFrom: ${email.from.name || email.from.address}\nDate: ${formatFullDate(email.createdAt)}\nSubject: ${email.subject}\n\n${email.text}`
  };
  showComposeForm.value = true;
};

// Lifecycle hooks
onMounted(async () => {
  // Check for existing user session
  const storedUser = localStorage.getItem('user');
  const storedIsAdmin = localStorage.getItem('isAdmin');
  darkMode.value = JSON.parse(localStorage.getItem('darkMode')) ?? true;
  if (storedUser) {
    user.value = JSON.parse(storedUser);
    isAdmin.value = storedIsAdmin ? JSON.parse(storedIsAdmin) : false;

    if (isAdmin.value) {
      await fetchManagedAccounts();
    } else {
      await fetchEmails();
    }
  }

  // Fetch available domains
  await fetchDomains();

  // Apply dark mode by default
  document.body.classList.toggle('light-mode', !darkMode.value);

  const hasSelectedLanguage = localStorage.getItem('preferredLanguage');

  // Nếu chưa chọn ngôn ngữ, hiển thị popup
  if (!hasSelectedLanguage) {
    showLanguageSelector.value = true;
  }
});
</script>

<style>
/* Base Styles */
:root {
  /* Dark theme (default) */
  --bg-color: #161b2b;
  --sidebar-bg: #1e2538;
  --primary-color: #82c2ff;
  --primary-hover: #4f46e5;
  --text-color: #e2e8f0;
  --text-muted: #94a3b8;
  --border-color: #2d3748;
  --card-bg: #252e42;
  --hover-bg: #252e42;
  --modal-bg: #1e2538;
  --button-bg: #3a4257;
  --input-bg: #1a2030;
  --input-border: #3a4257;
  --tooltip-bg: #3a4257;
  --scrollbar-track: #1a2030;
  --scrollbar-thumb: #3a4257;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
}

.light-mode {
  --bg-color: #f8fafc;
  --sidebar-bg: #f1f5f9;
  --primary-color: #6366f1;
  --primary-hover: #4f46e5;
  --text-color: #1e293b;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  --card-bg: #ffffff;
  --hover-bg: #e2e8f0;
  --modal-bg: #ffffff;
  --button-bg: #e2e8f0;
  --input-bg: #f8fafc;
  --input-border: #cbd5e1;
  --tooltip-bg: #334155;
  --scrollbar-track: #f1f5f9;
  --scrollbar-thumb: #cbd5e1;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--bg-color);
}

a {
  color: var(--primary-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button {
  cursor: pointer;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background-color: var(--scrollbar-track);
}

::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: var(--primary-color);
}

/* Layout */
.mail-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left 0.3s ease;
}

/* Email Container */
.email-container {
  flex: 1;
  overflow: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }

  .sidebar-collapsed .app-container {
    flex-direction: column;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* Focus states for accessibility */
button:focus,
a:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
</style>