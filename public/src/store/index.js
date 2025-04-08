import { createStore } from 'vuex';
import { login, register } from '../api/auth';

const store = createStore({
    state: {
        user: JSON.parse(localStorage.getItem('ainow_user')) || null,
        token: localStorage.getItem('ainow_token') || null,
        isLogin: !!localStorage.getItem('ainow_token') ,
        message: "",
        assistantName: ""
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
            localStorage.setItem('ainow_user', JSON.stringify(user));
        },
        setToken(state, token) {
            state.token = token;
            state.isLogin = !!token;
            localStorage.setItem('ainow_token', token);
        },
        clearAuthData(state) {
            state.user = null;
            state.token = null;
            state.isLogin = false;
            localStorage.removeItem('ainow_user');
            localStorage.removeItem('ainow_token');
        },
        setMessage(state, message) {
            state.message = message;
        },
        setAssistantName(state, assistantName) {
            state.assistantName = assistantName;
        },
    },
    actions: {
        async login({ commit }, credentials) {
            const data = await login(credentials);

            commit('setUser', data.data);
            commit('setToken', data.data.token);
        },
        async register({ commit }, credentials) {
            const data = await register(credentials);
            commit('setUser', data.data);
            commit('setToken', data.data.token);
        },
        async logout({ commit }) {
            commit('clearAuthData');
        }
    },
    getters: {
        isAuthenticated(state) {
            return !!state.token;
        },
        getUser(state) {
            return state.user;
        },
        isLogin(state) {
            return state.isLogin; 
        }
    }
});

export default store;
