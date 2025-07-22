using Microsoft.AspNetCore.Mvc;
using TASINMAZ.Interfaces;
using System.Threading.Tasks;

namespace TASINMAZ.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IlceController : ControllerBase
    {
        private readonly IIlceService _ilceService;

        public IlceController(IIlceService ilceService)
        {
            _ilceService = ilceService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var ilceler = await _ilceService.GetAllAsync();
            return Ok(ilceler);
        }
    }
}
