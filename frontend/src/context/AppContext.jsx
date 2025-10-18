// src/context/AppContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';

const AppContext = createContext();

const ACTION_TYPES = {
    SET_LOADING: 'SET_LOADING',
    SET_USER: 'SET_USER',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
    SET_THEME: 'SET_THEME',
    SHOW_MODAL: 'SHOW_MODAL',
    HIDE_MODAL: 'HIDE_MODAL',
    SHOW_CONFIRM_MODAL: 'SHOW_CONFIRM_MODAL',
    HIDE_CONFIRM_MODAL: 'HIDE_CONFIRM_MODAL',
};

const initialState = {
    user: null,
    loading: false,
    error: null,
    theme: localStorage.getItem('theme') || 'light',
    isAuthenticated: false,
    modal: { isOpen: false, title: '', message: '', type: 'info' },
    confirmModal: { isOpen: false, title: '', message: '', onConfirm: () => {} },
};

const appReducer = (state, action) => {
    switch (action.type) {
        case ACTION_TYPES.SET_LOADING:
            return { ...state, loading: action.payload };
        case ACTION_TYPES.SET_USER:
            return { ...state, user: action.payload, isAuthenticated: !!action.payload, error: null };
        case ACTION_TYPES.SET_ERROR:
            return { ...state, error: action.payload, loading: false };
        case ACTION_TYPES.CLEAR_ERROR:
            return { ...state, error: null };
        case ACTION_TYPES.SET_THEME:
            localStorage.setItem('theme', action.payload);
            document.documentElement.setAttribute('data-theme', action.payload);
            return { ...state, theme: action.payload };
        case ACTION_TYPES.SHOW_MODAL:
            return { ...state, modal: { ...action.payload, isOpen: true } };
        case ACTION_TYPES.HIDE_MODAL:
            return { ...state, modal: { ...state.modal, isOpen: false } };
        case ACTION_TYPES.SHOW_CONFIRM_MODAL:
            return { ...state, confirmModal: { ...action.payload, isOpen: true } };
        case ACTION_TYPES.HIDE_CONFIRM_MODAL:
            return { ...state, confirmModal: { ...initialState.confirmModal, isOpen: false } };
        default:
            return state;
    }
};

export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', state.theme);
    }, [state.theme]);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            api.defaults.headers.Authorization = `Bearer ${token}`;
            const response = await api.get('/auth/me');
            dispatch({ type: ACTION_TYPES.SET_USER, payload: response.data?.data || null });
        } catch (error) {
            localStorage.removeItem('token');
            delete api.defaults.headers.Authorization;
            console.error('Auth check failed:', error);
        }
    };

    const login = async (credentials) => {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        try {
            const response = await api.post('/auth/login', credentials);
            const auth = response.data?.data;
            const token = auth?.token;
            if (!token) throw new Error('No token returned from login');
            localStorage.setItem('token', token);
            api.defaults.headers.Authorization = `Bearer ${token}`;
            const me = await api.get('/auth/me');
            dispatch({ type: ACTION_TYPES.SET_USER, payload: me.data?.data || null });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            dispatch({ type: ACTION_TYPES.SET_ERROR, payload: errorMessage });
            throw error;
        } finally {
            dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
        }
    };

    const register = async (userData) => {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        try {
            const response = await api.post('/auth/register', userData);
            const auth = response.data?.data;
            const token = auth?.token;
            if (!token) throw new Error('No token returned from register');
            localStorage.setItem('token', token);
            api.defaults.headers.Authorization = `Bearer ${token}`;
            const me = await api.get('/auth/me');
            dispatch({ type: ACTION_TYPES.SET_USER, payload: me.data?.data || null });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            dispatch({ type: ACTION_TYPES.SET_ERROR, payload: errorMessage });
            throw error;
        } finally {
            dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            delete api.defaults.headers.Authorization;
            dispatch({ type: ACTION_TYPES.SET_USER, payload: null });
            window.location.href = '/login';
        }
    };

    const toggleTheme = () => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        dispatch({ type: ACTION_TYPES.SET_THEME, payload: newTheme });
    };

    const clearError = () => dispatch({ type: ACTION_TYPES.CLEAR_ERROR });

    // --- MODAL FUNCTIONS ---
    const showModal = (title, message, type = 'info') => {
        dispatch({ type: ACTION_TYPES.SHOW_MODAL, payload: { title, message, type } });
    };

    const hideModal = () => {
        dispatch({ type: ACTION_TYPES.HIDE_MODAL });
    };

    const showConfirmModal = ({ title, message, onConfirm, confirmText, confirmVariant }) => {
        dispatch({ type: ACTION_TYPES.SHOW_CONFIRM_MODAL, payload: { title, message, onConfirm, confirmText, confirmVariant } });
    };

    const hideConfirmModal = () => {
        dispatch({ type: ACTION_TYPES.HIDE_CONFIRM_MODAL });
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        toggleTheme,
        clearError,
        checkAuth,
        showModal,
        hideModal,
        showConfirmModal,
        hideConfirmModal,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within an AppProvider');
    return context;
};