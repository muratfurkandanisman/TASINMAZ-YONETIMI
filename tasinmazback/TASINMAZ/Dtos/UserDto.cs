namespace TASINMAZ.Dtos
{
    public class UserDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string? Password { get; set; } // Şifre güncelleme için eklendi
    }
}
