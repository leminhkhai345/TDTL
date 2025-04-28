using ExchangeDocument.DataAccessLayer.Entities;

namespace ExchangeDocument.DataAccessLayer.Interfaces
{
    public interface ICategoryRepository
    {
        public void AddCategory(Category category);
        public List<Category> GetAllCategory();
        public void SaveChanges();
        public void Remove(Category category);

    }
}
