using ExchangeDocument.DataAccessLayer.Entities;

namespace ExchangeDocument.DataAccessLayer.Interfaces
{
    public interface IDocumentRepository
    {
        public void SaveChanges();
        public Document GetDocumentById(int id);
    }
}
