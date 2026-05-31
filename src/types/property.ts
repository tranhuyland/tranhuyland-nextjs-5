export interface Property {
  id: number;
  tieude: string;
  gia: string;
  soGia: number;
  khuVuc: string;
  khuVucFull: string;
  loaiHinh: string;
  huong?: string;
  dienTich: string;
  phongNgu?: string;
  moTa: string;
  anh: string;
  tag?: string;
  tagColor?: string;
  isMatTien?: boolean | string;
  ngayDang?: string;
  videoUrl?: string;
  linkMap?: string;
  anhSoDo?: string;
  phapLy?: string;
}

