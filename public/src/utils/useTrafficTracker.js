// useTrafficTracker.js
import { getCurrentInstance, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

export const createTrafficTracker = (options = {}) => {
  // Kiểm tra các tùy chọn bắt buộc
  if (!options.telegramBotToken || !options.telegramChatId) {
    console.error('Traffic Tracker: Bạn cần cung cấp telegramBotToken và telegramChatId');
    return;
  }

  // Cấu hình mặc định
  const config = {
    telegramBotToken: options.telegramBotToken,
    telegramChatId: options.telegramChatId,
    pageViewTrack: options.pageViewTrack !== false,
    trackUserDetails: options.trackUserDetails !== false,
    telegramMessageTemplate: options.telegramMessageTemplate || 'Có người truy cập mới!\nURL: {url}\nIP: {ip}\nThiết bị: {userAgent}\nThời gian: {time}'
  };

  // Hàm lấy IP của người dùng
  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Traffic Tracker: Không thể lấy địa chỉ IP:', error);
      return 'unknown';
    }
  };

  // Hàm gửi thông báo đến Telegram
  const sendToTelegram = async (message) => {
    try {
      const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
      const params = {
        chat_id: config.telegramChatId,
        text: message,
        parse_mode: 'HTML'
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      const result = await response.json();
      if (!result.ok) {
        console.error('Traffic Tracker: Lỗi gửi tin nhắn đến Telegram:', result.description);
      }
    } catch (error) {
      console.error('Traffic Tracker: Lỗi gửi tin nhắn đến Telegram:', error);
    }
  };

  // Tạo thông báo từ template
  const createMessage = (data) => {
    let message = config.telegramMessageTemplate;
    for (const [key, value] of Object.entries(data)) {
      message = message.replace(`{${key}}`, value);
    }
    return message;
  };

  // Hàm theo dõi lưu lượng truy cập
  const trackPageView = async () => {
    if (!config.pageViewTrack) return;

    try {
      // Thu thập thông tin
      const ip = await getUserIP();
      const url = window.location.href;
      const userAgent = navigator.userAgent;
      const time = new Date().toLocaleString();

      // Tạo và gửi thông báo
      const messageData = {
        ip,
        url,
        userAgent,
        time
      };

      const message = createMessage(messageData);
      await sendToTelegram(message);
    } catch (error) {
      console.error('Traffic Tracker: Lỗi theo dõi lưu lượng truy cập:', error);
    }
  };

  // Theo dõi sự kiện tùy chỉnh
  const trackCustomEvent = async (eventName, eventData = {}) => {
    try {
      const ip = await getUserIP();
      const message = `Sự kiện: ${eventName}\nIP: ${ip}\nDữ liệu: ${JSON.stringify(eventData)}\nThời gian: ${new Date().toLocaleString()}`;
      await sendToTelegram(message);
    } catch (error) {
      console.error('Traffic Tracker: Lỗi theo dõi sự kiện tùy chỉnh:', error);
    }
  };

  return {
    trackPageView,
    trackCustomEvent
  };
};

export const useTrafficTracker = () => {
  const app = getCurrentInstance();
  if (!app || !app.appContext.config.globalProperties.$trafficTracker) {
    console.error('Traffic Tracker: Plugin chưa được cài đặt. Hãy cài đặt plugin trước khi sử dụng hook này.');
    return {
      trackPageView: () => {},
      trackCustomEvent: () => {}
    };
  }
  
  return app.appContext.config.globalProperties.$trafficTracker;
};

// Composition function để sử dụng trong component
export const useTrafficTracking = (options = {}) => {
  const router = useRouter();
  const { trackPageView, trackCustomEvent } = createTrafficTracker(options);
  
  onMounted(() => {
    // Theo dõi lần đầu tiên tải trang
    trackPageView();
    
    // Theo dõi chuyển hướng trang nếu router tồn tại
    if (router) {
      router.afterEach(() => {
        setTimeout(trackPageView, 500);
      });
    }
  });
  
  return {
    trackCustomEvent
  };
};