// SocketService.js
import { io } from 'socket.io-client';

// Lớp quản lý kết nối Socket.IO
class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.listeners = new Map();
    }

    // Khởi tạo kết nối
    connect(url, token) {
        if (this.socket) {
            return;
        }

        // Khởi tạo kết nối với headers xác thực
        this.socket = io(url, {
            auth: {
                token
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
            this.isConnected = true;

            // Đăng ký lại các event listeners
            this.listeners.forEach((callback, event) => {
                this.socket.on(event, callback);
            });
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return this.socket;
    }

    // Ngắt kết nối
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Đăng ký event listener
    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
        // Lưu trữ callback để đăng ký lại khi kết nối/kết nối lại
        this.listeners.set(event, callback);
    }

    // Hủy đăng ký event listener
    off(event) {
        if (this.socket) {
            this.socket.off(event);
        }
        this.listeners.delete(event);
    }

    // Gửi event đến server
    emit(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Cannot emit event: Socket not connected');
        }
    }

    // Kiểm tra trạng thái kết nối
    checkConnection() {
        return this.isConnected;
    }
}

// Tạo và xuất singleton instance
export const socketService = new SocketService();
export default socketService;