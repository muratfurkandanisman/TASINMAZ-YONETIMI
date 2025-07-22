namespace TASINMAZ.Dtos
{
    public class LogFilterDto
    {
        public int? UserId { get; set; }
        public string? Durum { get; set; }
        public string? IslemTipi { get; set; }
        public string? Aciklama { get; set; }
        public DateTime? TarihBaslangic { get; set; }
        public DateTime? TarihBitis { get; set; }
        public int PageNumber { get; set; } = 1; // Ka��nc� sayfa
        public int PageSize { get; set; } = 10;  // Sayfa ba��na ka� kay�t (default: 10)
    }
}