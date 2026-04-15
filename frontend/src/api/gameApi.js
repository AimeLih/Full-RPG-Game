import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers:{
        'Content-Type': 'application/json'
    },
});

export const gameApi = {
    startGame: async () => {
        const response = await api.post('/start');
        return response.data;
    },

    selectWeapon: async (weaponName) => {
        const response = await api.post('/weapon');
    }
}