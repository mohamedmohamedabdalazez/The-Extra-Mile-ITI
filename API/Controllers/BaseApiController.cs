using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using The_Extra_Mile.RequestHelpers;

namespace The_Extra_Mile.Controllers
{
    [ApiController]
    [Route("API/[controller]")]
    public class BaseApiController: ControllerBase
    {
        protected async Task<ActionResult> CreatePagedResult<T> (IGenericRepository<T> repo,
            ISpecification<T> spec, int pageIndex, int pageSize) where T : BaseEntity
        {
            var items = await repo.ListAsync(spec);
            var count = await repo.CountAsync(spec);
            var pagination = new Pagination<T>(pageIndex,
                pageSize, count, items);
            return Ok(pagination);
        }
    }
}
