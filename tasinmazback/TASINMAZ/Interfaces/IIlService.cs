using System.Collections.Generic;
using System.Threading.Tasks;
using TASINMAZ.Dtos;

namespace TASINMAZ.Interfaces
{
    public interface IIlService
    {
        Task<List<IlDto>> GetAllAsync();
    }
}