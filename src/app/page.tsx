import { Metadata } from 'next';
import { propertyService } from '../service/propertyService';
import HomeClient from './HomeClient';


interface Props {
  searchParams: { id?: string };
}

// Hàm Metadata động chạy độc lập ở Server - An toàn SEO 100%
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
        images: [{ url: anhDaiDien, width: 1200, height: 630, alt: item.tieude }],
      },
    };
  } catch (error) {
    return { title: defaultTitle, description: defaultDesc };
  }
}

export default function Home() {
  // Trả về file giao diện Client gánh tương tác
  return <HomeClient />;
}
