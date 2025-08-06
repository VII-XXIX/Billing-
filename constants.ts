
import { GameZone, User } from './types';

export const GAME_ZONES: GameZone[] = [
    { id: 'ps5', name: 'PlayStation 5' },
    { id: 'pc', name: 'PC Gaming' },
];

export const PLAYER_PRICING = [
    { players: 1, pricePerPersonPerHour: 90, label: 'Single Player (₹90/hr)' },
    { players: 2, pricePerPersonPerHour: 80, label: 'Dual Player (₹80/person/hr)' },
    { players: 4, pricePerPersonPerHour: 70, label: '4 Players (₹70/person/hr)' },
];

export const DURATION_SLOTS = Array.from({ length: 24 }, (_, i) => ({
    hours: i + 1,
    label: `${i + 1} Hour${i === 0 ? '' : 's'}`,
}));

export const USERS: User[] = [
    { id: 'user-1', username: '1111', password: '1111', role: 'admin' },
    { id: 'user-2', username: 'staff', password: 'password', role: 'staff' },
];