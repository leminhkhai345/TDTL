using ExchangeDocument.DataAccessLayer.Entities;
using System.Threading.Tasks;

namespace ExchangeDocument.DataAccessLayer.Interfaces.Repositories
{
    public interface IDocumentStatusRepository
    {
        Task<DocumentStatus?> GetByIdAsync(int id);
        // Có thể thêm các phương thức khác sau này nếu cần
    }
}
