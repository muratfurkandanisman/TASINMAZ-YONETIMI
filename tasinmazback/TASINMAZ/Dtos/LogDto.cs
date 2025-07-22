namespace TASINMAZ.Dtos
{
    public class LogDto
    {
        public int LogId { get; set; }
        public int? UserId { get; set; } // DÜZELTİLDİ: int? oldu
        public string Durum { get; set; } = null!;
        public string IslemTipi { get; set; } = null!;
        public string Aciklama { get; set; } = null!;
        public DateTime Tarih { get; set; }
        public TimeSpan Saat { get; set; }
    }
}
