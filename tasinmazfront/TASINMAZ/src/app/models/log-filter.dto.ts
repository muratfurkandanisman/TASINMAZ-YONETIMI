export interface LogFilterDto {
  pageNumber: number;
  pageSize: number;
  kullaniciId?: number;
  durum?: string;
  // Add other filter fields as needed
}
