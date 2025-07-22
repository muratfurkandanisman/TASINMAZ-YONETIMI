namespace TASINMAZ.Entities
{
    public class Log
    {
        public int LogId { get; set; } // PK
        public int? UserId { get; set; } // FK, artık nullable
        public User? User { get; set; } // Navigation property nullable

        public string Durum { get; set; } = null!;
        public string IslemTipi { get; set; } = null!;
        public string Aciklama { get; set; } = null!;
        public DateTime Tarih { get; set; }
        public TimeSpan Saat { get; set; }
    }
}
