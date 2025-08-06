
import React, { useState, useEffect, useCallback } from 'react';
import { Bill, User } from '../types';
import { GAME_ZONES, PLAYER_PRICING, DURATION_SLOTS } from '../constants';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Users, Banknote, Tag, Receipt, User as UserIcon, Phone, Gamepad, Home, UserCircle } from 'lucide-react';

interface BillingFormProps {
    addBill: (billData: Omit<Bill, 'id' | 'startTime' | 'endTime' | 'createdAt'>) => void;
    currentUser: User;
}

const BillingForm: React.FC<BillingFormProps> = ({ addBill, currentUser }) => {
    const [customerName, setCustomerName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [address, setAddress] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [gameZoneId, setGameZoneId] = useState(GAME_ZONES[0].id);
    const [playerOptionIndex, setPlayerOptionIndex] = useState(0);
    const [additionalPlayerNames, setAdditionalPlayerNames] = useState<string[]>([]);
    const [durationOptionIndex, setDurationOptionIndex] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [finalAmount, setFinalAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('UPI');

    const resetForm = useCallback(() => {
        setCustomerName('');
        setContactNumber('');
        setAddress('');
        setAge('');
        setGameZoneId(GAME_ZONES[0].id);
        setPlayerOptionIndex(0);
        setAdditionalPlayerNames([]);
        setDurationOptionIndex(0);
        setDiscount(0);
        setPaymentMethod('UPI');
    }, []);

    useEffect(() => {
        const playerConfig = PLAYER_PRICING[playerOptionIndex];
        const durationConfig = DURATION_SLOTS[durationOptionIndex];
        const newTotalAmount = playerConfig.pricePerPersonPerHour * playerConfig.players * durationConfig.hours;
        setTotalAmount(newTotalAmount);
    }, [playerOptionIndex, durationOptionIndex]);

    useEffect(() => {
        const newFinalAmount = totalAmount - discount;
        setFinalAmount(Math.max(0, newFinalAmount));
    }, [totalAmount, discount]);
    
    useEffect(() => {
        const numPlayers = PLAYER_PRICING[playerOptionIndex].players;
        const numAdditionalPlayers = numPlayers > 1 ? numPlayers - 1 : 0;
        setAdditionalPlayerNames(Array(numAdditionalPlayers).fill(''));
    }, [playerOptionIndex]);

    const handleAdditionalPlayerNameChange = (index: number, value: string) => {
        const newNames = [...additionalPlayerNames];
        newNames[index] = value;
        setAdditionalPlayerNames(newNames);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!customerName || !age) return;

        const playerConfig = PLAYER_PRICING[playerOptionIndex];
        const durationConfig = DURATION_SLOTS[durationOptionIndex];
        const durationMinutes = durationConfig.hours * 60;
        
        addBill({
            customerName,
            additionalPlayerNames,
            contactNumber,
            address,
            age: Number(age),
            gameZoneId,
            durationMinutes,
            numberOfPlayers: playerConfig.players,
            pricePerPersonPerHour: playerConfig.pricePerPersonPerHour,
            totalAmount,
            discount,
            finalAmount,
            paymentMethod,
            createdBy: currentUser.id,
        });

        resetForm();
    };

    const selectedPlayerConfig = PLAYER_PRICING[playerOptionIndex];

    return (
        <Card className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-center text-primary">Create a Bill</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Left Column: Customer & Game Details */}
                <div className="space-y-6">
                    <Input label="Payer Name" id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. John Doe" required icon={<UserIcon className="h-4 w-4 text-muted-foreground" />}/>
                    <Input label="Payer Age" id="age" type="number" value={age} onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 25" required icon={<UserCircle className="h-4 w-4 text-muted-foreground" />} />
                    <Input label="Contact Number" id="contactNumber" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="e.g. 9876543210" type="tel" icon={<Phone className="h-4 w-4 text-muted-foreground" />} />
                    <Input label="Address" id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 103, Old Agraharam St..." icon={<Home className="h-4 w-4 text-muted-foreground" />} />
                     <Select label="Game / Zone" id="gameZone" value={gameZoneId} onChange={(e) => setGameZoneId(e.target.value)} icon={<Gamepad className="h-4 w-4 text-muted-foreground" />}>
                        {GAME_ZONES.map((zone) => (
                            <option key={zone.id} value={zone.id}>{zone.name}</option>
                        ))}
                    </Select>
                </div>
                
                {/* Right Column: Billing & Session */}
                <div className="p-6 bg-muted/50 rounded-xl space-y-4 flex flex-col border border-border">
                     <h3 className="font-semibold text-lg text-center mb-2">Session & Pricing</h3>
                     <Select label="Players" id="players" value={playerOptionIndex} onChange={(e) => setPlayerOptionIndex(Number(e.target.value))}>
                        {PLAYER_PRICING.map((opt, index) => (
                            <option key={index} value={index}>{opt.label}</option>
                        ))}
                    </Select>

                    {additionalPlayerNames.length > 0 && (
                        <div className="space-y-2 pl-2 border-l-2 border-primary/50">
                            {additionalPlayerNames.map((name, index) => (
                                <Input
                                    key={index}
                                    id={`player-${index + 2}`}
                                    placeholder={`Player ${index + 2} Name`}
                                    value={name}
                                    onChange={(e) => handleAdditionalPlayerNameChange(index, e.target.value)}
                                    className="h-9"
                                />
                            ))}
                        </div>
                    )}


                     <Select label="Duration" id="duration" value={durationOptionIndex} onChange={(e) => setDurationOptionIndex(Number(e.target.value))}>
                        {DURATION_SLOTS.map((opt, index) => (
                            <option key={index} value={index}>{opt.label}</option>
                        ))}
                    </Select>

                    <div className="flex-grow pt-4">
                         <div className="flex justify-between items-center bg-background/50 p-3 rounded-lg">
                            <span className="text-muted-foreground flex items-center text-sm"><Users className="mr-2 h-4 w-4" />Rate</span>
                            <span className="font-bold text-base">₹{selectedPlayerConfig.pricePerPersonPerHour.toFixed(2)}/person/hr</span>
                        </div>

                        <div className="flex justify-between items-center bg-background/50 p-3 rounded-lg mt-2">
                             <span className="text-muted-foreground flex items-center text-sm"><Banknote className="mr-2 h-4 w-4" />Subtotal</span>
                            <span className="font-bold text-base">₹{totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                    
                     <Input label="Discount (₹)" id="discount" type="number" value={discount === 0 ? '' : discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} placeholder="e.g. 50" icon={<Tag className="h-4 w-4 text-muted-foreground" />} />
                    <div className="flex justify-between items-center bg-primary text-primary-foreground p-4 rounded-lg text-2xl font-bold shadow-lg shadow-primary/20">
                        <span>Final Amount</span>
                        <span>₹{finalAmount.toFixed(2)}</span>
                    </div>
                </div>
                
                {/* Payment & Submit */}
                <div className="md:col-span-2 mt-4">
                    <label className="block text-sm font-medium mb-2 text-center">Payment Method</label>
                    <div className="flex justify-center space-x-6">
                        {(['UPI', 'Cash', 'Card'] as const).map((method) => (
                            <label key={method} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-muted">
                                <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="form-radio h-4 w-4 text-primary bg-background border-muted focus:ring-primary"/>
                                <span>{method}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-2 mt-4">
                    <Button type="submit" disabled={!customerName || !age} className="w-full text-lg" size="lg">
                        <Receipt className="mr-2 h-5 w-5" /> Generate Bill
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default BillingForm;
