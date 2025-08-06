

export type UserRole = 'admin' | 'staff';

export interface User {
    id: string;
    username: string;
    password: string;
    role: UserRole;
}

export interface GameZone {
    id: string;
    name: string;
}

export interface Bill {
    id:string;
    customerName: string;
    additionalPlayerNames: string[];
    contactNumber: string;
    address: string;
    age: number;
    gameZoneId: string;
    startTime: number;
    endTime: number;
    durationMinutes: number;
    numberOfPlayers: number;
    pricePerPersonPerHour: number;
    totalAmount: number;
    discount: number;
    finalAmount: number;
    paymentMethod: 'Cash' | 'UPI' | 'Card';
    createdAt: number;
    createdBy: string; // User ID
}