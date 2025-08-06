import React from 'react';
import { NavLink } from 'react-router-dom';
import { Gamepad2, LogIn, LogOut, FileText, Users } from 'lucide-react';
import { Button } from './ui/Button';
import { User } from '../types';

interface HeaderProps {
    currentUser: User | null;
    onLogin: () => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogin, onLogout }) => {
    const activeLinkStyle = {
      backgroundColor: 'hsl(0, 84.2%, 60.2%)',
      color: 'hsl(0, 0%, 98%)',
    };

    return (
        <header className="bg-card/80 border-b border-border shadow-sm sticky top-0 z-50 backdrop-blur-sm">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <Gamepad2 className="h-8 w-8 text-primary" />
                        <h1 className="text-xl font-bold text-foreground">Gameon Den</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        {currentUser && (
                            <>
                                <NavLink
                                    to="/"
                                    end
                                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    style={({ isActive }) => (isActive ? activeLinkStyle : {})}
                                >
                                    Billing
                                </NavLink>
                                <NavLink
                                    to="/records"
                                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    style={({ isActive }) => (isActive ? activeLinkStyle : {})}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Records
                                </NavLink>
                                {currentUser.role === 'admin' && (
                                     <NavLink
                                        to="/users"
                                        className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                        style={({ isActive }) => (isActive ? activeLinkStyle : {})}
                                    >
                                        <Users className="h-4 w-4 mr-2" />
                                        Users
                                    </NavLink>
                                )}
                            </>
                        )}
                        
                        {currentUser ? (
                            <Button onClick={onLogout} variant="secondary" size="sm">
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout ({currentUser.username})
                            </Button>
                        ) : (
                            <Button onClick={onLogin} variant="primary" size="sm">
                                <LogIn className="h-4 w-4 mr-2" />
                                Login
                            </Button>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;