namespace TASINMAZ.Entities
{
    public class Ilce
    {
        public int IlceId { get; set; }
        public string Name { get; set; } = null!;
        public int IlId { get; set; }
        public Il Il { get; set; } = null!;
        public ICollection<Mahalle>? Mahalleler { get; set; }
    }
}
