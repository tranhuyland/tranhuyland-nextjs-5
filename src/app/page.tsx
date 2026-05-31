'use client';
import { useState, useEffect } from 'react';
import { useProperties } from '@/features/properties/hooks/useProperties';

// Import các UI Component con (Anh sẽ tạo trong thư mục components/ hoặc features/)
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import FilterBar from '@/features/properties/components/FilterBar';
import PropertyGrid from '@/features/properties/components/PropertyGrid';
import AboutSection from '@/components/AboutSection';
import BlogSection from '@/components/BlogSection';
import KyGuiSection from '@/components/KyGuiSection';
import Footer from '@/components/Footer';
import DetailModal from '@/features/properties/components/DetailModal';
import KyGuiModal from '@/components/KyGuiModal';

export default function Home() {
  const [showKyGuiModal, setShowKyGuiModal] = useState(false);
  
  const seoGoc = {
    title: "Trần Huy Land | Kho Nhà Đất Chính Chủ Hải Châu Cẩm Lệ Đà Nẵng",
    desc: "Mua bán, ký gửi nhà đất chính chủ uy tín tại Hải Châu, Cẩm Lệ, Đà Nẵng."
  };

  // Sử dụng Custom Hook quản lý toàn bộ dữ liệu nghiệp vụ nhà đất
  const propLogic = useProperties(seoGoc.title);

  // Xử lý nút Popstate của trình duyệt khi nhấn Back trên điện thoại
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const currentProductId = parseInt(urlParams.get('id') || '');
      if (!currentProductId) {
        propLogic.handleCloseProduct();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [propLogic]);

  return (
    <>
      <Header onOpenKyGui={() => setShowKyGuiModal(true)} />
      
      <HeroBanner />
      
      <FilterBar 
        khuVuc={propLogic.khuVuc} setKhuVuc={propLogic.setKhuVuc}
        loaiHinh={propLogic.loaiHinh} setLoaiHinh={propLogic.setLoaiHinh}
        gia={propLogic.gia} setGia={propLogic.setGia}
        huong={propLogic.huong} setHuong={propLogic.setHuong}
        activeTag={propLogic.activeTag} setActiveTag={propLogic.setActiveTag}
      />
      
      <PropertyGrid 
        filteredList={propLogic.filtered}
        trangHienTai={propLogic.trangHienTai}
        setTrangHienTai={propLogic.setTrangHienTai}
        onOpenItem={propLogic.handleOpenProduct}
      />
      
      <AboutSection />
      
      <BlogSection />
      
      <KyGuiSection onOpenKyGui={() => setShowKyGuiModal(true)} />
      
      <Footer />

      {/* TẦNG MODALS HACK TRẢI NGHIỆM */}
      {propLogic.selectedProp && (
        <DetailModal 
          item={propLogic.selectedProp} 
          onClose={propLogic.handleCloseProduct} 
        />
      )}

      {showKyGuiModal && (
        <KyGuiModal onClose={() => setShowKyGuiModal(false)} />
      )}
    </>
  );
}
