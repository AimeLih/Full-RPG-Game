import axios from 'axios';

const encodePathValue = (value) => encodeURIComponent(value)
const resolveApiBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    if (window.location.port === '5173') {
        return 'http://localhost:8080';
    }

    if (window.location.hostname.includes('vercel.app')) {
        return 'https://rashinova-backend.onrender.com';
    }

    return '';
};

const api = axios.create({
    baseURL: resolveApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

export const gameApi = {

    loadGame: async () => {
        const response = await api.get('/state');
        return response.data;
    },

    startGame: async () => {
        const response = await api.post('/start');
        return response.data;
    },


    selectWeapon: async (weaponName) => {
        const response = await api.post(`/weaponselect/${encodePathValue(weaponName)}`);
        return response.data;
    },

    selectMode: async (mode) => {
        const response = await api.post(`/modeselect/${encodePathValue(mode)}`);
        return response.data;
    },



    selectItem: async (itemName) => {
        const response = await api.post(`/itemselect/${encodePathValue(itemName)}`);
        return response.data;
    },

    // Use/Consume an item: POST /itemuse/{item}
    useItem: async (itemName) => {
        const response = await api.post(`/itemuse/${encodePathValue(itemName)}`);
        return response.data;
    },



    startBattle: async () => {
        const response = await api.post('/battle/start');
        return response.data;
    },


    attack: async () => {
        const response = await api.post('/battle/attack');
        return response.data;
    },


    nextDay: async () => {
        const response = await api.post('/nextday');
        return response.data;
    },

    loadLeaderboard: async () => {
        const response = await api.get('/leaderboard');
        return response.data;
    },

    submitLeaderboard: async (payload) => {
        const response = await api.post('/leaderboard', payload);
        return response.data;
    }
};

export default gameApi;
