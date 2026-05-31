'use client';

import { useState, useEffect } from 'react';
import { useProperties } from '@/features/properties/hooks/useProperties';

// Gọi thẳng từ gốc @/ để dứt điểm lỗi đếm dấu chấm gạch lùi cấp
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import PropertyModal from '@/components/PropertyModal';
import FilterBar from '@/features/properties/components/FilterBar';
import PropertyGrid from '@/features/properties/components/PropertyGrid';

export default function HomeClient() {
  const propLogic = useProperties("Trần Huy Land");

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

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Trần Huy Land",
    "image": "https://i.postimg.cc/JhKg8VZ9/70554272-47DB-4D3A-A1AE-2782EFCAF00F.png",
    "telephone": "0931555551",
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

      <Hero />
      
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
      
      <Footer />

      {propLogic.selectedProp && (
        <PropertyModal item={propLogic.selectedProp} onClose={propLogic.handleCloseProduct} />
      )}
    </>
  );
}
