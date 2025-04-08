// SubscriptionService.js - Utility functions for subscription and usage limits

/**
 * Get stored subscription data from localStorage
 * @returns {Object|null} The subscription data or null if not found
 */
export const getSubscriptionData = () => {
    try {
        const data = localStorage.getItem('SubDaily');
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading subscription data:', error);
        return null;
    }
};

/**
 * Save subscription data to localStorage
 * @param {Object} data - The subscription data to save
 */
export const saveSubscriptionData = (data) => {
    try {
        localStorage.setItem('SubDaily', JSON.stringify(data));
    } catch (error) {
        console.error('Error saving subscription data:', error);
    }
};

/**
 * Check if the user's subscription has expired
 * @returns {boolean} True if subscription has expired
 */
export const checkIfSubscriptionExpired = () => {
    const data = getSubscriptionData();

    if (!data || !data.subscription || !data.subscription.expired) {
        return false; // No data or no expiration date = not expired
    }

    const expiredDate = new Date(data.subscription.expired);
    const now = new Date();

    return now > expiredDate;
};

/**
 * Get the number of days since subscription expired
 * @returns {number} Number of days since expiration (0 if not expired)
 */
export const getDaysExpired = () => {
    const data = getSubscriptionData();

    if (!data || !data.subscription || !data.subscription.expired) {
        return 0;
    }

    const expiredDate = new Date(data.subscription.expired);
    const now = new Date();

    if (now <= expiredDate) {
        return 0; // Not expired yet
    }

    // Calculate days difference
    const diffTime = Math.abs(now - expiredDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

/**
 * Check if user has reached the daily request limit
 * @returns {boolean} True if limit reached, false otherwise
 */
export const checkUserDailyLimit = () => {
    const data = getSubscriptionData();

    if (!data || !data.limit) {
        return false; // No data = no limit reached
    }

    // Check if the date is current
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    if (data.limit.date !== today) {
        // It's a new day, reset counter
        const updatedData = {
            ...data,
            limit: {
                ...data.limit,
                date: today,
                request: '0'
            }
        };
        saveSubscriptionData(updatedData);
        return false;
    }

    // Check if request count has reached the limit
    return parseInt(data.limit.request) >= parseInt(data.limit.limit);
};

/**
 * Increment the request counter for today
 * @returns {Object} Updated limit data
 */
export const incrementRequestCount = () => {
    const data = getSubscriptionData();

    if (!data || !data.limit) {
        // Initialize with defaults if not exists
        const newData = {
            subscription: data?.subscription || { type: 'base', expired: null },
            limit: {
                date: new Date().toISOString().split('T')[0],
                request: '1',
                limit: '25' // Default limit
            }
        };
        saveSubscriptionData(newData);
        return newData.limit;
    }

    const today = new Date().toISOString().split('T')[0];

    if (data.limit.date !== today) {
        // It's a new day, reset counter to 1
        const updatedLimit = {
            date: today,
            request: '1',
            limit: data.limit.limit
        };

        const updatedData = {
            ...data,
            limit: updatedLimit
        };

        saveSubscriptionData(updatedData);
        return updatedLimit;
    }

    // Increment the counter
    const updatedLimit = {
        ...data.limit,
        request: (parseInt(data.limit.request) + 1).toString()
    };

    const updatedData = {
        ...data,
        limit: updatedLimit
    };

    saveSubscriptionData(updatedData);
    return updatedLimit;
};

/**
 * Get remaining requests for today
 * @returns {number} Number of requests remaining
 */
export const getRemainingRequests = () => {
    const data = getSubscriptionData();

    if (!data || !data.limit) {
        return 25; // Default limit if not set
    }

    const today = new Date().toISOString().split('T')[0];

    if (data.limit.date !== today) {
        return parseInt(data.limit.limit); // New day, full limit available
    }

    const used = parseInt(data.limit.request);
    const total = parseInt(data.limit.limit);

    return Math.max(0, total - used);
};

/**
 * Get user subscription type
 * @returns {string} Subscription type or 'base' if not set
 */
export const getSubscriptionType = () => {
    const data = getSubscriptionData();

    if (!data || !data.subscription) {
        return 'base';
    }

    return data.subscription.type;
};

/**
 * Initialize subscription data if not exists
 */
export const initializeSubscriptionData = () => {
    const data = getSubscriptionData();

    if (!data) {
        // Create default data
        const defaultData = {
            subscription: {
                type: 'base',
                expired: null // No expiration for free tier
            },
            limit: {
                date: new Date().toISOString().split('T')[0],
                request: '0',
                limit: '25' // Default limit
            }
        };

        saveSubscriptionData(defaultData);
    }
};