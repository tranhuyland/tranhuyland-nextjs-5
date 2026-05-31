/**
 * Chuyển đổi chuỗi thô từ Excel thành đối tượng Date chuẩn
 */
export function parseExcelDate(dateStr: any): Date | null {
  if (!dateStr) return null;
  const cleanStr = dateStr.toString().replace(/[\r\n\t]/g, "").trim();
  if (!cleanStr) return null;

  const parts = cleanStr.split(/[-/]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; 
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

/**
 * Tính toán thời gian cách đây từ chuỗi ngày đăng
 */
export function getRelativeTimeString(dateStr: any): string {
  const postDate = parseExcelDate(dateStr);
  if (!postDate) return "Tin mới";
  const today = new Date();
  postDate.setHours(0, 0, 0, 0); 
  today.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - postDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return "Hôm nay";
  if (diffDays === 1) return "1 ngày trước";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} tuần trước`;
  
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} tháng trước`;
  
  return `${postDate.getDate()}/${postDate.getMonth() + 1}/${postDate.getFullYear()}`;
}

