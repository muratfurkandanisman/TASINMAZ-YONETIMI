using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using TASINMAZ.Dtos;
using TASINMAZ.Interfaces;

namespace TASINMAZ.Controllers
{
    [ApiController]   // ApiController attribute: Bu sınıfın bir Web API denetleyicisi olduğunu belirtmek için kullanılır. Bu sayede, model doğrulama hataları otomatik olarak 400 Bad Request yanıtı ile döndürülür ve JSON formatında veri alışverişi yapılır.
    [Route("api/[controller]")] // Route attribute: Bu denetleyicinin URL yolunu belirler. [controller] kısmı, denetleyici sınıfının adını (UserController) alır ve "User" olarak kullanılır. Yani bu denetleyiciye erişmek için "/api/user" yolunu kullanacağız.
    public class UserController : ControllerBase // : ControllerBase: Bu sınıfın bir Web API denetleyicisi olduğunu belirtmek için .NET'in hazır ControllerBase sınıfından miras alıyoruz. Bu sayede sınıfımız, dışarıya cevap dönerken kullanacağımız Ok(), BadRequest(), Unauthorized() gibi hazır HTTP metotlarına erişim kazanıyor.
    {
        private readonly IUserService _userService; // IUserService arayüzünden bir _userService alanı tanımlıyoruz. Bu alan, kullanıcılarla ilgili işlemleri gerçekleştirecek olan servis sınıfına erişim sağlayacak.

        public UserController(IUserService userService) // Constructor: Bu sınıfın bir örneği oluşturulduğunda çalışacak olan yapıcı metot. Dışarıdan IUserService türünde bir nesne alıyor ve bunu _userService alanına atıyor. Bu sayede denetleyici, kullanıcı işlemlerini gerçekleştirmek için gerekli servise erişebiliyor.
        {
            _userService = userService;
        }

        [Authorize(Roles = "Admin")]// Authorize attribute: Bu metotun yalnızca "Admin" rolüne sahip kullanıcılar tarafından erişilebileceğini belirtiyor. Eğer kullanıcı bu role sahip değilse, metot çalıştırılmadan önce yetkilendirme hatası dönecek.
        [HttpGet]// HttpGet attribute: Bu metot, HTTP GET isteği ile çağrılabilir. Yani kullanıcılar bu metodu çağırmak için bir GET isteği gönderecek.
        public async Task<IActionResult> GetAll()  // IActionResult: Bu metot, HTTP yanıtını temsil eden bir IActionResult döndürüyor. Bu sayede metot, başarılı veya başarısız durumları farklı HTTP yanıtları ile ifade edebiliyor. async Task<IActionResult>: Metot asenkron çalışıyor ve bir Task<IActionResult> döndürüyor. Bu sayede metot, uzun süren işlemler sırasında uygulamanın diğer işlemlerini engellemeden çalışabiliyor.
        {
            var users = await _userService.GetAllAsync(); // _userService üzerinden GetAllAsync metodunu çağırarak tüm kullanıcıları alıyoruz. Bu metot asenkron çalıştığı için await ile bekliyoruz.
            return Ok(users); // Ok() metodu, HTTP 200 OK yanıtı döndürür ve yanıtın gövdesine users listesini ekler. Bu sayede kullanıcılar, tüm kullanıcıların listesini JSON formatında alabilirler.
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("filter")]
        public async Task<IActionResult> Filter([FromBody] UserFilterDto filter)
        {
            var users = await _userService.FilterAsync(filter);
            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UserCreateDto dto)
        {
            var created = await _userService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetAll), new { id = created.UserId }, created);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _userService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("export-excel")]
        public async Task<IActionResult> ExportToExcel([FromBody] UserFilterDto filter)
        {
            var fileContent = await _userService.ExportToExcelAsync(filter);
            return File(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "users.xlsx");
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("export-pdf")]
        public async Task<IActionResult> ExportToPdf([FromBody] UserFilterDto filter)
        {
            var fileContent = await _userService.ExportToPdfAsync(filter);
            return File(fileContent, "application/pdf", "users.pdf");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UserDto dto)
        {
            var updated = await _userService.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound();
            return Ok(updated);
        }
    }
}
