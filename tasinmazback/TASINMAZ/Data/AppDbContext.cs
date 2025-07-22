using Microsoft.EntityFrameworkCore;
using TASINMAZ.Entities;

namespace TASINMAZ.Data
{
    // Uygulamanızdaki tüm entity'ler için veritabanı erişimini yöneten DbContext sınıfı
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Il> Iller { get; set; }           // İller tablosu
        public DbSet<Ilce> Ilceler { get; set; }       // İlçeler tablosu
        public DbSet<Mahalle> Mahalleler { get; set; } // Mahalleler tablosu
        public DbSet<Tasinmaz> Tasinmazlar { get; set; } // Taşınmazlar tablosu
        public DbSet<User> Users { get; set; }         // Kullanıcılar tablosu
        public DbSet<Log> Logs { get; set; }           // Loglar tablosu

        // Gerekirse model oluşturma aşamasında ilişkileri burada özelleştirebilirsiniz
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Log>()
                .HasOne(l => l.User)
                .WithMany(u => u.Loglar)
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.SetNull); // Kullanıcı silinince UserId null olur
        }
    }
}