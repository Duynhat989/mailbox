let io = null;

const initialize = (ioInstance) => {
    io = ioInstance;
    console.log('Socket.IO service initialized');
};

const notifyAll = (event, data) => {
    if (!io) {
        console.error('Socket.IO service not initialized');
        return false;
    }

    io.emit(event, {
        ...data,
        timestamp: new Date().toISOString()
    });

    return true;
};

const notifyClient = (socketId, event, data) => {
    if (!io) {
        console.error('Socket.IO service not initialized');
        return false;
    }

    io.to(socketId).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
    });

    return true;
};

const notifyUser = (userId, event, data) => {
    if (!io) {
        console.error('Socket.IO service not initialized');
        return false;
    }

    // Tìm tất cả sockets liên kết với userId
    const sockets = findSocketsByUserId(userId);

    if (sockets && sockets.length > 0) {
        sockets.forEach(socketId => {
            io.to(socketId).emit(event, {
                ...data,
                timestamp: new Date().toISOString()
            });
        });
        return true;
    }

    return false;
};

const notifyRoom = (room, event, data) => {
    if (!io) {
        console.error('Socket.IO service not initialized');
        return false;
    }

    io.to(room).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
    });

    return true;
};

const findSocketsByUserId = (userId) => {
    if (!io) {
        return [];
    }

    const sockets = [];
    // Lặp qua tất cả sockets hiện đang kết nối
    io.sockets.sockets.forEach(socket => {
        if (socket.user && socket.user.id === userId) {
            sockets.push(socket.id);
        }
    });

    return sockets;
};

const createAuthMiddleware = (authFunction) => {
    return async (socket, next) => {
        const token = socket.handshake.auth.token;

        if (token && typeof authFunction === 'function') {
            try {
                // Gọi hàm xác thực do người dùng cung cấp
                const user = await authFunction(token);
                socket.user = user;
                next();
            } catch (error) {
                next(new Error('Authentication error: ' + error.message));
            }
        } else {
            // Cho phép kết nối vô danh nếu không có token
            socket.user = { id: 'guest' };
            next();
        }
    };
};

module.exports = {
    initialize,
    notifyAll,
    notifyClient,
    notifyUser,
    notifyRoom,
    createAuthMiddleware
};