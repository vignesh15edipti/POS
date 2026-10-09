'use client';

import React, { useState, useEffect } from 'react';
import { Search, Printer, FileText } from 'lucide-react';
import { usePOS } from '../../../context/POSContext';
import { Product } from '../../../types/pos';
import { QRCodeSVG } from 'qrcode.react';

export default function PrintQRCodePage() {
  const { products, fetchProducts } = usePOS();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [copies, setCopies] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode.includes(search) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handlePrint = () => {
    if (!selectedProduct) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let qrcodesHtml = '';
    const qrData = JSON.stringify({
      id: selectedProduct.id,
      sku: selectedProduct.sku,
      price: selectedProduct.sellingPrice
    });

    for (let i = 0; i < copies; i++) {
      qrcodesHtml += `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 40mm; height: 40mm; border: 1px dashed #ccc; margin: 2mm; padding: 2mm; box-sizing: border-box; page-break-inside: avoid;">
          <div style="font-size: 10px; font-weight: bold; margin-bottom: 2px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">
            ${selectedProduct.name}
          </div>
          <div class="qr-placeholder" data-value='${qrData}'></div>
          <div style="font-size: 9px; margin-top: 2px;">₹${selectedProduct.sellingPrice} | SKU: ${selectedProduct.sku}</div>
        </div>
      `;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Codes</title>
          <script src="https://cdn.jsdelivr.net/npm/qrcode-svg@1.1.0/lib/qrcode.min.js"></script>
          <style>
            body { font-family: sans-serif; margin: 0; padding: 10mm; display: flex; flex-wrap: wrap; }
            @media print {
              body { padding: 0; }
              @page { margin: 0; size: auto; }
            }
          </style>
        </head>
        <body>
          ${qrcodesHtml}
          <script>
            document.querySelectorAll('.qr-placeholder').forEach(el => {
              const val = el.getAttribute('data-value');
              const qrcode = new QRCode({
                content: val,
                width: 100,
                height: 100,
                padding: 0,
                color: "#000000",
                background: "#ffffff",
                ecl: "M"
              });
              el.innerHTML = qrcode.svg();
            });
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850]">Print QR Code</h1>
          <p className="text-xs text-slate-500 mt-1">Generate and print product QR labels</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search product by name, SKU or barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-theme-blue/20 outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="max-h-[500px] overflow-y-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 sticky top-0 text-slate-500 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-3 font-bold">Product Name</th>
                    <th className="p-3 font-bold">SKU</th>
                    <th className="p-3 font-bold">Barcode</th>
                    <th className="p-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-800">{p.name}</td>
                      <td className="p-3 text-slate-600 font-mono text-xs">{p.sku}</td>
                      <td className="p-3 text-slate-600 font-mono text-xs">{p.barcode}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedProduct(p)}
                          className="px-3 py-1 bg-theme-blue/10 text-theme-blue font-bold rounded-lg text-xs hover:bg-theme-blue/20 transition-colors"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 text-sm">
                        No products found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Print Configuration */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-20">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-theme-teal" />
              Print Configuration
            </h3>

            {!selectedProduct ? (
              <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                Select a product from the list to preview its QR code.
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Selected Product</label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-theme-navy text-sm">{selectedProduct.name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">SKU: {selectedProduct.sku}</p>
                    <p className="text-xs font-bold text-theme-teal mt-1">Price: ₹{selectedProduct.sellingPrice}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Label Size</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-theme-blue/20 outline-none">
                    <option value="40x40">40mm x 40mm (Square)</option>
                    <option value="30x30">30mm x 30mm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Number of Copies</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={copies}
                    onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-theme-blue/20 outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-600 mb-4">Print Preview</label>
                  <div className="flex justify-center p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
                    <div className="flex flex-col items-center justify-center bg-white border border-slate-200 p-2 shadow-sm" style={{ width: '40mm', minHeight: '40mm' }}>
                      <p className="text-[10px] font-bold text-center truncate w-full">{selectedProduct.name}</p>
                      <div className="my-1">
                        <QRCodeSVG 
                          value={JSON.stringify({ id: selectedProduct.id, sku: selectedProduct.sku, price: selectedProduct.sellingPrice })} 
                          size={100}
                        />
                      </div>
                      <p className="text-[9px]">₹{selectedProduct.sellingPrice} | SKU: {selectedProduct.sku}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePrint}
                  className="w-full py-3 bg-theme-blue hover:bg-theme-blue/90 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print {copies} {copies === 1 ? 'Label' : 'Labels'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
