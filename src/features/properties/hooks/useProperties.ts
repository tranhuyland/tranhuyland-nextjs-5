import { useState, useEffect } from "react";
import { propertyService } from '../../../../service/propertyService';


export function useProperties(seoGocTitle: string) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filtered, setFiltered] = useState<Property[]>([]);
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  
  // State Bộ lọc
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [khuVuc, setKhuVuc] = useState('all');
  const [loaiHinh, setLoaiHinh] = useState('all');
  const [gia, setGia] = useState('all');
  const [huong, setHuong] = useState('all');
  const [activeTag, setActiveTag] = useState('all');

  // Khởi tạo lấy dữ liệu và đồng bộ URL query params
  useEffect(() => {
    propertyService.fetchPropertiesFromSheet()
      .then((data) => {
        setProperties(data);
        setFiltered(data);

        const urlParams = new URLSearchParams(window.location.search);
        const currentProductId = parseInt(urlParams.get('id') || '');
        if (currentProductId) {
          const target = data.find(p => p.id === currentProductId);
          if (target) setSelectedProp(target);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Xử lý bộ lọc đa tầng
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
    document.title = seoGocTitle;
  };

  return {
    properties,
    filtered,
    selectedProp,
    trangHienTai,
    setTrangHienTai,
    khuVuc,
    setKhuVuc,
    loaiHinh,
    setLoaiHinh,
    gia,
    setGia,
    huong,
    setHuong,
    activeTag,
    setActiveTag,
    handleOpenProduct,
    handleCloseProduct,
  };
}

