import React, { useRef } from 'react';
import { Bill } from '../types';
import { GAME_ZONES } from '../constants';
import { format } from 'date-fns';
import { Button } from './ui/Button';
import { X, Printer, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    bill: Bill;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, bill }) => {
    const receiptRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    const getZoneName = (zoneId: string) => {
        return GAME_ZONES.find(z => z.id === zoneId)?.name || 'Unknown Zone';
    };
    
    const handlePrint = () => {
        const printContent = receiptRef.current;
        if (printContent) {
            const printWindow = window.open('', '', 'height=600,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Print Bill</title>');
                printWindow.document.write('<style>body { font-family: sans-serif; -webkit-print-color-adjust: exact; } .no-print { display: none; }</style>');
                printWindow.document.write('</head><body class="bg-white text-black">');
                printWindow.document.write(printContent.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 250);
            }
        }
    };

    const handleDownloadPdf = () => {
        const input = receiptRef.current;
        if (input) {
            html2canvas(input, { scale: 2, backgroundColor: '#ffffff' }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', [105, 148]); // A6 size
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`receipt-${bill.id}.pdf`);
            });
        }
    };

    const playerNames = [bill.customerName, ...(bill.additionalPlayerNames || [])].filter(Boolean).join(', ');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-sm max-h-full overflow-y-auto flex flex-col">
                 <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Bill Generated</h2>
                    <Button onClick={onClose} variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                
                <div className="p-2 bg-muted flex-grow overflow-y-auto">
                    <div ref={receiptRef} className="p-6 bg-white text-black shadow-lg mx-auto" style={{width: '302px'}}>
                         <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold" style={{color: 'hsl(0, 84.2%, 60.2%)'}}>Gameon Den</h3>
                            <p className="text-xs">103, Old Agraharam St, Vivekananda Nagar, TNHB Mig V Block, Chennai, Avadi, Tamil Nadu 600054</p>
                        </div>

                        <div className="border-t border-b border-dashed border-gray-400 py-2 mb-4 text-xs">
                            <div className="flex justify-between"><span>Bill No:</span> <span>{bill.id}</span></div>
                            <div className="flex justify-between"><span>Date:</span> <span>{format(new Date(bill.createdAt), 'PP')}</span></div>
                            <div className="flex justify-between"><span>Time:</span> <span>{format(new Date(bill.createdAt), 'p')}</span></div>
                        </div>
                        
                         <div className="mb-4 text-xs">
                            <p><strong>Players:</strong> {playerNames}</p>
                            <p><strong>Payer Age:</strong> {bill.age}</p>
                            {bill.contactNumber && <p><strong>Contact:</strong> {bill.contactNumber} ({bill.customerName})</p>}
                            {bill.address && <p><strong>Address:</strong> {bill.address}</p>}
                        </div>
                        
                        <table className="w-full text-xs mb-4">
                            <thead>
                                <tr className="border-b border-dashed border-gray-400">
                                    <th className="text-left font-semibold py-1">Item</th>
                                    <th className="text-right font-semibold py-1">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="py-1 pt-2">{getZoneName(bill.gameZoneId)}</td>
                                    <td className="text-right py-1 pt-2"></td>
                                </tr>
                                 <tr className="text-gray-600" style={{fontSize: '10px'}}>
                                    <td className="pl-2">{bill.numberOfPlayers} Player(s) x {bill.durationMinutes / 60} hr(s)</td>
                                    <td className="text-right">@ ₹{bill.pricePerPersonPerHour.toFixed(2)}/hr</td>
                                </tr>
                                <tr className="border-t border-dashed border-gray-400">
                                    <td className="py-1 pt-2 font-semibold">Subtotal</td>
                                    <td className="text-right py-1 pt-2 font-semibold">₹{bill.totalAmount.toFixed(2)}</td>
                                </tr>
                                {bill.discount > 0 && (
                                    <tr>
                                        <td className="py-1">Discount</td>
                                        <td className="text-right py-1">- ₹{bill.discount.toFixed(2)}</td>
                                    </tr>
                                )}
                                <tr className="border-t-2 border-black">
                                    <td className="py-2 font-bold text-sm">Grand Total</td>
                                    <td className="text-right py-2 font-bold text-sm" style={{color: 'hsl(0, 84.2%, 60.2%)'}}>₹{bill.finalAmount.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="text-xs">
                            <strong>Payment Method:</strong> {bill.paymentMethod}
                        </div>
                        
                         <div className="text-center mt-6 text-gray-500" style={{fontSize: '10px'}}>
                            <p>Thank you for playing!</p>
                            <p>Visit us again.</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 flex gap-4 border-t border-border">
                    <Button onClick={handlePrint} className="w-full">
                        <Printer className="mr-2 h-4 w-4"/> Print
                    </Button>
                    <Button onClick={handleDownloadPdf} variant="secondary" className="w-full">
                        <Download className="mr-2 h-4 w-4"/> Download PDF
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;