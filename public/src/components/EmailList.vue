<template>
  <div class="email-list">
    <div v-for="email in emails" :key="email.id" @click="$emit('select-email', email)"
      :class="['email-item', { unread: !email.read }]">
      <div class="avatar">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="20" :fill="getAvatarColor(email.from?.name || email.fromEmail)" />
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="16px" font-weight="bold">
            {{ getInitials(email.from?.name || email.fromEmail) }}
          </text>
        </svg>
        <i v-if="!email.read" class='bx bxs-circle' style='color:#1b3bff'  ></i>
      </div>
      <div class="content">
        <div class="email-header">
          <div class="email-sender">Form: {{ email.from?.name || email.fromEmail }}</div>
          <div class="email-date">{{ formatDate(email.createdAt) }}</div>
          <div class="email-date"><i class='bx bx-right-arrow-alt'></i></div>
        </div>
        <div class="email-subject">Subject: {{ email.subject }}</div>
        <div v-if="email.textContent" class="email-preview">Preview: {{ truncatePreview(email.textContent.slice(0,100)) }}...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  emails: {
    type: Array,
    default: () => []
  }
});

defineEmits(['select-email']);

// Format date with relative time for recent emails
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    const options = { weekday: 'long' };
    return date.toLocaleDateString(undefined, options);
  } else {
    return date.toLocaleDateString();
  }
};

// Get initials for avatar
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// Generate consistent color based on name
const getAvatarColor = (name) => {
  if (!name) return '#888888';
  
  // Simple hash function for name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to hex color
  const colors = [
    '#4285F4', '#EA4335', '#FBBC05', '#34A853', // Google colors
    '#1877F2', '#E1306C', '#2867B2', '#FF6B00', // Social media colors
    '#6200EA', '#00BFA5', '#F50057', '#FF6D00'  // Material design colors
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

// Truncate preview text
const truncatePreview = (text) => {
  if (!text) return '';
  return text.length > 90 ? text.substring(0, 90) + '...' : text;
};
</script>

<style scoped>
.email-list {
  height: 100%;
  padding: 12px;
}

.email-item {
  display: flex;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.137);
}

.email-item.unread {
  font-weight: 500;
  position: relative;
  border-left: 4px solid var(--primary-color, #1a73e8);
  /* background-color: var(--unread-bg, #2b267046); */
}

.email-item:hover {
  background-color: var(--hover-bg, #45ec36);
  transform: translateY(-1px);
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
}

.avatar {
  margin-right: 16px;
  flex-shrink: 0;
}

.content {
  flex: 1;
  min-width: 0; /* Ensures text truncation works */
}

.email-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.email-sender {
  font-size: 15px;
  font-weight: 500;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email-date {
  font-size: 13px;
  color: var(--text-muted, #70757a);
  margin-left: 12px;
  flex-shrink: 0;
}

.email-subject {
  font-size: 14px;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email-preview {
  font-size: 13px;
  color: var(--text-secondary, #5f6368);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .email-item {
    padding: 12px;
  }
  
  .avatar {
    margin-right: 12px;
  }
  
  .email-date {
    font-size: 12px;
  }
}
</style>