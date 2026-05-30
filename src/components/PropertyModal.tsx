'use client';
import { Property } from '@/types';
import { 
  X, ShieldCheck, Square, Bed, MapPin, ChevronLeft, 
  ChevronRight, Layers, Map, FileText, Calendar, Clock, Phone 
} from 'lucide-react';
import { useState, useRef } from 'react';

interface ModalProps {
  property: Property | null;
  onClose: () => void;
}

export default function PropertyModal({ property, onClose }: ModalProps) {
  const [showSoDo, setShowSoDo] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);

  if (!property) return null;

  // Xử lý tách mảng hình ảnh từ chuỗi ngăn cách bằng dấu phẩy
  const danhSachAnh = property.anh ? property.anh.split(',').map(url => url.trim()).filter(Boolean) : [];
  const tongSoMuc = danhSachAnh.length + (property.videoUrl ? 1 : 0);

  // Hàm bổ trợ tính khoảng thời gian đăng (Giống trang chủ)
  const chuyenDoiNgayThangChuan = (ngayDangStr: any) => {
    if (!ngayDangStr) return null;
    const chuoiSach = ngayDangStr.toString().replace(/[\r\n\t]/g, "").trim();
    if (!chuoiSach) return null;
    const parts = chuoiSach.split(/[-/]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) return new Date(year, month, day);
    }
    return null;
  };

  const tinhThoiGianCachDay = (ngayDangStr: any) => {
    const ngayDang = chuyenDoiNgayThangChuan(ngayDangStr);
    if (!ngayDang) return "Tin mới";
    const homNay = new Date();
    ngayDang.setHours(0,0,0,0); homNay.setHours(0,0,0,0);
    const soNgay = Math.floor((homNay.getTime() - ngayDang.getTime()) / (1000 * 60 * 60 * 24));
    if (soNgay <= 0) return "Hôm nay";
    if (soNgay === 1) return "1 ngày trước";
    if (soNgay < 7) return `${soNgay} ngày trước`;
    const soTuan = Math.floor(soNgay / 7);
    if (soTuan < 4) return `${soTuan} tuần trước`;
    const soThang = Math.floor(soNgay / 30);
    if (soThang < 12) return `${soThang} tháng trước`;
    return `${ngayDang.getDate()}/${ngayDang.getMonth() + 1}/${ngayDang.getFullYear()}`;
  };

  const vanBanCachDay = tinhThoiGianCachDay(property.ngayDang);
  const ngaySachDinhDang = property.ngayDang ? property.ngayDang.toString().replace(/[\r\n\t]/g, "").trim().replace(/-/g, '/') : '';

  const scrollSlide = (direction: 'left' | 'right') => {
    if (slideRef.current) {
      const width = slideRef.current.clientWidth;
      slideRef.current.scrollBy({ left: direction === 'right' ? width : -width, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl relative max-h-[92vh] sm:max-h-[88vh] flex flex-col">
        {/* Nút đóng chủ động */}
        <button onClick={onClose} className="absolute top-4 right-4 z-50 w-8 h-8 bg-slate-900/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-slate-900 transition-all shadow">
          <X className="w-4 h-4" />
        </button>

        <div className="overflow-y-auto flex-1 no-scrollbar">
          {/* KHU VỰC TRÌNH CHIẾU MEDIA FLIP SLIDE */}
          <div className="w-full relative aspect-[16/10] bg-slate-100">
            <div ref={slideRef} className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
              {property.videoUrl && (
                <div className="w-full h-full flex-shrink-0 snap-start snap-always relative">
                  <iframe className="w-full h-full" src={property.videoUrl} frameBorder="0" allowFullScreen></iframe>
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
                <button onClick={() => scrollSlide('left')} className="absolute left-3 top-1/2 -translate-y-1/2 z-40 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center active:scale-90 transition-transform"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => scrollSlide('right')} className="absolute right-3 top-1/2 -translate-y-1/2 z-40 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center active:scale-90 transition-transform"><ChevronRight className="w-5 h-5" /></button>
                <div className="bg-slate-900/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-md absolute top-4 left-4 z-10 flex items-center gap-1 shadow-sm uppercase tracking-wider">
                  <Layers className="w-3 h-3 text-amber-400" /> Giỏ hàng: {property.videoUrl ? '1 Video & ' : ''}{danhSachAnh.length} Ảnh
                </div>
              </>
            )}
          </div>

          {/* KHU VỰC THÔNG TIN CHI TIẾT BÊN TRONG MODAL */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <span className="bg-amber-100 text-amber-900 font-extrabold text-base px-3 py-1 rounded-xl shadow-sm">{property.gia}</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mr-1" />{property.phapLy || 'Sổ hồng sẵn sàng'}
              </span>
            </div>
            
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 mt-4 leading-snug">{property.tieude}</h1>
            
            {/* Thanh thông tin ngày đăng, vị trí */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400 text-xs mt-2 border-b border-slate-100 pb-4 font-semibold">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" />{property.khuVucFull}</span>
              {ngaySachDinhDang && (
                <>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" />Đăng: {ngaySachDinhDang}</span>
                  <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md text-[10px] uppercase">{vanBanCachDay}</span>
                </>
              )}
            </div>
            
            {/* Bảng thông số kỹ thuật 3 cột */}
            <div className="grid grid-cols-3 gap-2 my-5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 text-center font-semibold shadow-inner">
              <div><div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Diện diện tích</div><strong className="text-slate-900 text-sm sm:text-base">{property.dienTich}</strong></div>
              <div><div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Cấu trúc</div><strong className="text-slate-900 text-sm sm:text-base">{property.phongNgu || 'Đất ở'}</strong></div>
              <div><div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Hướng</div><strong className="text-slate-900 text-sm sm:text-base">{property.huong || 'Chưa rõ'}</strong></div>
            </div>
            
            {/* Bộ đôi nút liên kết Bản đồ vị trí & Trích lục sổ đỏ */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {property.linkMap && (
                <a href={property.linkMap} target="_blank" rel="noopener noreferrer" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 rounded-xl py-2.5 px-3 text-center text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                  <Map className="w-4 h-4" /> Bản Đồ Vị Trí
                </a>
              )}
              {property.anhSoDo && (
                <button onClick={() => setShowSoDo(true)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded-xl py-2.5 px-3 text-center text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                  <FileText className="w-4 h-4" /> Sổ Đỏ Bản Vẽ
                </button>
              )}
            </div>

            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">Mô tả thực tế nhà đất:</h4>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed text-justify whitespace-pre-line mb-6">{property.moTa}</p>
            
            {/* Bộ đôi nút gọi điện thương lượng nhanh ở đáy Modal */}
            <div className="flex gap-3 mt-4 border-t border-slate-100 pt-4">
              <a href="tel:0931555551" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-sm transition-all active:scale-95 shadow-md">
                <Phone className="w-4 h-4 text-amber-400 fill-amber-400" /> Gọi Thỏa Thuận
              </a>
              <a href="https://zalo.me/0931555551" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#0068ff] hover:opacity-90 text-white font-extrabold rounded-xl py-3 px-4 flex items-center justify-center text-sm transition-all active:scale-95 shadow-md">
                Liên Hệ Zalo
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP PHÓNG TO XEM SỔ ĐỎ CHI TIẾT */}
      {showSoDo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <button onClick={() => setShowSoDo(false)} className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all">
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-3xl w-full max-h-[85vh] flex items-center justify-center overflow-hidden rounded-xl">
            <img src={property.anhSoDo} alt="Bản vẽ sơ đồ sổ đỏ trích lục chi tiết" className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
