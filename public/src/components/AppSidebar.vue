<template>
  <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
    <div class="sidebar-header">
      <div class="logo">
        <!-- <img width="35" src="../assets/images/1743478415988.png" alt="" class="logo-img"> -->
        <template v-if="!isCollapsed">
          <span class="logo-at"><span style="text-transform: uppercase;">FlastMail</span></span>
        </template>
      </div>
    </div>

    <template v-if="!isCollapsed">
      <div class="sidebar-menu">
        <!-- Admin Dashboard Link -->
        <div v-if="isAdmin" class="menu-item" :class="{ active: !activeAccount }"
          @click="$emit('switch-account', null)">
          <div class="menu-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          </div>
          <span class="menu-text">Bảng điều khiển</span>
        </div>

        <!-- Managed Accounts Section (Admin only) -->
        <div v-if="isAdmin && managedAccounts.length > 0" class="menu-section">
          <div class="menu-section-header">
            <span class="menu-section-title">Tài khoản quản lý</span>
            <button class="btn-add-account" @click.stop="$emit('create-new-account')" title="Tạo tài khoản mới">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>

          <div v-for="account in managedAccounts" :key="account.id" class="menu-item account-item"
            :class="{ active: activeAccount && activeAccount.id === account.id }"
            @click="$emit('switch-account', account)">
            <div class="menu-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="account-info">
              <span class="account-name">{{ account.username }}</span>
              <span class="account-domain">@{{ account.domain }}</span>
            </div>
            <div v-if="account.unreadCount > 0" class="unread-badge">
              {{ account.unreadCount }}
            </div>
          </div>
        </div>

        <!-- Regular Menu Items -->
        <div class="menu-item" :class="{ active: currentFolder === 'inbox' }" @click="$emit('change-folder', 'inbox')">
          <div class="menu-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <span class="menu-text">Hộp thư</span>
        </div>

        <div class="menu-item" @click="$emit('refresh-emails')">
          <div class="menu-icon">
            <i class='bx bx-code-alt' style="font-size: 1.5em;"></i>
          </div>
          <span class="menu-text">API</span>
        </div>

        <!-- <div class="menu-item">
          <i class='bx bx-credit-card' style="font-size: 1.5em;"></i>
          <span class="menu-text" style="margin-left: 10px;">Nâng cấp</span>
        </div> -->
        <div class="menu-item" @click="$emit('reset-language')">
          <i class='bx bx-map-pin' style="font-size: 1.5em;"></i>
          <span class="menu-text" style="margin-left: 10px;">Ngôn ngữ</span>
        </div>
        <div class="menu-item" @click="$emit('login-account')">
          <i class='bx bx-user' style="font-size: 1.5em;"></i>
          <span class="menu-text" style="margin-left: 10px;">Đăng nhập</span>
        </div>
      </div>

      <div class="sidebar-footer">
        <p class="footer-text">
          Hỗ trợ chúng tôi bằng cách<br>
          tắt trình chặn quảng cáo 🙏
        </p>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  },
  currentFolder: {
    type: String,
    default: 'inbox'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  managedAccounts: {
    type: Array,
    default: () => []
  },
  activeAccount: {
    type: Object,
    default: null
  }
});

defineEmits([
  'change-folder',
  'refresh-emails',
  'switch-account',
  'create-new-account',
  'login-account',
  'reset-language'
]);
</script>

<style scoped>
.sidebar {
  width: 240px;
  background-color: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
  z-index: 10;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: var(--text-color);
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.logo-img {
  margin-right: 5px;
}

.sidebar.collapsed .logo-img {
  margin-right: 0;
}

.logo-at,
.logo-dot {
  color: var(--primary-color);
}
.logo-at{
  font-size: 1.5em;
}

.collapse-button {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  transform: rotate(0deg);
}

.sidebar.collapsed .collapse-button {
  transform: rotate(180deg);
}

.collapse-button:hover {
  color: var(--text-color);
  background-color: var(--hover-bg);
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
}

.menu-section {
  margin-top: 8px;
  margin-bottom: 8px;
}

.menu-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
}

.menu-section-title {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.btn-add-account {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-add-account:hover {
  color: var(--text-color);
  background-color: var(--hover-bg);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.menu-item:hover {
  background-color: var(--hover-bg);
  color: var(--text-color);
}

.menu-item.active {
  color: var(--primary-color);
  background-color: rgba(99, 102, 241, 0.1);
}

.menu-icon {
  margin-right: 12px;
  display: flex;
  align-items: center;
  min-width: 20px;
}

.account-item {
  padding: 8px 16px;
}

.account-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.account-name {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-domain {
  font-size: 12px;
  color: var(--text-muted);
}

.unread-badge {
  background-color: var(--primary-color);
  color: white;
  border-radius: 9999px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  padding: 0 6px;
}

.sidebar-footer {
  padding: 16px;
  font-size: 12px;
  color: var(--text-muted);
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    flex-direction: row;
    align-items: center;
    height: 60px;
  }

  .sidebar.collapsed {
    width: 100%;
    height: 60px;
  }

  .sidebar-menu {
    display: flex;
    overflow-x: auto;
    padding: 0 10px;
  }

  .sidebar-footer {
    display: none;
  }

  .menu-text,
  .account-info {
    display: none;
  }

  .menu-item {
    padding: 8px;
  }

  .menu-icon {
    margin-right: 0;
  }

  .menu-section-header {
    display: none;
  }
}
</style>