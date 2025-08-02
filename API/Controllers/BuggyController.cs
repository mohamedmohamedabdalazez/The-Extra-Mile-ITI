using Core.Entities;
using Microsoft.AspNetCore.Mvc;
using The_Extra_Mile.DTOs;

namespace The_Extra_Mile.Controllers
{
    public class BuggyController : BaseApiController
    {
        [HttpGet("unauthorized")]
        public IActionResult GetUnauthorized()
        {
            return Unauthorized();
        }
        [HttpGet("notfound")]
        public IActionResult GetNotFound()
        {
            return NotFound();
        }
        [HttpGet("internalerror")]
        public IActionResult GetInternalError()
        {
            throw new Exception("This is a server error");
        }
        [HttpGet("badrequest")]
        public IActionResult GetBadRequest()
        {
            return BadRequest("This is a bad request");
        }
        [HttpPost("validationerror")]
        public IActionResult GetValidationError(CreateProductDTO product)
        {
            return Ok();
        }
    }
}
 