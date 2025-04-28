using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces;

namespace ExchangeDocument.DataAccessLayer.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly exchangeDocument _exDoc;
        public CategoryRepository(exchangeDocument exDoc)
        {
            _exDoc = exDoc;
        }
        public void AddCategory(Category category)
        {
            _exDoc.Categories.Add(category);
        }

        public List<Category> GetAllCategory()
        {
            var categories = _exDoc.Categories.Select(s => s).ToList();
            return categories;
        }

        public void Remove(Category category)
        {
            _exDoc.Categories.Remove(category);
        }

        public void SaveChanges()
        {
            _exDoc.SaveChanges();
        }
    }
}
