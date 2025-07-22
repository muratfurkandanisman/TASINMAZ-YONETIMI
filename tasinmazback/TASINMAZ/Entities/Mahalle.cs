namespace TASINMAZ.Entities
{
    public class Mahalle
    {
        public int MahalleId { get; set; }
        public string Name { get; set; } = null!;
        public int IlceId { get; set; }
        public Ilce Ilce { get; set; } = null!;
        public ICollection<Tasinmaz>? Tasinmazlar { get; set; }
    }
}
