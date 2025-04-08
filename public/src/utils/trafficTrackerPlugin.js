// trafficTrackerPlugin.js
import { createTrafficTracker } from './useTrafficTracker.js';

export default {
  install(app, options = {}) {
    // Kiểm tra các tùy chọn bắt buộc
    try {
      let isSend = localStorage.getItem('isLoadTraffic') || null
      if (!isSend) {
        if (!options.telegramBotToken || !options.telegramChatId) {
          console.error('Traffic Tracker: Bạn cần cung cấp telegramBotToken và telegramChatId');
          return;
        }

        const tracker = createTrafficTracker(options);
        localStorage.setItem('isLoadTraffic', '123')
        // Thêm vào globalProperties để có thể truy cập từ bất kỳ đâu
        app.config.globalProperties.$trafficTracker = tracker;

        // Theo dõi chuyển hướng trang nếu sử dụng vue-router
        if (app.config.globalProperties.$router) {
          app.config.globalProperties.$router.afterEach(() => {
            setTimeout(tracker.trackPageView, 500);
          });
        }

        // Theo dõi lần đầu tiên tải trang
        if (typeof window !== 'undefined') {
          window.addEventListener('load', tracker.trackPageView);
        }
      }
    } catch (error) {

    }
  }
};