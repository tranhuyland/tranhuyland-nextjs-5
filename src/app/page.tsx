'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { useProperties } from '@/features/properties/hooks/useProperties';
import { propertyService } from '@/services/propertyService';

// Import các UI Component con đã được bóc tách từ Giai đoạn 1
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

interface Props {
  searchParams: { id?: string };
}

// ==========================================
// 1. CẤU HÌNH DYNAMIC METADATA (SEO & OPENGRAPH NÂNG CAO)
// ==========================================
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const id = searchParams.id;
  const baseUrl = 'https://tranhuyland-nextjs-5.vercel.app';
  
  const defaultTitle = "Trần Huy Land | Kho Nhà Đất Chính Chủ Hải Châu Cẩm Lệ Đà Nẵng";
  const defaultDesc = "Mua bán, ký gửi nhà đất chính chủ uy tín tại Hải Châu, Cẩm Lệ, Đà Nẵng. Cập nhật giỏ hàng thực tế mỗi ngày, pháp lý minh bạch.";

  if (!id) {
    return {
      title: defaultTitle,
      description: defaultDesc,
      openGraph: {
        title: defaultTitle,
        description: defaultDesc,
        url: baseUrl,
        siteName: 'Trần Huy Land',
        images: [{ url: `${baseUrl}/og-image.jpg`, width: 1200, height: 630 }],
        locale: 'vi_VN',
        type: 'website',
      },
    };
  }

  try {
    const properties = await propertyService.fetchPropertiesFromSheet();
    const item = properties.find(p => p.id === parseInt(id));

    if (!item) return { title: `Không tìm thấy sản phẩm | Trần Huy Land` };

    const titleDong = `${item.tieude} - Giá tốt ${item.gia} | Trần Huy Land`;
    const descDong = `Bán ${item.loaiHinh.toLowerCase()} diện tích ${item.dienTich} tại khu vực ${item.khuVucFull}. Pháp lý: ${item.phapLy || 'Sổ hồng sẵn sàng'}. Xem ngay!`;
    const danhSachAnh = item.anh ? item.anh.split(',') : [];
    const anhDaiDien = danhSachAnh.length > 0 ? danhSachAnh[0].trim() : `${baseUrl}/og-image.jpg`;

    return {
      title: titleDong,
      description: descDong,
      openGraph: {
        title: titleDong,
        description: descDong,
        url: `${baseUrl}/?id=${item.id}`,
        type: 'article',
        publishedTime: item.ngayDang ? new Date(item.ngayDang.toString().replace(/[-/]/g, '-')).toISOString() : undefined,
        authors: ['Trần Huy Land'],
        images: [{ url: anhDaiDien, width: 1200, height: 630, alt: item.tieude }],
      },
    };
  } catch (error) {
    return { title: defaultTitle, description: defaultDesc };
  }
}

// ==========================================
// 2. COMPONENT CHÍNH (MAIN INTERFACE)
// ==========================================
export default function Home() {
  const [showKyGuiModal, setShowKyGuiModal] = useState(false);
  
  const seoGoc = {
    title: "Trần Huy Land | Kho Nhà Đất Chính Chủ Hải Châu Cẩm Lệ Đà Nẵng"
  };

  // Gọi Custom Hook quản lý toàn bộ Logic & Trạng thái nghiệp vụ từ Giai đoạn 1
  const propLogic = useProperties(seoGoc.title);

  // Lắng nghe sự kiện bấm Back trên trình duyệt điện thoại để đóng Modal mượt mà
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

  const baseUrl = 'https://tranhuyland-nextjs-5.vercel.app';

  // Cấu hình JSON-LD 1: Khai báo Doanh nghiệp/Đại lý BĐS Địa phương với Google
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Trần Huy Land",
    "image": "https://i.postimg.cc/JhKg8VZ9/70554272-47DB-4D3A-A1AE-2782EFCAF00F.png",
    "telePhone": "0931555551",
    "url": baseUrl,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "26 Cẩm Bá Thước",
      "addressLocality": "Hải Châu",
      "addressRegion": "Đà Nẵng",
      "addressCountry": "VN"
    },
    "priceRange": "$$$"
  };

  // Cấu hình JSON-LD 2: Khai báo sản phẩm nhà đất động khi khách click mở xem chi tiết
  const currentItem = propLogic.selectedProp;
  const productSchema = currentItem ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": currentItem.tieude,
    "image": currentItem.anh ? currentItem.anh.split(',')[0].trim() : baseUrl,
    "description": currentItem.moTa,
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/?id=${currentItem.id}`,
      "priceCurrency": "VND",
      "price": currentItem.soGia * 1000000000, 
      "availability": "https://schema.org/InStock"
    }
  } : null;

  return (
    <>
      {/* KHÚC CHÈN NGẦM DỮ LIỆU CẤU TRÚC JSON-LD CHO GOOGLE BOT */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}

      {/* LẮP GHÉP GIAO DIỆN CHUẨN KIẾN TRÚC */}
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

      {/* CÁC LAYER MODAL HIỂN THỊ */}
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
