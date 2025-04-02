export interface Category {
  categoryId: number;
  categoryName: string;
}

export interface Company {
  companyId: number;
  companyCode: string;
  companyImage: string;
  companyName: string;
  categoryIds?: number[]; // 회사가 속한 카테고리 ID 목록 (필터링용)
}
