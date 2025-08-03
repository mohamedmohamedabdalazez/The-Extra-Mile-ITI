using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface ISpecification<T>
    {
        Expression<Func<T, bool>>? Criteria { get; }
        Expression<Func<T, object>>? OrderBy { get; }
        Expression<Func<T, object>>? OrderByDescending { get; }
        bool IsDistinct { get; }
        int Skip { get;}
        int Take { get;}
        bool IsPagingEnabled { get;}
        IQueryable<T> ApplyCriteria(IQueryable<T> query);
    }
    public interface ISpecification<T, TResult>:ISpecification<T>
    {
        Expression<Func<T, TResult>>? Select { get; }
    }
}
