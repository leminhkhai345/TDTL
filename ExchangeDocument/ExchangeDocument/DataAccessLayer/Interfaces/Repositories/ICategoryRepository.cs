using ExchangeDocument.DataAccessLayer.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ExchangeDocument.DataAccessLayer.Interfaces.Repositories
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllAsync();
        Task<Category> AddAsync(Category category);
        Task<Category?> GetByIdAsync(int id);
        Task<Category> UpdateAsync(Category category);
        /// <summary>
        /// Xóa danh mục
        /// </summary>
        Task DeleteAsync(Category category);
    }
}
