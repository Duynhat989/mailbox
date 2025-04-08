import request from '@/utils/request';
import { END_POINT } from './api';

export function login(credentials) {
    return request.post(END_POINT.LOGIN, credentials);
}

export function register(credentials) {
    return request.post(END_POINT.REGISTER, credentials);
}
