<template>
    <div class="admin-dashboard">
      <div class="dashboard-header">
        <h1>Quản lý tài khoản Email</h1>
        <button @click="$emit('create-account')" class="btn-create">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Tạo tài khoản mới
        </button>
      </div>
      
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-value">{{ managedAccounts.length }}</div>
          <div class="stat-label">Tổng số tài khoản</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalUnread }}</div>
          <div class="stat-label">Tổng thư chưa đọc</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ recentAccounts }}</div>
          <div class="stat-label">Tài khoản mới (7 ngày)</div>
        </div>
      </div>
      
      <div class="accounts-table-container">
        <table class="accounts-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Ngày tạo</th>
              <th>Thư chưa đọc</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="account in managedAccounts" :key="account.id">
              <td>{{ account.address }}</td>
              <td>{{ formatDate(account.createdAt) }}</td>
              <td>
                <span class="badge" :class="getBadgeClass(account.unreadCount)">
                  {{ account.unreadCount }}
                </span>
              </td>
              <td class="actions-cell">
                <button @click="$emit('view-account', account)" class="btn-action view">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
                <button @click="confirmDelete(account.id)" class="btn-action delete">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="managedAccounts.length === 0">
              <td colspan="4" class="empty-table">Chưa có tài khoản nào. Hãy tạo tài khoản mới.</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="modal">
        <div class="modal-content confirmation-modal">
          <h3>Xác nhận xóa</h3>
          <p>Bạn có chắc chắn muốn xóa tài khoản này không? Hành động này không thể hoàn tác.</p>
          <div class="confirmation-actions">
            <button @click="showDeleteConfirm = false" class="btn-cancel">Hủy</button>
            <button @click="deleteAccount" class="btn-confirm-delete">Xóa</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const props = defineProps({
    managedAccounts: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['create-account', 'view-account', 'delete-account']);
  
  // Delete confirmation
  const showDeleteConfirm = ref(false);
  const accountToDelete = ref(null);
  
  // Computed properties
  const totalUnread = computed(() => {
    return props.managedAccounts.reduce((total, account) => total + account.unreadCount, 0);
  });
  
  const recentAccounts = computed(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return props.managedAccounts.filter(account => {
      const createdDate = new Date(account.createdAt);
      return createdDate > oneWeekAgo;
    }).length;
  });
  
  // Methods
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const getBadgeClass = (count) => {
    if (count === 0) return '';
    if (count < 3) return 'badge-success';
    if (count < 10) return 'badge-warning';
    return 'badge-danger';
  };
  
  const confirmDelete = (accountId) => {
    accountToDelete.value = accountId;
    showDeleteConfirm.value = true;
  };
  
  const deleteAccount = () => {
    emit('delete-account', accountToDelete.value);
    showDeleteConfirm.value = false;
    accountToDelete.value = null;
  };
  </script>
  
  <style scoped>
  .admin-dashboard {
    padding: 20px;
    height: 100%;
    overflow: auto;
  }
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .dashboard-header h1 {
    font-size: 24px;
    font-weight: 600;
  }
  
  .btn-create {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }
  
  .btn-create:hover {
    background-color: var(--primary-hover);
  }
  
  /* Stats */
  .dashboard-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .stat-card {
    background-color: var(--card-bg);
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .stat-value {
    font-size: 32px;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 14px;
    color: var(--text-muted);
  }
  
  /* Accounts Table */
  .accounts-table-container {
    background-color: var(--card-bg);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .accounts-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .accounts-table th,
  .accounts-table td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  .accounts-table th {
    background-color: rgba(0, 0, 0, 0.1);
    font-weight: 600;
    font-size: 14px;
  }
  
  .accounts-table tbody tr:hover {
    background-color: var(--hover-bg);
  }
  
  .empty-table {
    text-align: center;
    padding: 32px;
    color: var(--text-muted);
  }
  
  .actions-cell {
    display: flex;
    gap: 8px;
  }
  
  .btn-action {
    background: none;
    border: none;
    padding: 6px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .btn-action.view {
    color: var(--primary-color);
  }
  
  .btn-action.view:hover {
    background-color: rgba(99, 102, 241, 0.1);
  }
  
  .btn-action.delete {
    color: var(--danger-color);
  }
  
  .btn-action.delete:hover {
    background-color: rgba(239, 68, 68, 0.1);
  }
  
  /* Confirmation Modal */
  .confirmation-modal {
    max-width: 400px;
  }
  
  .confirmation-modal h3 {
    margin-bottom: 16px;
  }
  
  .confirmation-modal p {
    margin-bottom: 24px;
    color: var(--text-muted);
  }
  
  .confirmation-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  
  .btn-cancel {
    background-color: var(--button-bg);
    color: var(--text-color);
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }
  
  .btn-cancel:hover {
    background-color: var(--hover-bg);
  }
  
  .btn-confirm-delete {
    background-color: var(--danger-color);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }
  
  .btn-confirm-delete:hover {
    background-color: #dc2626;
  }
  
  @media (max-width: 768px) {
    .dashboard-stats {
      grid-template-columns: 1fr;
    }
    
    .accounts-table th:nth-child(2),
    .accounts-table td:nth-child(2) {
      display: none;
    }
  }
  </style>