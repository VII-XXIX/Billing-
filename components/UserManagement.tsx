
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Trash2, UserPlus, User as UserIcon, KeyRound, Shield, Edit, XCircle } from 'lucide-react';

interface UserManagementProps {
    users: User[];
    addUser: (user: User) => void;
    deleteUser: (userId: string) => void;
    updateUser: (user: User) => void;
    currentUser: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, addUser, deleteUser, updateUser, currentUser }) => {
    // Form state
    const [formUsername, setFormUsername] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formRole, setFormRole] = useState<UserRole>('staff');
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Effect to populate form when editingUser changes
    useEffect(() => {
        if (editingUser) {
            setFormUsername(editingUser.username);
            setFormPassword(editingUser.password);
            setFormRole(editingUser.role);
        } else {
            // Reset form when not editing
            setFormUsername('');
            setFormPassword('');
            setFormRole('staff');
        }
    }, [editingUser]);
    
    const handleStartEdit = (user: User) => {
        setEditingUser(user);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formUsername.trim() === '' || formPassword.trim() === '') {
            alert('Username and password cannot be empty.');
            return;
        }

        if (editingUser) {
            // Prevent last admin from changing their role
            if (editingUser.role === 'admin' && formRole !== 'admin') {
                const adminCount = users.filter(u => u.role === 'admin').length;
                if (adminCount <= 1) {
                    alert("Action denied: You cannot change the role of the only administrator.");
                    return;
                }
            }

            // Update existing user
            updateUser({
                ...editingUser,
                username: formUsername.trim(),
                password: formPassword.trim(),
                role: formRole,
            });
        } else {
            // Add new user
            const newUser: User = {
                id: `user-${Date.now()}`,
                username: formUsername.trim(),
                password: formPassword.trim(),
                role: formRole,
            };
            addUser(newUser);
        }
        
        // Reset form after submit
        setEditingUser(null);
    };

    return (
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-2">
                <Card>
                    <h2 className="text-2xl font-bold mb-6">User List</h2>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-left">
                            <thead className="bg-muted">
                                <tr className="border-b">
                                    <th className="p-3 text-sm font-semibold">Username</th>
                                    <th className="p-3 text-sm font-semibold">Role</th>
                                    <th className="p-3 text-sm font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={user.id} className={`border-b transition-colors hover:bg-muted ${index % 2 !== 0 ? 'bg-muted/50' : ''}`}>
                                        <td className="p-3 font-medium">{user.username}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center space-x-2">
                                            <Button variant="outline" size="icon" onClick={() => handleStartEdit(user)}>
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Edit User</span>
                                            </Button>
                                            <Button variant="destructive" size="icon" onClick={() => deleteUser(user.id)} disabled={user.id === currentUser.id}>
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete User</span>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <div>
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                        {editingUser && (
                             <Button onClick={handleCancelEdit} variant="ghost" size="icon">
                                <XCircle className="h-5 w-5" />
                                <span className="sr-only">Cancel Edit</span>
                            </Button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input 
                            label="Username" 
                            id="new-username"
                            value={formUsername}
                            onChange={(e) => setFormUsername(e.target.value)}
                            placeholder="e.g. staff01"
                            required
                            icon={<UserIcon className="h-4 w-4 text-muted-foreground" />}
                        />
                        <Input 
                            label="Password" 
                            id="new-password"
                            type="text"
                            value={formPassword}
                            onChange={(e) => setFormPassword(e.target.value)}
                            placeholder="Enter a password"
                            required
                            icon={<KeyRound className="h-4 w-4 text-muted-foreground" />}
                        />
                        <Select
                            label="Role"
                            id="new-role"
                            value={formRole}
                            onChange={(e) => setFormRole(e.target.value as UserRole)}
                            icon={<Shield className="h-4 w-4 text-muted-foreground" />}
                        >
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </Select>
                        <Button type="submit" className="w-full">
                           {editingUser ? (
                                <>
                                    <Edit className="mr-2 h-4 w-4"/> Save Changes
                                </>
                            ) : (
                                <>
                                    <UserPlus className="mr-2 h-4 w-4"/> Add User
                                </>
                            )}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default UserManagement;
