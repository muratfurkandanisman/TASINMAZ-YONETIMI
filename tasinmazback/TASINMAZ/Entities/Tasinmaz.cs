namespace TASINMAZ.Entities
{
    public enum Nitelik
    {
        Arsa,
        Tarla,
        Mesken
    }

    public class Tasinmaz
    {
        public int TasinmazId { get; set; } // PK
        public int MahalleId { get; set; } // FK
        public Mahalle Mahalle { get; set; } = null!; // Navigation property

        public int Ada { get; set; }
        public int Parsel { get; set; }
        public Nitelik Nitelik { get; set; }
        public string KoordinatBilgileri { get; set; } = null!;
        public int UserId { get; set; }
    }
}
