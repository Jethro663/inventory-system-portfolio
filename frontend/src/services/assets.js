import api from '../utils/api';

export const createAsset = (data) => {
    return api.post('/assets', data);
};
