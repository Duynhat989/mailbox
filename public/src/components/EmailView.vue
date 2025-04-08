<template>
  <div class="email-view">
    <div class="email-view-header">
      <button @click="$emit('back')" class="back-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back
      </button>
      <div class="email-view-actions">
        <button class="icon-button" @click="$emit('delete', email)">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
        <button class="icon-button" @click="$emit('reply', email)">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 14 4 9 9 4"></polyline>
            <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
          </svg>
        </button>
      </div>
    </div>
    <div class="email-view-content">
      <h2 class="email-view-subject">{{ email.subject }}</h2>
      <div class="email-view-meta">
        <p class="email-view-from">
          <strong>From:</strong> {{ email.from?.name || '' }} &lt;{{ email.fromEmail }}&gt;
        </p>
        <p class="email-view-to">
          <strong>To:</strong> {{ email.toEmail }}
        </p>
        <p class="email-view-date">
          <strong>Date:</strong> {{ formatFullDate(email.createdAt) }}
        </p>
      </div>
      <div class="email-view-body" v-html="email.htmlContent || email.textContent"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import request from '@/utils/request';

const props = defineProps({
  email: {
    type: Object,
    required: true
  }
});

defineEmits(['back', 'delete', 'reply']);
// console.log(props)
// Format date
const formatFullDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// /message/:id/read/:messageId
const onKma = () => {
  let email = props.email
  request.get(`api/message/read/${email.messageId}`)
    .then(response => {
      // Handle the response
      console.log(response.data);
    })
    .catch(error => {
      // Handle the error
      console.error(error);
    });

}
onMounted(() => {
  onKma()
})
</script>

<style scoped>
.email-view {
  padding: 20px;
  height: 100%;
  overflow: auto;
}

.email-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.back-button:hover {
  background-color: var(--hover-bg);
}

.email-view-actions {
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

.email-view-subject {
  font-size: 20px;
  margin-bottom: 15px;
}

.email-view-meta {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.email-view-meta p {
  margin-bottom: 5px;
  font-size: 14px;
  color: var(--text-muted);
}

.email-view-body {
  line-height: 1.7;
}
</style>