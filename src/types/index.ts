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
  ngayDang?: string;
  isMatTien?: string | boolean;
  videoUrl?: string;
  linkMap?: string;
  anhSoDo?: string;
  phapLy?: string;
}