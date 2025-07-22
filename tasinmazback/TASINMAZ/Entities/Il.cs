namespace TASINMAZ.Entities
{
    public class Il
    {
        public int IlId { get; set; }
        public string Name { get; set; } = null!;
        public ICollection<Ilce>? Ilceler { get; set; }
    }
}
