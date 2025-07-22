using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace TASINMAZ.Entities
{
    public enum Role
    {
        User,
        Admin
    }

    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = null!;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = null!;

        [Required]
        [JsonIgnore] // API response'unda gözükmesin
        public byte[] PasswordHash { get; set; } = null!;

        [Required]
        [JsonIgnore] // API response'unda gözükmesin
        public byte[] PasswordSalt { get; set; }= null!;

        [Required]
        public Role Role { get; set; } = Role.User; // Default değer

        // Navigation properties
        public ICollection<Tasinmaz>? Tasinmazlar { get; set; }

        [JsonIgnore]
        public ICollection<Log>? Loglar { get; set; }
    }
}