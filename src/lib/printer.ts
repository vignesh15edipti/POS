// lib/printer.ts
// This utility handles direct communication with a locally connected thermal printer.
// It bypasses the browser's default print dialog to enable automatic, silent printing.
// In a real-world scenario, this might connect to a local WebSocket server (like QZ Tray),
// Web Serial API, Web Bluetooth, or a local proxy server running on the POS machine.

export interface PrintLineItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

export interface PrintReceiptData {
  shopName: string;
  billNumber: string;
  date: string;
  items: PrintLineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  cashTendered?: number;
  changeReturned?: number;
}

export class ThermalPrinterService {
  private isConnected = false;

  constructor() {
    // Initialize connection to local printer bridge if necessary
    // e.g., connect to QZ Tray WebSocket
    this.isConnected = true;
  }

  /**
   * Generates ESC/POS compatible raw commands for the receipt
   * and sends it to the local printer.
   */
  public async printReceipt(data: PrintReceiptData): Promise<boolean> {
    if (!this.isConnected) {
      console.warn("Thermal printer bridge not connected.");
      return false;
    }

    try {
      // 1. Build the raw ESC/POS receipt string
      // This is a simplified simulation of ESC/POS commands.
      // In production, this would be an ArrayBuffer of hex commands.
      
      let receiptText = "";
      
      // Center & Bold for Header
      receiptText += "\x1B\x61\x01"; // Center align
      receiptText += "\x1B\x45\x01"; // Bold ON
      receiptText += `${data.shopName}\n`;
      receiptText += "\x1B\x45\x00"; // Bold OFF
      receiptText += "\x1B\x61\x00"; // Left align
      
      receiptText += "--------------------------------\n";
      receiptText += `Bill No: ${data.billNumber}\n`;
      receiptText += `Date: ${data.date}\n`;
      receiptText += "--------------------------------\n";
      receiptText += "Item                 Qty   Total\n";
      receiptText += "--------------------------------\n";

      data.items.forEach(item => {
        // Truncate name to fit 58mm width (roughly 32 chars total per line)
        const name = item.name.substring(0, 15).padEnd(15, ' ');
        const qtyStr = `${item.quantity}${item.unit}`.padStart(6, ' ');
        const totalStr = item.subtotal.toFixed(2).padStart(8, ' ');
        
        receiptText += `${name} ${qtyStr} ${totalStr}\n`;
      });

      receiptText += "--------------------------------\n";
      receiptText += `Subtotal:           ${data.subtotal.toFixed(2).padStart(10, ' ')}\n`;
      
      if (data.discount > 0) {
        receiptText += `Discount:          -${data.discount.toFixed(2).padStart(10, ' ')}\n`;
      }
      
      receiptText += "\x1B\x45\x01"; // Bold ON
      receiptText += `GRAND TOTAL:        ${data.grandTotal.toFixed(2).padStart(10, ' ')}\n`;
      receiptText += "\x1B\x45\x00"; // Bold OFF
      
      receiptText += "--------------------------------\n";
      receiptText += `Paid By: ${data.paymentMethod}\n`;
      
      if (data.cashTendered && data.changeReturned) {
        receiptText += `Cash Tendered:      ${data.cashTendered.toFixed(2).padStart(10, ' ')}\n`;
        receiptText += `Change:             ${data.changeReturned.toFixed(2).padStart(10, ' ')}\n`;
      }

      receiptText += "--------------------------------\n";
      receiptText += "\x1B\x61\x01"; // Center align
      receiptText += "Thank you for shopping!\n\n\n";
      
      // Cut paper command
      receiptText += "\x1D\x56\x41\x10";

      // 2. Send the raw data to the printer bridge
      // Example: await fetch('http://localhost:8080/print', { method: 'POST', body: receiptText });
      console.log("=== SENDING TO THERMAL PRINTER ===");
      console.log(receiptText);
      console.log("=== PRINT COMPLETE ===");

      return true;
    } catch (error) {
      console.error("Failed to print to thermal printer:", error);
      return false;
    }
  }
}

export const thermalPrinter = new ThermalPrinterService();
