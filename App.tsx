
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import BillingForm from './components/BillingForm';
import BillingRecords from './components/BillingRecords';
import UserManagement from './components/UserManagement';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Bill, User } from './types';
import ReceiptModal from './components/ReceiptModal';
import LoginModal from './components/LoginModal';
import { USERS } from './constants';

function App() {
    const [bills, setBills] = useLocalStorage<Bill[]>('bills', []);
    const [users, setUsers] = useLocalStorage<User[]>('users', USERS);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [latestBill, setLatestBill] = useState<Bill | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const addBill = (billData: Omit<Bill, 'id' | 'startTime' | 'endTime' | 'createdAt'>) => {
        const maxId = bills.reduce((max, bill) => {
            // Check for purely numeric IDs to ensure sequential numbering
            const billIdNum = Number(bill.id);
            return !isNaN(billIdNum) && billIdNum > max ? billIdNum : max;
        }, 0);

        const newId = (maxId + 1).toString();
        const now = Date.now();
        
        const newBill: Bill = {
            ...billData,
            id: newId,
            createdAt: now,
            startTime: now,
            endTime: now + billData.durationMinutes * 60 * 1000,
        };

        const newBills = [...bills, newBill];
        setBills(newBills);
        setLatestBill(newBill);
    };

    const deleteBill = (billId: string) => {
        setBills(currentBills => currentBills.filter(bill => bill.id !== billId));
    };

    const addUser = (user: User) => {
        setUsers(currentUsers => [...currentUsers, user]);
    };

    const updateUser = (updatedUser: User) => {
        setUsers(currentUsers =>
            currentUsers.map(u => (u.id === updatedUser.id ? updatedUser : u))
        );
        // If the admin updates their own info, update the session state too
        if (currentUser && currentUser.id === updatedUser.id) {
            setCurrentUser(updatedUser);
        }
    };

    const deleteUser = (userId: string) => {
        // Prevent admin from deleting themselves
        if (currentUser && currentUser.id === userId) {
            alert("Admins cannot delete their own account.");
            return;
        }
        setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
    };
    
    const handleLogout = () => setCurrentUser(null);

    const openLoginModal = () => setIsLoginModalOpen(true);

    const handleLoginAttempt = (username: string, password: string):boolean => {
        const foundUser = users.find(u => u.username === username && u.password === password);
        if (foundUser) {
            setCurrentUser(foundUser);
            setIsLoginModalOpen(false);
            return true;
        }
        return false;
    };

    return (
        <HashRouter>
            <div className="min-h-screen bg-background text-foreground">
                <Header currentUser={currentUser} onLogin={openLoginModal} onLogout={handleLogout} />
                <main className="p-4 md:p-8">
                    <Routes>
                        <Route path="/" element={currentUser ? <BillingForm addBill={addBill} currentUser={currentUser} /> : <Navigate to="/login-prompt" />} />
                        <Route path="/login-prompt" element={
                            <div className="text-center mt-20">
                                <h2 className="text-2xl font-bold">Please log in</h2>
                                <p className="text-muted-foreground">You need to be logged in to create bills.</p>
                            </div>
                        }/>
                        <Route 
                            path="/records" 
                            element={currentUser ? <BillingRecords bills={bills} onDeleteBill={deleteBill} currentUser={currentUser} /> : <Navigate to="/" />}
                        />
                        <Route 
                            path="/users" 
                            element={
                                currentUser?.role === 'admin' ? (
                                    <UserManagement 
                                        users={users} 
                                        addUser={addUser} 
                                        deleteUser={deleteUser}
                                        updateUser={updateUser}
                                        currentUser={currentUser}
                                    />
                                ) : (
                                    <Navigate to="/" />
                                )
                            }
                        />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
                {latestBill && (
                    <ReceiptModal
                        bill={latestBill}
                        isOpen={!!latestBill}
                        onClose={() => setLatestBill(null)}
                    />
                )}
                {!currentUser && <LoginModal
                    isOpen={isLoginModalOpen}
                    onClose={() => setIsLoginModalOpen(false)}
                    onLoginAttempt={handleLoginAttempt}
                />}
            </div>
        </HashRouter>
    );
}

export default App;
