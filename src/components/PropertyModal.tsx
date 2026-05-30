'use client';
import { Property } from '@/types';
import { X, ShieldCheck, Square, Bed, MapPin, ChevronLeft, ChevronRight, Layers, Map, FileText } from 'lucide-react';
import { useState, useRef } from 'react';

interface ModalProps {
  property: Property | null;
  onClose: () => void;
}

export default function PropertyModal({ property, onClose }: ModalProps) {
  const [showSoDo, setShowSoDo] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);

  if (!property) return null;

  const danhSachAnh = property.anh ? property.anh.split(',').map(url => url.trim()).filter(Boolean) : [];
  const tongSoMuc = danhSachAnh.length + (property.videoUrl ? 1 : 0);

  const scrollSlide = (direction: 'left' | 'right') => {
    if (slideRef.current) {
      const width = slideRef.current.clientWidth;
      slideRef.current.scrollBy({ left: direction === 'right' ? width : -width, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl relative max-h-[92vh] sm:max-h-[88vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 z-50 w-8 h-8 bg-slate-900/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-slate-900 transition-all shadow">
          <X className="w-4 h-4" />
        </button>

        <div className="overflow-y-auto flex-1 no-scrollbar">
          <div className="w-full relative aspect-[16/10] bg-slate-100">
            <div ref={slideRef} className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
              {property.videoUrl && (
                <div className="w-full h-full flex-shrink-0 snap-start snap-always relative">
                  <iframe className="w-full h-full" src={property.videoUrl} allowFullScreen></iframe>
                </div>
              )}
              {danhSachAnh.map((url, idx) => (
                <div key={idx} className="w-full h-full flex-shrink-0 snap-start snap-always">
                  <img src={url} alt={property.tieude} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {tongSoMuc > 1 && (
              <>
                <button onClick={() => scrollSlide('left')} className="absolute left-3 top-1/2 -translate-y-1/2 z-40 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => scrollSlide('right')} className="absolute right-3 top-1/2 -translate-y-1/2 z-40 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center"><ChevronRight className="w-5 h-5" /></button>
                <div className="bg-slate-900/60 text-white text-[10px] font-bold px-2.5 py-1 rounded absolute top-4 left-4 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-400" /> {property.videoUrl ? '1 Video & ' : ''}{danhSachAnh.length} Ảnh
                </div>
              </>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <span className="bg-amber-100 text-amber-900 font-extrabold text-base px-3 py-1 rounded-xl shadow-sm">{property.gia}</span>
              <span className="text-xs text-slate-400 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mr-1" /> {property.phapLy || 'Sổ hồng sẵn sàng'}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 mt-4 leading-snug">{property.tieude}</h1>

            <div className="grid grid-cols-3 gap-2 my-5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-center text-sm font-semibold">
              <div><div className="text-slate-400 text-[11px] font-bold uppercase">Diện tích</div><strong className="text-slate-900">{property.dienTich}</strong></div>
              <div><div className="text-slate-400 text-[11px] font-bold uppercase">Cấu trúc</div><strong className="text-slate-900">{property.phongNgu || 'Đất ở'}</strong></div>
              <div><div className="text-slate-400 text-[11px] font-bold uppercase">Hướng</div><strong className="text-slate-900">{property.huong || 'Chưa rõ'}</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {property.linkMap && <a href={property.linkMap} target="_blank" className="bg-emerald-50 text-emerald-700 py-2.5 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1"><Map className="w-4 h-4"/> Bản Đồ Vị Trí</a>}
              {property.anhSoDo && <button onClick={() => setShowSoDo(true)} className="bg-indigo-50 text-indigo-700 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1"><FileText className="w-4 h-4"/> Sổ Đỏ Bản Vẽ</button>}
            </div>
            <p className="text-slate-700 text-sm whitespace-pre-line text-justify leading-relaxed">{property.moTa}</p>
          </div>
        </div>
      </div>

      {showSoDo && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4">
          <button onClick={() => setShowSoDo(false)} className="absolute top-4 right-4 text-white hover:text-slate-300"><X className="w-8 h-8"/></button>
          <img src={property.anhSoDo} alt="Sổ đỏ chính chủ" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
}