using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Interfaces;
using ExchangeDocument.DataAccessLayer.ModelFromDB;

namespace ExchangeDocument.DataAccessLayer.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly exchangeDocument exchangeDoc;
        public UserRepository(exchangeDocument _exchangeDoc)
        {
            exchangeDoc = _exchangeDoc;
        }

        
        public User GetUserByEmail(string email)
        {
            User user = exchangeDoc.Users.FirstOrDefault(s => s.Email == email);
            return user;
        }
        
        public void AddUser(User user)
        {
            exchangeDoc.Users.Add(user);
        }

        public void SaveChanges()
        {
            exchangeDoc.SaveChanges();
        }
    }
}
