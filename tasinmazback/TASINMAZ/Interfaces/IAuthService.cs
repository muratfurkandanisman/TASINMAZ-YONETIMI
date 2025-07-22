using System.Threading.Tasks;
using TASINMAZ.Entities;

namespace TASINMAZ.Interfaces
{
    public interface IAuthService
    {
        Task<User?> ValidateUserAsync(string email, string password);
    }
}