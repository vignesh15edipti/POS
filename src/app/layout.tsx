import type { Metadata } from 'next';
import './globals.css';
import { POSProvider } from '../context/POSContext';

export const metadata: Metadata = {
  title: 'TN FRESHKART GREEN - Smart Grocery POS',
  description: 'Fast and reliable Grocery POS, inventory management & GST accounting application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F8FAFC]">
        <POSProvider>
          {children}
        </POSProvider>
      </body>
    </html>
  );
}
