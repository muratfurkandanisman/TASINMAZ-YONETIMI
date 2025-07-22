namespace TASINMAZ.Dtos
{
    public class TasinmazDto
    {
        public int TasinmazId { get; set; }
        public int MahalleId { get; set; }
        public int Ada { get; set; }
        public int Parsel { get; set; }
        public string Nitelik { get; set; } = null!;
        public string KoordinatBilgileri { get; set; } = null!;
    }
}
