export interface Property {
  id: number;
  tieude: string;
  moTa: string;
  gia: string;
  soGia: number;
  dienTich: string;
  phongNgu?: string;
  huong?: string;
  khuVuc: string;
  khuVucFull: string;
  loaiHinh: string;
  anh: string;
  tag?: string;
  tagColor?: string;
  ngayDang?: string; // Đã thêm: Bắt buộc khai báo trường này để Next.js nhận dữ liệu ngày
  isMatTien?: string | boolean;
  videoUrl?: string;
  linkMap?: string;
  anhSoDo?: string;
  phapLy?: string;
}
