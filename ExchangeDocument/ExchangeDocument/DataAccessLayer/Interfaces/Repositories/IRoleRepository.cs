using System.Threading.Tasks;

namespace ExchangeDocument.DataAccessLayer.Interfaces.Repositories
{
    public interface IRoleRepository
    {
        /// <summary>
        /// Kiểm tra xem Role có tồn tại hay không
        /// </summary>
        Task<bool> ExistsAsync(int roleId);
    }
}
