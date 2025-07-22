using System.Collections.Generic;
using System.Threading.Tasks;
using TASINMAZ.Dtos;

namespace TASINMAZ.Interfaces
{
    public interface IIlceService
    {
        Task<List<IlceDto>> GetAllAsync();
    }
}