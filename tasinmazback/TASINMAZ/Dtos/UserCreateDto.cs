using System.ComponentModel.DataAnnotations;

namespace TASINMAZ.Dtos
{
    public class UserCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = null!;

        [Required]
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz.")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Şifre gereklidir.")]
        [MinLength(8, ErrorMessage = "Şifre en az 8 karakter olmalıdır.")]
        [RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\d\s:]).{8,}$", 
            ErrorMessage = "Şifre en az 8 karakter, 1 harf, 1 rakam ve 1 özel karakter içermelidir.")]
        public string Password { get; set; } = null!;

        public string Role { get; set; } = null!;
    }
}
