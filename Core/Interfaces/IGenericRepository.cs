using Core.Entities;
using Core.Specifications;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IGenericRepository <T> where T : BaseEntity
    {
        public Task<T?> GetByIdAsync(int id);
        public Task<IReadOnlyList<T>> ListAllAsync();
        public Task<IReadOnlyList<T>> ListAsync(ISpecification<T> spec);
        public Task<T?> GetEntityWithSpec(ISpecification<T> spec);
        public Task<IReadOnlyList<TResult>> ListAsync<TResult>(ISpecification<T, TResult> spec);
        public Task<TResult?> GetEntityWithSpec<TResult>(ISpecification<T, TResult> spec);
        public void Add(T entity);
        public void Remove(T entity);

        public Task<bool> SaveAllAsync();

        public void Update(T entity);

        public bool Exists(int id);
        Task<int> CountAsync(ISpecification<T> spec);
    }
}
