'use client';
import { useState, useEffect, useRef } from 'react';
import { Property } from '@/types';
import { 
  MapPin, PlusCircle, X, PenTool, Phone, FilePlus2, 
  Square, Bed, Compass, ChevronRight, Clock, 
  Building2, Map, Car, Layers, ShieldCheck, Calendar
} from 'lucide-react';

const LINK_CSV_GOOGLE_SHEET = "https://docs.google.com/spreadsheets/d/1-LupBV6uNuUitz4vF6pFv6MupuVDMujafqhjQBNNPTA/export?format=csv";
const ITEMS_PER_PAGE = 6;

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filtered, setFiltered] = useState<Property[]>([]);
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [showKyGuiModal, setShowKyGuiModal] = useState(false);
  const [showSoDoModal, setShowSoDoModal] = useState(false);
  const [urlAnhSoDo, setUrlAnhSoDo] = useState('');
  
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [khuVuc, setKhuVuc] = useState('all');
  const [loaiHinh, setLoaiHinh] = useState('all');
  const [gia, setGia] = useState('all');
  const [huong, setHuong] = useState('all');
  const [activeTag, setActiveTag] = useState('all');

  const [kgTen, setKgTen] = useState('');
  const [kgDiaChi, setKgDiaChi] = useState('');
  const [kgGia, setKgGia] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const [seoGoc] = useState({
    title: "Trần Huy Land | Kho Nhà Đất Chính Chủ Hải Châu Cẩm Lệ Đà Nẵng",
    desc: "Mua bán, ký gửi nhà đất chính chủ uy tín tại Hải Châu, Cẩm Lệ, Đà Nẵng. Cập nhật giỏ hàng thực tế mỗi ngày: Nhà mặt tiền Cẩm Bá Thước, nhà kiệt ô tô Cách Mạng Tháng 8. Pháp lý minh bạch, có sẵn sổ đỏ bản vẽ xem ngay."
  });

  // ĐÃ SỬA: Hàm bóc tách ngày tháng được nâng cấp để chấp nhận mọi kiểu chuỗi thô từ Excel
  function chuyenDoiNgayThangChuan(ngayDangStr: any) {
    if (!ngayDangStr) return null;
    // Làm sạch tuyệt đối các ký tự ẩn xuống dòng \r \n từ CSV
    const chuoiSach = ngayDangStr.toString().replace(/[\r\n\t]/g, "").trim();
    if (!chuoiSach) return null;

    const parts = chuoiSach.split(/[-/]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; 
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return d;
      }
    }
    return null;
  }

  function tinhThoiGianCachDay(ngayDangStr: any) {
    const ngayDang = chuyenDoiNgayThangChuan(ngayDangStr);
    if (!ngayDang) return "Tin mới";
    const homNay = new Date();
    ngayDang.setHours(0,0,0,0); homNay.setHours(0,0,0,0);
    const hieuThoiGian = homNay.getTime() - ngayDang.getTime();
    const soNgay = Math.floor(hieuThoiGian / (1000 * 60 * 60 * 24));
    if (soNgay <= 0) return "Hôm nay";
    if (soNgay === 1) return "1 ngày trước";
    if (soNgay < 7) return `${soNgay} ngày trước`;
    const soTuan = Math.floor(soNgay / 7);
    if (soTuan < 4) return `${soTuan} tuần trước`;
    const soThang = Math.floor(soNgay / 30);
    if (soThang < 12) return `${soThang} tháng trước`;
    return `${ngayDang.getDate()}/${ngayDang.getMonth() + 1}/${ngayDang.getFullYear()}`;
  }

  useEffect(() => {
    async function taiDuLieuTuSheet() {
      try {
        const res = await fetch(`${LINK_CSV_GOOGLE_SHEET}&t=${new Date().getTime()}`);
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
            else if (char === ',' && !insideQuote) { currentLine.push(entries.trim()); entries = ""; }
            else entries += char;
          }
          currentLine.push(entries.trim());

          if (currentLine.length >= headers.length) {
            const obj: any = {};
            headers.forEach((h, idx) => {
              let val = currentLine[idx] ? currentLine[idx].replace(/[\"\']/g, "") : "";
              // ĐÃ SỬA: Ép làm sạch triệt để ký tự xuống dòng ẩn \r cho từng ô dữ liệu đầu vào
              obj[h] = val.replace(/[\r\n]/g, "").trim();
              if (h === 'id') obj[h] = parseInt(val) || i;
              else if (h === 'soGia') obj[h] = parseFloat(val) || 0;
            });
            dataResult.push(obj as Property);
          }
        }
        setProperties(dataResult);
        setFiltered(dataResult);

        const urlParams = new URLSearchParams(window.location.search);
        const currentProductId = parseInt(urlParams.get('id') || '');
        if (currentProductId) {
          const target = dataResult.find(p => p.id === currentProductId);
          if (target) setSelectedProp(target);
        }
      } catch (e) { console.error(e); }
    }
    taiDuLieuTuSheet();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const currentProductId = parseInt(urlParams.get('id') || '');
      if (!currentProductId) {
        setSelectedProp(null);
        document.body.style.overflow = '';
        document.title = seoGoc.title;
      } else {
        const target = properties.find(p => p.id === currentProductId);
        if (target) setSelectedProp(target);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [properties, seoGoc]);

  useEffect(() => {
    let kq = properties;
    if (khuVuc !== 'all') kq = kq.filter(i => i.khuVuc === khuVuc);
    if (loaiHinh !== 'all') kq = kq.filter(i => i.loaiHinh === loaiHinh);
    if (gia !== 'all') {
      if (gia === 'duoi3') kq = kq.filter(i => i.soGia < 3.0);
      else if (gia === '3to5') kq = kq.filter(i => i.soGia >= 3.0 && i.soGia <= 5.0);
      else if (gia === 'tren5') kq = kq.filter(i => i.soGia > 5.0);
    }
    if (huong !== 'all') kq = kq.filter(i => i.huong && i.huong.toLowerCase().includes(huong.toLowerCase()));
    
    if (activeTag === 'mattien') kq = kq.filter(i => i.isMatTien === true || i.isMatTien === 'TRUE');
    else if (activeTag === 'chinhchu') kq = kq.filter(i => i.tag && i.tag.includes("Chính Chủ"));

    setFiltered(kq);
    setTrangHienTai(1);
  }, [khuVuc, loaiHinh, gia, huong, activeTag, properties]);

  const handleOpenProduct = (item: Property) => {
    setSelectedProp(item);
    document.body.style.overflow = 'hidden';
    window.history.pushState({ id: item.id }, "", `?id=${item.id}`);
    document.title = `${item.tieude} | Trần Huy Land`;
  };

  const handleCloseProduct = () => {
    window.history.pushState({}, "", window.location.pathname);
    setSelectedProp(null);
    document.body.style.overflow = '';
    document.title = seoGoc.title;
  };

  const handleKyGuiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mucGia = kgGia || "Thương lượng";
    const tinNhan = `Chào anh Huy, tôi muốn ký gửi nhà đất với thông tin:\n- Liên hệ: ${kgTen}\n- Địa chỉ: ${kgDiaChi}\n- Giá mong muốn: ${mucGia}`;
    navigator.clipboard.writeText(tinNhan).then(() => {
      alert("📋 Đã tự động sao chép thông tin ký gửi!\nHệ thống đang mở Zalo anh Huy, bạn chỉ cần bấm chọn 'DÁN' (Paste) và gửi đi là xong ngay nhé.");
      window.open("https://zalo.me/0931555551", "_blank");
      setShowKyGuiModal(false); setKgTen(''); setKgDiaChi(''); setKgGia('');
    }).catch(() => { window.open("https://zalo.me/0931555551", "_blank"); setShowKyGuiModal(false); });
  };

  const indexDau = (trangHienTai - 1) * ITEMS_PER_PAGE;
  const dataTrangHienTai = filtered.slice(indexDau, indexDau + ITEMS_PER_PAGE);
  const tongSoTrang = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const listHinhAnhModal = selectedProp?.anh ? selectedProp.anh.split(',').map(url => url.trim()).filter(Boolean) : [];
  const tongSoMucModal = listHinhAnhModal.length + (selectedProp?.videoUrl ? 1 : 0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
    touchStartY.current = e.changedTouches[0].screenY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('#vung-truot-anh-bds')) return;
    const hieuX = e.changedTouches[0].screenX - touchStartX.current;
    const hieuY = Math.abs(e.changedTouches[0].screenY - touchStartY.current);
    if (hieuX > 70 && hieuY < 40) {
      window.history.back();
    }
  };

  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 glass border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="https://i.postimg.cc/JhKg8VZ9/70554272-47DB-4D3A-A1AE-2782EFCAF00F.png" alt="Trần Huy Land" className="h-9 sm:h-11 w-auto object-contain select-none" />
            <div>
              <div id="logo-header">
                <h1 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">TRẦN HUY LAND</h1>
              </div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Giỏ Hàng Thật • Pháp Lý Minh Bạch</p>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#" className="hover:text-slate-900 transition-all">Trang Chủ</a>
            <a href="#listing-section" className="hover:text-slate-900 transition-all">Nhà Đất Đang Bán</a>
            <a href="#about-section" className="hover:text-slate-900 transition-all">Giới Thiệu</a>
            <a href="#blog-section" className="hover:text-slate-900 transition-all">Tin Tức Khảo Sát</a>
          </nav>
          <button onClick={() => setShowKyGuiModal(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95">
            <PlusCircle className="w-4 h-4 text-slate-900" /> Ký Gửi Nhanh
          </button>
        </div>
      </header>

      {/* HERO BANNER */}
      <section className="hero-bg text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold mb-6 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> KHO NHÀ ĐẤT CHÍNH CHỦ ĐÀ NẴNG
            </div>
            <h2 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6">Nhà Thật • Giá Thật • Giao Dịch Minh Bạch</h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
              Chuyên phân phối nhà phố, đất nền, mặt tiền kinh doanh và nhà kiệt ô tô tại Hải Châu, Cẩm Lệ, Sơn Trà... Hình ảnh khảo sát thực tế, hỗ trợ đối chiếu sổ đỏ trực tiếp từ chủ nhà.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="tel:0931555551" className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-3.5 rounded-2xl font-extrabold shadow-lg">Liên Hệ Tư Vấn</a>
              <a href="https://zalo.me/0931555551" target="_blank" className="border border-white/20 hover:bg-white/10 px-6 py-3.5 rounded-2xl font-bold transition-all flex items-center gap-2">Xem Giỏ Hàng Zalo</a>
            </div>
          </div>
        </div>
      </section>

      {/* BỘ LỌC ĐA TẦNG */}
      <section className="max-w-7xl mx-auto w-full px-4 -mt-10 relative z-10">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Khu Vực</label>
              <select value={khuVuc} onChange={e => setKhuVuc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 cursor-pointer text-slate-700">
                <option value="all">Tất cả Quận Huyện</option>
                <option value="Hải Châu">Quận Hải Châu</option>
                <option value="Thanh Khê">Quận Thanh Khê</option>
                <option value="Liên Chiểu">Quận Liên Chiểu</option>
                <option value="Cẩm Lệ">Quận Cẩm Lệ</option>
                <option value="Sơn Trà">Quận Sơn Trà</option>
                <option value="Ngũ Hành Sơn">Quận Ngũ Hành Sơn</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Loại Hình</label>
              <select value={loaiHinh} onChange={e => setLoaiHinh(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 cursor-pointer text-slate-700">
                <option value="all">Tất cả Loại hình</option>
                <option value="Nhà phố">Nhà phố / Kiệt</option>
                <option value="Đất nền">Đất nền / Đất ở</option>
                <option value="Căn hộ">Căn hộ / Chung cư</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Khoảng Giá</label>
              <select value={gia} onChange={e => setGia(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 cursor-pointer text-slate-700">
                <option value="all">Tất cả mức giá</option>
                <option value="duoi3">Dưới 3 Tỷ</option>
                <option value="3to5">Từ 3 - 5 Tỷ</option>
                <option value="tren5">Trên 5 Tỷ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 tracking-wider">Hướng Nhà</label>
              <select value={huong} onChange={e => setHuong(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-amber-500 cursor-pointer text-slate-700">
                <option value="all">Tất cả các hướng</option>
                <option value="Đông">Hướng Đông</option>
                <option value="Tây">Hướng Tây</option>
                <option value="Nam">Hướng Nam</option>
                <option value="Bắc">Hướng Bắc</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 items-center">
            <span className="text-xs font-bold text-slate-400 uppercase mr-1 tracking-wider hidden sm:inline">Lọc nhanh:</span>
            <button onClick={() => setActiveTag('all')} className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${activeTag === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-500 hover:text-slate-900'}`}>Tất Cả</button>
            <button onClick={() => setActiveTag('mattien')} className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${activeTag === 'mattien' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-500 hover:text-slate-900'}`}>Mặt Tiền Kinh Doanh</button>
            <button onClick={() => setActiveTag('chinhchu')} className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${activeTag === 'chinhchu' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-500 hover:text-slate-900'}`}>Hàng Chính Chủ</button>
          </div>
        </div>
      </section>

      {/* DANH SÁCH SẢN PHẨM */}
      <main id="listing-section" className="max-w-7xl mx-auto w-full px-4 mt-16 mb-20 flex-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
          <div>
            <p className="text-amber-500 uppercase tracking-widest text-xs font-bold mb-1.5">Giỏ hàng cập nhật liên tục</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Nhà Đất Được Quan Tâm</h2>
          </div>
          <p className="text-sm text-slate-400 font-medium">Hình ảnh khảo sát thực tế • Không tin ảo • Cập nhật tự động</p>
        </div>

        <div id="grid-bds" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {dataTrangHienTai.map(item => {
            const listAnh = item.anh ? item.anh.split(',') : [];
            const anhDaiDien = listAnh.length > 0 ? listAnh[0].trim() : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
            const vanBanCachDay = tinhThoiGianCachDay(item.ngayDang);
            const ngayDinhDangNho = item.ngayDang ? item.ngayDang.toString().replace(/[\r\n\t]/g, "").trim().replace(/-/g, '/') : '';

            return (
              <article key={item.id} onClick={() => handleOpenProduct(item)} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer transform hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img src={anhDaiDien} alt={item.tieude} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <span className={`absolute top-3 left-3 ${item.tagColor || 'bg-slate-900'} text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-sm`}>{item.tag || 'Bán Đất'}</span>
                  {item.huong && (
                    <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-slate-800 font-extrabold text-[10px] px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                      <Compass className="w-3 h-3 text-amber-500" />{item.huong}
                    </span>
                  )}
                  
                  {/* Khoảng thời gian lơ lửng trên ảnh */}
                  <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> {vanBanCachDay}
                  </span>
                  
                  <span className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-sm text-white font-extrabold text-sm px-3 py-1 rounded-xl shadow-md">{item.gia}</span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span className="line-clamp-1">{item.khuVucFull}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-amber-500 text-sm sm:text-base leading-snug transition-colors">{item.tieude}</h3>
                    
                    {/* ĐÃ CỦA ĐỒNG BỘ: Hiển thị Ngày Đăng chuỗi văn bản sạch */}
                    {ngayDinhDangNho && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" /> <span>Ngày đăng: {ngayDinhDangNho}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-slate-500 text-sm font-medium">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span><Square className="w-3.5 h-3.5 inline mr-0.5" /> {item.dienTich}</span>
                      <span><Bed className="w-3.5 h-3.5 inline mr-0.5" /> {item.phongNgu || 'Đất ở'}</span>
                    </div>
                    <span className="text-amber-500 font-bold flex items-center gap-0.5 text-xs uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">Chi tiết <ChevronRight className="w-3 h-3" /></span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* PHÂN TRANG */}
        {tongSoTrang > 1 && (
          <div className="col-span-full flex justify-center items-center gap-2 mt-8">
            {Array.from({ length: tongSoTrang }, (_, i) => i + 1).map(soTrang => (
              <button
                key={soTrang}
                onClick={() => {
                  setTrangHienTai(soTrang);
                  window.scrollTo({ top: document.getElementById('listing-section')!.offsetTop - 90, behavior: 'smooth' });
                }}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                  soTrang === trangHienTai 
                    ? 'bg-amber-500 text-slate-900 shadow-sm font-extrabold scale-105' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {soTrang}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* GIỚI THIỆU */}
      <section id="about-section" className="bg-white border-t border-b border-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-xl flex flex-col justify-center">
            <p className="text-amber-400 uppercase tracking-widest text-xs font-bold mb-3">VÌ SAO CHỌN TRẦN HUY LAND</p>
            <h3 className="text-3xl font-extrabold leading-tight mb-6">Chuyên Nhà Đất Thực Tế Tại Đà Nẵng</h3>
            <div className="space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
              <div>
                <h4 className="text-white font-bold mb-1.5 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Hình Ảnh & Vị Trí Thật</h4>
                <p className="text-slate-400 text-sm">Cam kết hạn chế tối đa tin ảo, hình minh họa sai lệch thực tế hoặc nhà đã giao dịch xong làm mất thời gian khách hàng.</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-1.5 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Hỗ Trợ Pháp Lý Minh Bạch</h4>
                <p className="text-slate-400 text-sm">Kiểm tra quy hoạch đô thị, hỗ trợ xem trực tiếp bản vẽ sổ hồng gốc và thương lượng giá cả trực tiếp với chủ tài sản.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center bg-slate-50 border border-slate-100 p-8 sm:p-12 rounded-[2.5rem]">
            <p className="text-amber-500 uppercase tracking-widest text-xs font-bold mb-2">THỊ TRƯỜNG ĐÀ NẴNG</p>
            <h3 className="text-3xl font-extrabold text-slate-900 leading-tight mb-5">Phân Tích Địa Bàn Nổi Bật</h3>
            <div className="text-slate-600 text-sm sm:text-base leading-relaxed space-y-4 text-justify">
              <p>Thị trường nhà đất Đà Nẵng hiện đang tập trung dòng tiền mạnh tại khu vực Hải Châu, Cẩm Lệ và Sơn Trà nhờ hạ tầng giao thông đồng bộ, mật độ cư dân sầm uất và tính khai thác mặt bằng kinh doanh dòng tiền vượt trội.</p>
              <p>Trong khi phân khúc nhà mặt tiền trung tâm phù hợp dòng tiền lớn cho thuê, phân khúc nhà trong kiệt rộng ô tô đỗ cửa tại Cẩm Lệ luôn được các hộ gia đình trẻ săn đón nhiệt tình vì phù hợp nhu cầu định cư an toàn lâu dài.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section id="blog-section" className="max-w-7xl mx-auto w-full px-4 py-20">
        <div className="mb-10 text-center sm:text-left">
          <p className="text-amber-500 uppercase tracking-widest text-xs font-bold mb-2">GÓC CHIA SẺ KINH NGHIỆM</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Tin Tức & Kiến Thức Thị Trường</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4"><Building2 className="w-5 h-5" /></div>
            <h3 className="font-extrabold text-lg mb-3 text-slate-900 hover:text-amber-500 transition-colors">Có Nên Mua Nhà Hải Châu?</h3>
            <p className="text-slate-500 text-sm leading-relaxed text-justify">Phân tích chuyên sâu về tiềm năng tăng giá bền vững, mật độ tiện ích công cộng và nhu cầu sở hữu bất động sản lõi đô thị trung tâm Đà Nẵng.</p>
          </article>
          <article className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4"><Map className="w-5 h-5" /></div>
            <h3 className="font-extrabold text-lg mb-3 text-slate-900 hover:text-amber-500 transition-colors">Kinh Nghiệm Mua Đất Sơn Trà</h3>
            <p className="text-slate-500 text-sm leading-relaxed text-justify">Những lưu ý pháp lý quan trọng cốt lõi, kiểm tra tranh chấp ranh giới và khoảng cách an toàn khi chọn mua đất thổ cư gần biển Đà Nẵng.</p>
          </article>
          <article className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4"><Car className="w-5 h-5" /></div>
            <h3 className="font-extrabold text-lg mb-3 text-slate-900 hover:text-amber-500 transition-colors">Nhà Kiệt Ô Tô Là Gì?</h3>
            <p className="text-slate-500 text-sm leading-relaxed text-justify">Định nghĩa lộ giới kiệt hẻm tissue chuẩn, giải thích ưu nhược điểm thực tế và cách thẩm định giá khi tìm mua phân khúc nhà kiệt ô tô ở thực.</p>
          </article>
        </div>
      </section>

      {/* KÝ GỬI */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-[2.5rem] p-10 lg:p-14 text-slate-900 shadow-md">
          <div className="max-w-3xl">
            <p className="uppercase tracking-widest text-xs font-bold mb-3 tracking-wider text-slate-900/80">KÝ GỬI CHÍNH CHỦ</p>
            <h2 className="text-3xl lg:text-5xl font-extrabold leading-tight mb-5">Cần Bán Nhanh Nhà Đất Tại Đà Nẵng?</h2>
            <p className="text-base lg:text-lg leading-relaxed mb-8 font-medium text-slate-800">
              Anh/Chị chủ nhà chỉ cần gửi thông tin sơ bộ qua hệ thống ký gửi trực tuyến hoặc liên hệ trực tiếp Zalo để được hỗ trợ kiểm tra pháp lý, khảo sát quay dựng hình ảnh bài bản và tiếp cận khách hàng thực tế nhanh nhất.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setShowKyGuiModal(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-7 py-4 rounded-2xl font-extrabold transition-all shadow-xl active:scale-95 text-sm">Ký Gửi Trực Tuyến</button>
              <a href="tel:0931555551" className="border border-slate-900 hover:bg-slate-900/10 px-7 py-4 rounded-2xl font-extrabold transition-all text-sm flex items-center gap-2">Hotline hỗ trợ: 0931 555 551</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 text-xs mt-auto border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <img src="https://i.postimg.cc/JhKg8VZ9/70554272-47DB-4D3A-A1AE-2782EFCAF00F.png" alt="Trần Huy Land" className="h-10 w-auto object-contain select-none" />
              <div>
                <h3 className="text-white font-extrabold text-base tracking-wide">TRẦN HUY LAND</h3>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Giỏ Hàng Nhà Đất Thực Tế</p>
              </div>
            </div>
            <p className="leading-relaxed text-slate-400">Chuyên phân phối, nhận ký gửi môi giới nhà phố, đất nền thổ cư, mặt tiền kinh doanh chính chủ tại địa bàn Đà Nẵng.</p>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">KHU VỰC KHẢO SÁT CHÍNH</h4>
            <ul className="space-y-3 text-slate-400 text-sm font-medium">
              <li>Nhà đất Quận Hải Châu</li>
              <li>Nhà đất Quận Cẩm Lệ</li>
              <li>Nhà đất Quận Sơn Trà</li>
              <li>Thị trường Bất Động Sản Đà Nẵng</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">THÔNG TIN LIÊN HỆ CHÍNH THỨC</h4>
            <ul className="space-y-3 text-slate-400 text-sm font-medium">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-500" /> Văn phòng: 26 Cẩm Bá Thước, Hải Châu, Đà Nẵng</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-500" /> Hotline tư vấn: 0931 555 551</li>
              <li className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-slate-500" /> Kênh kết nối: zalo.me/0931555551</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 text-center py-6 text-slate-600 font-medium max-w-7xl mx-auto px-4">
          © 2026 Trần Huy Land. Toàn bộ cấu trúc mã nguồn được tối ưu tự động hóa dữ liệu cấu trúc Google SEO. All rights reserved.
        </div>
      </footer>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 flex gap-3 z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <button onClick={() => setShowKyGuiModal(true)} className="flex-[2] bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold rounded-xl py-3 px-4 flex items-center justify-center gap-1.5 text-sm shadow-sm active:scale-95 transition-all"><FilePlus2 className="w-4 h-4" /> Ký Gửi Nhanh</button>
        <a href="tel:0931555551" className="flex-[1.5] bg-slate-900 text-white font-bold rounded-xl py-3 px-4 flex items-center justify-center gap-1.5 text-sm transition-transform active:scale-95 shadow-md"><Phone className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Gọi Ngay</a>
        <a href="https://zalo.me/0931555551" target="_blank" className="flex-[1.5] bg-[#0068ff] text-white font-bold rounded-xl py-3 px-4 flex items-center justify-center text-sm transition-transform active:scale-95 shadow-md">Zalo</a>
      </div>

      {/* DESKTOP FLOATING BUTTONS */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col gap-3">
        <a href="https://zalo.me/0931555551" target="_blank" className="w-14 h-14 rounded-full bg-[#0068ff] text-white flex items-center justify-center shadow-2xl font-bold text-lg hover:scale-105 transition-transform">Zalo</a>
        <a href="tel:0931555551" className="w-14 h-14 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center shadow-2xl floating"><Phone className="w-5 h-5 text-slate-900 fill-slate-900/10" /></a>
      </div>

      {/* DETAIL MODAL WITH SWIPE BACK TO CLOSE */}
      {selectedProp && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div ref={modalRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl relative max-h-[92vh] sm:max-h-[88vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <button onClick={handleCloseProduct} className="absolute top-4 right-4 z-50 w-8 h-8 bg-slate-900/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-slate-900 transition-all shadow">
              <X className="w-4 h-4" />
            </button>
            <div className="overflow-y-auto flex-1 no-scrollbar">
              <div className="w-full relative aspect-[16/10] bg-slate-100">
                <div id="vung-truot-anh-bds" ref={slideRef} className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
                  {selectedProp.videoUrl && (
                    <div className="w-full h-full flex-shrink-0 snap-start snap-always relative">
                      <iframe className="w-full h-full" src={selectedProp.videoUrl} frameBorder="0" allowFullScreen></iframe>
                    </div>
                  )}
                  {listHinhAnhModal.map((url, idx) => (
                    <div key={idx} className="w-full h-full flex-shrink-0 snap-start snap-always">
                      <img src={url} alt={selectedProp.tieude} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                {tongSoMucModal > 1 && (
                  <div className="bg-slate-900/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-md absolute top-4 left-4 z-10 flex items-center gap-1 shadow-sm uppercase tracking-wider">
                    <Layers className="w-3 h-3 text-amber-400" /> Giỏ hàng: {selectedProp.videoUrl ? '1 Video & ' : ''}{listHinhAnhModal.length} Ảnh
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="bg-amber-100 text-amber-900 font-extrabold text-base px-3 py-1 rounded-xl shadow-sm">{selectedProp.gia}</span>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100"><ShieldCheck className="w-4 h-4 inline text-emerald-500 mr-1" />{selectedProp.phapLy || 'Sổ hồng sẵn sàng'}</span>
                </div>
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 mt-4 leading-snug">{selectedProp.tieude}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400 text-xs mt-2 border-b border-slate-100 pb-4 font-semibold">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" />{selectedProp.khuVucFull}</span>
                  {selectedProp.ngayDang && (
                    <>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" />Đăng: {selectedProp.ngayDang.toString().replace(/[\r\n\t]/g, "").trim().replace(/-/g, '/')}</span>
                      <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md text-[10px] uppercase">{tinhThoiGianCachDay(selectedProp.ngayDang)}</span>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 my-5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 text-center font-semibold shadow-inner">
                  <div><div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Diện tích</div><strong className="text-slate-900 text-sm sm:text-base">{selectedProp.dienTich}</strong></div>
                  <div><div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Cấu trúc</div><strong className="text-slate-900 text-sm sm:text-base">{selectedProp.phongNgu || 'Đất ở'}</strong></div>
                  <div><div className="text-slate-400 text-[11px] font-bold uppercase mb-0.5 tracking-wider">Hướng</div><strong className="text-slate-900 text-sm sm:text-base">{selectedProp.huong || 'Chưa rõ'}</strong></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {selectedProp.linkMap && <a href={selectedProp.linkMap} target="_blank" rel="noopener noreferrer" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 rounded-xl py-2.5 px-3 text-center text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm"><Map className="w-4 h-4" /> Bản Đồ Vị Trí</a>}
                  {selectedProp.anhSoDo && <button onClick={() => { setUrlAnhSoDo(selectedProp.anhSoDo); setShowSoDoModal(true); }} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded-xl py-2.5 px-3 text-center text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm"><FilePlus2 className="w-4 h-4" /> Sổ Đỏ Bản Vẽ</button>}
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">Mô tả thực tế nhà đất:</h4>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed text-justify whitespace-pre-line mb-6">{selectedProp.moTa}</p>
                <div className="flex gap-3 mt-4 border-t border-slate-100 pt-4">
                  <a href="tel:0931555551" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-sm transition-all active:scale-95 shadow-md"><Phone className="w-4 h-4 text-amber-400 fill-amber-400" /> Gọi Thỏa Thuận</a>
                  <a href="https://zalo.me/0931555551" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#0068ff] hover:opacity-90 text-white font-extrabold rounded-xl py-3 px-4 flex items-center justify-center text-sm transition-all active:scale-95 shadow-md">Liên Hệ Zalo</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SỔ ĐỎ */}
      {showSoDoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <button onClick={() => { setShowSoDoModal(false); setUrlAnhSoDo(''); }} className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all"><X className="w-6 h-6" /></button>
          <div className="max-w-3xl w-full max-h-[85vh] flex items-center justify-center overflow-hidden rounded-xl">
            <img src={urlAnhSoDo} alt="Bản vẽ sơ đồ sổ đỏ trích lục chi tiết" className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-xl" />
          </div>
        </div>
      )}

      {/* MODAL KÝ GỬI */}
      {showKyGuiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6 relative">
            <button onClick={() => setShowKyGuiModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            <h3 className="font-extrabold text-slate-900 text-base mb-1 flex items-center gap-2"><PenTool className="text-amber-500 w-4 h-4" /> Ký Gửi Nhanh Trong 10s</h3>
            <p className="text-xs text-slate-400 mb-4">Thông tin đăng ký sẽ tự động soạn thảo để gửi trực tiếp sang ứng dụng Zalo của anh Huy.</p>
            <form onSubmit={handleKyGuiSubmit} className="space-y-3 text-sm">
              <div><label className="block font-bold text-slate-600 mb-1">Tên & SĐT Liên Hệ *</label><input type="text" required value={kgTen} onChange={e => setKgTen(e.target.value)} placeholder="Ví dụ: Anh Nam - 0905..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500" /></div>
              <div><label className="block font-bold text-slate-600 mb-1">Địa Chỉ Nhà Đất Ký Gửi *</label><input type="text" required value={kgDiaChi} onChange={e => setKgDiaChi(e.target.value)} placeholder="Số nhà, tên đường, tên quận..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500" /></div>
              <div><label className="block font-bold text-slate-600 mb-1">Giá Bán Mong Muốn</label><input type="text" value={kgGia} onChange={e => setKgGia(e.target.value)} placeholder="Ví dụ: 3.5 Tỷ (Để trống nếu muốn thương lượng)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500" /></div>
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl py-3 text-sm mt-3 shadow-md transition-all active:scale-95">Xác Nhận Ký Gửi</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


