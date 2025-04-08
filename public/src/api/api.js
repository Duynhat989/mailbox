export const END_POINT = {
    // Auth APIs
    LOGIN: '/api/auth/login', // Đăng nhập
    REGISTER: '/api/auth/register', // Đăng ký
    FORGOT_PASSWORD: '/api/auth/forgot_password', // Quên mật khẩu

    // Assistants APIs
    ASSISTANTS_LIST: '/api/assistants', // Danh sách trợ lý
    ASSISTANT_FIND: '/api/assistant/find', // Tìm trợ lý
    ASSISTANT_CREATE: '/api/assistant/create', // Thêm trợ lý
    ASSISTANT_UPDATE: '/api/assistant/update', // Cập nhật trợ lý
    ASSISTANT_DELETE: '/api/assistant/delete', // Xóa trợ lý

    // Conversation APIs
    CONVERSATION_THREAD: '/api/conversation/thread', // Tạo phiên tin nhắn mới
    CONVERSATION_STREAM: '/api/conversation/stream', // Gửi luồng tin nhắn
    CONVERSATION_LIST: '/api/conversation', // Danh sách tin nhắn
    HISTORYS_LIST: '/api/historys', // Danh sách lịch sử chat
    // Courses APIs
    COURSES_LIST: '/api/courses', // Danh sách khóa học
    COURSE_FIND: '/api/course/find', // Tìm khóa học
    COURSE_CREATE: '/api/course/create', // Tạo mới khóa học
    COURSE_UPDATE: '/api/course/update', // Cập nhật khóa học
    COURSE_DELETE: '/api/course/delete', // Xóa khóa học
    COURSE_ME: '/api/course/me', // Khóa học cá nhân
    COURSE_SIGNIN: '/api/course/signin', // Đăng kí khóa học

    // Lessons APIs
    LESSONS_LIST: '/api/lessons', // Danh sách bài giảng
    LESSON_FIND: '/api/lesson/find', // Tìm bài giảng
    LESSON_CREATE: '/api/lesson/create', // Tạo bài giảng
    LESSON_UPDATE: '/api/lesson/update', // Cập nhật bài giảng
    LESSON_DELETE: '/api/lesson/delete', // Xóa bài giảng

    // Users APIs
    USERS_LIST: '/api/users', // Danh sách người dùng
    USER_FIND: '/api/user/find', // Tìm người dùng
    USER_UPDATE: '/api/user/update', // Cập nhật người dùng
    USER_DELETE: '/api/user/delete', // Xóa người dùng

    // Users APIs
    USER_GET: '/api/user/me', // Lấy thông tin người dùng
    USER_UPDATE: '/api/user/edit', // Cập nhật người dùng

    // Users APIs
    PACKAGE_LIST: '/api/packages', // Danh sách gói

    // Files APIs
    FILE_UPLOAD: '/api/file/upload', // Upload file
    FILE_DELETE: '/api/file/file-ZSNH47eGFS5wvCrvh12NtxzS', // Xóa file

    // Setup APIs
    SETUP: '/api/setup', // Tải cài đặt

    // License APIs
    LICENSE_GET: '/api/license/me', // Lấy bản quyền

    // Mainten APIs
    MAINTENANCE: '/api/setup/status', // kiểm tra bảo trì

    // Assistants selected APIs

    ESTATEANALYSIS: '/api/nav/estateAnalysis',
    FINANCIALANALYSIS: '/api/nav/financialAnalysis',
    TEAMTRAINGING: '/api/nav/teamTraining',
    NEWSSUMMARY: '/api/nav/newsSummary',
    INVESTMENTADVISE: '/api/nav/investmentAdvice',

    // Contracts APIs
    CONTRACTS_LIST: '/api/contracts', // Danh sách Hợp đồng
    CONTRACT_FIND: '/api/contract/find', // Tìm Hợp đồng
    CONTRACT_EXPORT: '/api/contract/export', // Tạo hợp đồng

    PROMPTS_LIST: '/api/prompts', // Danh sách Promts
    PROMPT_DELETE: '/api/prompt/delete', // Xóa Promts
    PROMPT_CREATE: '/api/prompt/create', // Create Promts
    PROMPT_UPDATE: '/api/prompt/update', // Update Promts

    SCAN_CONTRACT: '/api/contract/scan', // Update Promts
    NAV_SCAN_CONTRACT: '/api/nav/scanContract', // Update Promts
    
    ESTALES_LIST: '/api/estales', // Danh sách bài viết bất động sản
    ESTALE_FIND: '/api/estale/find', // Tìm bài viết bất động sản
    ESTALE_PROVINCE: '/api/estale/province', // Lấy vị trí
    PAYMENT_CREATE: '/api/pay/create', // Cập nhật thanh toan

};
