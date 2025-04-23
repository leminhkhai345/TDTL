using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Interfaces;
using ExchangeDocument.DataAccessLayer.Entities;

namespace ExchangeDocument.DataAccessLayer.Repositories
{
    public class DocumentRepository : IDocumentRepository
    {
        private readonly exchangeDocument exDoc;
        public DocumentRepository(exchangeDocument _exDoc)
        {
            exDoc = _exDoc;
        }
        public Document GetDocumentById(int id)
        {
            Document doc = exDoc.Documents.FirstOrDefault(s => s.DocumentId == id);
            return doc;
        }

        public void AddDocument(Document doc)
        {
            exDoc.Documents.Add(doc);
        }
        public void SaveChanges()
        {
            exDoc.SaveChanges();
        }
    }
}
