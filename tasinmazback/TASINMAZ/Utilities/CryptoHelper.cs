using System.Security.Cryptography;
using System.Text;

namespace TASINMAZ.Utilities
{
    public static class CryptoHelper
    {
        public static string ComputeSha256Hash(string rawData)
        {
            // SHA256 nesnesi oluştur
            using (SHA256 sha256Hash = SHA256.Create())
            {
                // string -> byte[] çevir ve hash hesapla
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));

                // byte[] -> hexadecimal string çevir
                StringBuilder builder = new StringBuilder();
                foreach (var b in bytes)
                {
                    builder.Append(b.ToString("x2")); // "x2" hexadecimal format
                }
                return builder.ToString();
            }
        }
    }
}
