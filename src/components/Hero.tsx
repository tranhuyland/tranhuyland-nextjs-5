'use client';

export default function Hero() {
  return (
    <section className="hero-bg text-white">
      <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold mb-6 tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> KHO NHÀ ĐẤT CHÍNH CHỦ ĐÀ NẴNG
          </div>
          <h2 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6">
            Nhà Thật • Giá Thật • Giao Dịch Minh Bạch
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
            Chuyên phân phối nhà phố, đất nền, mặt tiền kinh doanh và nhà kiệt ô tô tại Hải Châu, Cẩm Lệ, Sơn Trà... Hình ảnh khảo sát thực tế, hỗ trợ đối chiếu sổ đỏ trực tiếp từ chủ nhà.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="tel:0931555551" className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-3.5 rounded-2xl font-extrabold transition-all shadow-lg active:scale-95">
              Liên Hệ Tư Vấn
            </a>
            <a href="https://zalo.me/0931555551" target="_blank" rel="noopener noreferrer" className="border border-white/20 hover:bg-white/10 px-6 py-3.5 rounded-2xl font-bold transition-all flex items-center gap-2">
              Xem Giỏ Hàng Zalo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

