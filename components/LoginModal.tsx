
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { X, User, KeyRound } from 'lucide-react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginAttempt: (username: string, password: string) => boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginAttempt }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onLoginAttempt(username, password);
        if (!success) {
            setError('Invalid username or password.');
            setPassword('');
        }
    };

    const handleClose = () => {
        setError('');
        setUsername('');
        setPassword('');
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in" onClick={handleClose}>
            <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                 <Card className="w-full">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-primary">Login</h2>
                        <Button onClick={handleClose} variant="ghost" size="icon">
                            <X className="h-5 w-5" />
                        </Button>
                     </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input 
                            label="Username" 
                            id="username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username" 
                            required
                            icon={<User className="h-4 w-4 text-muted-foreground" />}
                        />
                        <Input 
                            label="Password" 
                            id="password" 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password" 
                            required 
                            icon={<KeyRound className="h-4 w-4 text-muted-foreground" />}
                        />
                        {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                        <Button type="submit" className="w-full" size="lg">
                            Login
                        </Button>
                    </form>
                 </Card>
            </div>
        </div>
    );
};

export default LoginModal;