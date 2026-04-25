import axios from 'axios';


const api = axios.create({
    baseURL: '',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const gameApi = {

    startGame: async () => {
        const response = await api.post('/start');
        return response.data;
    },


    selectWeapon: async (weaponName) => {
        const response = await api.post(`/weaponselect/${weaponName}`);
        return response.data;
    },



    selectItem: async (itemName) => {
        const response = await api.post(`/itemselect/${itemName}`);
        return response.data;
    },

    // Use/Consume an item: POST /itemuse/{item}
    useItem: async (itemName) => {
        const response = await api.post(`/itemuse/${itemName}`);
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
    }
};

export default gameApi;