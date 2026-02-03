
import React from 'react';
import { Mail, Star, Send, Trash, Inbox } from 'lucide-react';

export const MailboxPage = () => {
  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex animate-in fade-in slide-in-from-right-4 duration-500">
       {/* Sidebar Mail */}
       <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col">
          <button className="w-full bg-brand-600 text-white font-bold py-2 rounded-lg mb-6 shadow-sm hover:bg-brand-700 transition-colors">
             Tulis Pesan
          </button>
          
          <nav className="space-y-1">
             <div className="flex items-center justify-between px-3 py-2 bg-white rounded-md text-brand-600 font-medium shadow-sm">
                <div className="flex items-center gap-3">
                   <Inbox className="w-4 h-4" /> Inbox
                </div>
                <span className="text-xs bg-brand-100 px-1.5 py-0.5 rounded">3</span>
             </div>
             <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer transition-colors">
                <Star className="w-4 h-4" /> Berbintang
             </div>
             <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer transition-colors">
                <Send className="w-4 h-4" /> Terkirim
             </div>
             <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer transition-colors">
                <Trash className="w-4 h-4" /> Sampah
             </div>
          </nav>
       </div>

       {/* List */}
       <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white">
             <h3 className="font-bold text-gray-800">Kotak Masuk</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
             {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                   <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                      U{i}
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between mb-1">
                         <span className="font-bold text-gray-900 text-sm">User Pengguna {i}</span>
                         <span className="text-xs text-gray-400">10:3{i} AM</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">Permohonan izin akses data untuk keperluan...</p>
                   </div>
                </div>
             ))}
             <div className="p-8 text-center text-gray-400 text-sm">
                Akhir dari pesan.
             </div>
          </div>
       </div>
    </div>
  );
};