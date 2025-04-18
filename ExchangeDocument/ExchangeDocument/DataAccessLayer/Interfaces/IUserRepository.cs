using ExchangeDocument.DataAccessLayer.ModelFromDB;

namespace ExchangeDocument.DataAccessLayer.Interfaces
{
    public interface IUserRepository
    {
        public void SaveChanges();
        public void AddUser(User user);
        public User GetUserByEmail(string email);
    }
}
