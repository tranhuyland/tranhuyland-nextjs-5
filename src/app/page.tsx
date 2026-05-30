'use client';
import { useState, useEffect } from 'react';
import PropertyModal from '@/components/PropertyModal';
import { Property } from '@/types';
import { MapPin, PlusCircle, ShieldCheck, Building2, Map, Car, Phone, MessageSquare } from 'lucide-react';

const GOOGLE_SHEET_CSV = "https://docs.google.com/spreadsheets/d/1-LupBV6uNuUitz4vF6pFv6MupuVDMujafqhjQBNNPTA/export?format=csv";

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filtered, setFiltered] = useState<Property[]>([]);
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);

  const [khuVuc, setKhuVuc] = useState('all');
  const [loaiHinh, setLoaiHinh] = useState('all');
  const [gia, setGia] = useState('all');
  const [huong, setHuong] = useState('all');
  const [activeTag, setActiveTag] = useState('all');

  useEffect(() => {
    async function getSheetData() {
      try {
        const res = await fetch(`${GOOGLE_SHEET_CSV}&t=${new Date().getTime()}`);
        const text = await res.text();
        const lines = text.split('\n');
        if (lines.length === 0) return;
        const headers = lines[0].split(',').map(h => h.trim().replace(/[\"\']/g, ""));
        const dataResult: Property[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const currentLine: string[] = [];

          let insideQuote = false;
          let entries = "";
          for (let j = 0; j < lines[i].length; j++) {
            let char = lines[i][j];
            if (char === '"') insideQuote = !insideQuote;
            else if (char === ',' && !insideQuote) {
              currentLine.push(entries.trim());
              entries = "";
            } else entries += char;
          }
          currentLine.push(entries.trim());

          if (currentLine.length >= headers.length) {
            const obj: any = {};
            headers.forEach((h, idx) => {
              let val = currentLine[idx] ? currentLine[idx].replace(/[\"\']/g, "") : "";
              if (h === 'id') obj[h] = parseInt(val) || i;
              else if (h === 'soGia') obj[h] = parseFloat(val) || 0;
              else obj[h] = val.trim();
            });
            dataResult.push(obj as Property);
          }
        }
        setProperties(dataResult);
        setFiltered(dataResult);
      } catch (e) {
        console.error(e);
      }
    }
    getSheetData();
  }, []);

  useEffect(() => {
    let result = properties;
    if (khuVuc !== 'all') result = result.filter(p => p.khuVuc === khuVuc);
    if (loaiHinh !== 'all') result = result.filter(p => p.loaiHinh === loaiHinh);
    if (huong !== 'all') result = result.filter(p => p.huong?.toLowerCase().includes(huong.toLowerCase()));
    if (gia !== 'all') {
      if (gia === 'duoi3') result = result.filter(p => p.soGia < 3.0);
      else if (gia === '3to5') result = result.filter(p => p.soGia >= 3.0 && p.soGia <= 5.0);
      else if (gia === 'tren5') result = result.filter(p => p.soGia > 5.0);
    }
    if (activeTag === 'mattien') result = result.filter(p => p.isMatTien === true || p.isMatTien === 'TRUE');
    else if (activeTag === 'chinhchu') result = result.filter(p => p.tag?.includes("Chính Chủ"));

    setFiltered(result);
  }, [khuVuc, loaiHinh, gia, huong, activeTag, properties]);

  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 glass border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="https://i.postimg.cc/JhKg8VZ9/70554272-47DB-4D3A-A1AE-2782EFCAF00F.png" alt="Trần Huy Land" className="h-9 sm:h-11 w-auto object-contain select-none" />
            <div>
              <h1 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">TRẦN HUY LAND</h1>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Giỏ Hàng Thật • Pháp Lý Minh Bạch</p>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#" className="hover:text-slate-900 transition-all">Trang Chủ</a>
            <a href="#listing-section" className="hover:text-slate-900 transition-all">Nhà Đất Đang Bán</a>
          </nav>
          <button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm">
            <PlusCircle className="w-4 h-4" /> Ký Gửi Nhanh
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="hero-bg text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold mb-6 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> KHO NHÀ ĐẤT CHÍNH CHỦ ĐÀ NẴNG
            </div>
            <h2 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6">Nhà Thật • Giá Thật • Giao Dịch Minh Bạch</h2>
            <div className="flex flex-wrap gap-4">
              <a href="tel:0931555551" className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-3.5 rounded-2xl font-extrabold shadow-lg">Liên Hệ Tư Vấn</a>
            </div>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="max-w-7xl mx-auto w-full px-4 -mt-10 relative z-10">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <select value={khuVuc} onChange={e => setKhuVuc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700">
              <option value="all">Tất cả Quận Huyện</option>
              <option value="Hải Châu">Quận Hải Châu</option>
              <option value="Cẩm Lệ">Quận Cẩm Lệ</option>
              <option value="Sơn Trà">Quận Sơn Trà</option>
            </select>
            <select value={loaiHinh} onChange={e => setLoaiHinh(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700">
              <option value="all">Tất cả Loại hình</option>
              <option value="Nhà phố">Nhà phố / Kiệt</option>
              <option value="Đất nền">Đất nền / Đất ở</option>
            </select>
            <select value={gia} onChange={e => setGia(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700">
              <option value="all">Tất cả mức giá</option>
              <option value="duoi3">Dưới 3 Tỷ</option>
              <option value="3to5">Từ 3 - 5 Tỷ</option>
              <option value="tren5">Trên 5 Tỷ</option>
            </select>
            <select value={huong} onChange={e => setHuong(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700">
              <option value="all">Tất cả các hướng</option>
              <option value="Đông">Hướng Đông</option>
              <option value="Tây">Hướng Tây</option>
              <option value="Nam">Hướng Nam</option>
              <option value="Bắc">Hướng Bắc</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 items-center">
            <button onClick={() => setActiveTag('all')} className={`text-xs font-bold px-4 py-2 rounded-xl \${activeTag === 'all' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-600'}`}>Tất Cả</button>
            <button onClick={() => setActiveTag('mattien')} className={`text-xs font-bold px-4 py-2 rounded-xl \${activeTag === 'mattien' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-600'}`}>Mặt Tiền Kinh Doanh</button>
            <button onClick={() => setActiveTag('chinhchu')} className={`text-xs font-bold px-4 py-2 rounded-xl \${activeTag === 'chinhchu' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-600'}`}>Hàng Chính Chủ</button>
          </div>
        </div>
      </section>

      {/* DỮ LIỆU ĐỘNG */}
      <main id="listing-section" className="max-w-7xl mx-auto w-full px-4 mt-16 mb-20 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map(item => {
            const listAnh = item.anh ? item.anh.split(',') : [];
            const imgTarget = listAnh[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
            return (
              <article key={item.id} onClick={() => setSelectedProp(item)} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer transform hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img src={imgTarget} alt={item.tieude} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <span className={`absolute top-3 left-3 \${item.tagColor || 'bg-slate-900'} text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg shadow-sm`}>{item.tag || 'Bán Nhà'}</span>
                  <span className="absolute bottom-3 right-3 bg-slate-900/90 text-white font-extrabold text-sm px-3 py-1 rounded-xl shadow-md">{item.gia}</span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold mb-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" /> <span className="line-clamp-1">{item.khuVucFull}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-amber-500 text-sm sm:text-base leading-snug transition-colors">{item.tieude}</h3>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <PropertyModal property={selectedProp} onClose={() => setSelectedProp(null)} />

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 text-xs mt-auto border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-white font-extrabold text-base tracking-wide">TRẦN HUY LAND</h3>
            <p className="leading-relaxed mt-2">Chuyên phân phối, nhận ký gửi môi giới nhà phố chính chủ tại địa bàn Đà Nẵng.</p>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm uppercase mb-5">Văn phòng chính thức</h4>
            <p>26 Cẩm Bá Thước, Hải Châu, Đà Nẵng</p>
            <p className="mt-2">Hotline: 0931 555 551</p>
          </div>
        </div>
        <div className="border-t border-white/5 text-center py-6 text-slate-600 font-medium">
          © 2026 Trần Huy Land. Powered by Next.js. All rights reserved.
        </div>
      </footer>
    </>
  );
}
