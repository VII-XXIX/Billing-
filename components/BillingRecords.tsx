
import React, { useState, useMemo } from 'react';
import { Bill, User } from '../types';
import { GAME_ZONES } from '../constants';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { format, isToday } from 'date-fns';
import { Search, Download, Printer, BarChart3, Users, IndianRupee, Trash2 } from 'lucide-react';

interface BillingRecordsProps {
    bills: Bill[];
    currentUser: User;
    onDeleteBill: (billId: string) => void;
}

const BillingRecords: React.FC<BillingRecordsProps> = ({ bills, currentUser, onDeleteBill }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterZone, setFilterZone] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const getZoneName = (zoneId: string) => {
        return GAME_ZONES.find(z => z.id === zoneId)?.name || 'Unknown Zone';
    };

    const stats = useMemo(() => {
        const todayBills = bills.filter(bill => isToday(new Date(bill.createdAt)));
        const totalRevenueToday = todayBills.reduce((acc, bill) => acc + bill.finalAmount, 0);

        const zoneCounts = todayBills.reduce((acc, bill) => {
            const zoneName = getZoneName(bill.gameZoneId);
            acc[zoneName] = (acc[zoneName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const mostPopularZoneName = Object.keys(zoneCounts).reduce((a, b) => zoneCounts[a] > zoneCounts[b] ? a : b, 'N/A');
        
        const totalAllTimeRevenue = bills.reduce((acc, bill) => acc + bill.finalAmount, 0);

        return {
            totalRevenueToday,
            billsTodayCount: todayBills.length,
            mostPopularZoneName,
            totalAllTimeRevenue,
        };
    }, [bills]);
    
    const getPlayerNames = (bill: Bill) => {
      return [bill.customerName, ...(bill.additionalPlayerNames || [])].filter(Boolean).join(', ');
    }
    
    const handleDelete = (billId: string) => {
        if (window.confirm('Are you sure you want to permanently delete this bill? This action cannot be undone.')) {
            onDeleteBill(billId);
        }
    };

    const filteredBills = useMemo(() => {
        return bills
            .filter(bill => {
                const searchMatch = getPlayerNames(bill).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   bill.contactNumber.includes(searchTerm);
                const zoneMatch = filterZone ? bill.gameZoneId === filterZone : true;
                const dateMatch = filterDate ? format(new Date(bill.createdAt), 'yyyy-MM-dd') === filterDate : true;
                return searchMatch && zoneMatch && dateMatch;
            })
            .sort((a, b) => b.createdAt - a.createdAt); // Show newest first
    }, [bills, searchTerm, filterZone, filterDate]);

    const exportToCSV = () => {
        const headers = ["Bill ID", "Date", "Player Names", "Payer Age", "Address", "Contact", "Game Zone", "Total Players", "Duration (hr)", "Subtotal (₹)", "Discount (₹)", "Final (₹)", "Payment Method"];
        const rows = filteredBills.map(bill => [
            bill.id,
            format(new Date(bill.createdAt), 'PPpp'),
            `"${getPlayerNames(bill).replace(/"/g, '""')}"`,
            bill.age,
            `"${bill.address.replace(/"/g, '""')}"`,
            bill.contactNumber,
            getZoneName(bill.gameZoneId),
            bill.numberOfPlayers,
            (bill.durationMinutes / 60).toFixed(1),
            bill.totalAmount.toFixed(2),
            bill.discount.toFixed(2),
            bill.finalAmount.toFixed(2),
            bill.paymentMethod
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `billing_records_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const printRecords = () => {
        window.print();
    };

    const isAdmin = currentUser.role === 'admin';

    return (
        <Card className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-6">{isAdmin ? 'Admin Dashboard' : 'Billing Records'}</h2>
            
            {isAdmin && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="p-4 bg-muted/80 lg:col-span-1">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center"><IndianRupee className="h-4 w-4 mr-2"/>Total Revenue</h3>
                        <p className="text-3xl font-bold text-primary mt-1">₹{stats.totalAllTimeRevenue.toFixed(2)}</p>
                    </Card>
                     <Card className="p-4 bg-muted/80">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center"><IndianRupee className="h-4 w-4 mr-2"/>Today's Revenue</h3>
                        <p className="text-2xl font-bold text-primary mt-1">₹{stats.totalRevenueToday.toFixed(2)}</p>
                    </Card>
                     <Card className="p-4 bg-muted/80">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center"><Users className="h-4 w-4 mr-2"/>Today's Bills</h3>
                        <p className="text-2xl font-bold mt-1">{stats.billsTodayCount}</p>
                    </Card>
                     <Card className="p-4 bg-muted/80">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center"><BarChart3 className="h-4 w-4 mr-2"/>Hot Zone</h3>
                        <p className="text-2xl font-bold mt-1">{stats.mostPopularZoneName}</p>
                    </Card>
                </div>
            )}


            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/80 rounded-lg">
                <Input placeholder="Search player name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} icon={<Search className="h-4 w-4 text-muted-foreground" />} />
                <Select value={filterZone} onChange={e => setFilterZone(e.target.value)}>
                    <option value="">All Zones</option>
                    {GAME_ZONES.map(zone => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
                </Select>
                <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                <div className="flex items-end gap-2">
                    <Button onClick={exportToCSV} variant="secondary" className="w-full">
                        <Download className="h-4 w-4 mr-2" /> CSV
                    </Button>
                    <Button onClick={printRecords} variant="outline" className="w-full print:hidden">
                        <Printer className="h-4 w-4 mr-2" /> Print
                    </Button>
                </div>
            </div>

            <h3 className="text-2xl font-bold mb-4 mt-8">All Records</h3>
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left">
                    <thead className="bg-muted">
                        <tr className="border-b border-border">
                            <th className="p-3 text-sm font-semibold">Date</th>
                            <th className="p-3 text-sm font-semibold">Players</th>
                            <th className="p-3 text-sm font-semibold text-center">Payer Age</th>
                            <th className="p-3 text-sm font-semibold text-right">Final Amount</th>
                            <th className="p-3 text-sm font-semibold text-center">Payment</th>
                            {isAdmin && <th className="p-3 text-sm font-semibold text-center print:hidden">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBills.length > 0 ? filteredBills.map((bill, index) => (
                            <tr key={bill.id} className={`border-b border-border transition-colors hover:bg-muted ${index % 2 !== 0 ? 'bg-muted/50' : ''}`}>
                                <td className="p-3 text-sm text-muted-foreground">{format(new Date(bill.createdAt), 'MMM d, h:mm a')}</td>
                                <td className="p-3 font-medium">{getPlayerNames(bill)}</td>
                                <td className="p-3 text-center">{bill.age}</td>
                                <td className="p-3 font-mono text-right font-semibold text-primary">₹{bill.finalAmount.toFixed(2)}</td>
                                <td className="p-3 text-center text-sm">{bill.paymentMethod}</td>
                                {isAdmin && (
                                    <td className="p-3 text-center print:hidden">
                                        <Button variant="destructive" size="icon" onClick={() => handleDelete(bill.id)}>
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete Bill</span>
                                        </Button>
                                    </td>
                                )}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={isAdmin ? 6 : 5} className="text-center p-8 text-muted-foreground">No records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default BillingRecords;