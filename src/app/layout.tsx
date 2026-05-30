import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta'
});

export const metadata: Metadata = {
  title: 'Trần Huy Land | Kho Nhà Đất Chính Chủ Hải Châu Cẩm Lệ Đà Nẵng',
  description: 'Mua bán, ký gửi nhà đất chính chủ uy tín tại Hải Châu, Cẩm Lệ, Đà Nẵng. Cập nhật giỏ hàng thực tế mỗi ngày.',
  keywords: ['nhà đất đà nẵng', 'nhà đất chính chủ hải châu', 'ký gửi nhà đất cẩm lệ', 'nhà đất trần huy'],
  openGraph: {
    title: 'Trần Huy Land | Kho Nhà Đất Chính Chủ Hải Châu Cẩm Lệ Đà Nẵng',
    description: 'Mua bán, ký gửi nhà đất chính chủ uy tín tại Hải Châu, Cẩm Lệ, Đà Nẵng.',
    images: ['https://i.postimg.cc/JhKg8VZ9/70554272-47DB-4D3A-A1AE-2782EFCAF00F.png'],
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${plusJakartaSans.variable} font-sans antialiased min-h-screen flex flex-col pb-20 md:pb-0`}>
        {children}
      </body>
    </html>
  );
}