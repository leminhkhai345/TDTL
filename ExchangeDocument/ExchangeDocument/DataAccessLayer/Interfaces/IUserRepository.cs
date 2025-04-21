using ExchangeDocument.DataAccessLayer.ModelFromDB;

namespace ExchangeDocument.DataAccessLayer.Interfaces
{
    public interface IUserRepository
    {
        public void SaveChanges();
        public void AddUser(User user); 
        public void AddUserprofile(Userprofile userprofile);
        public User GetUserByEmail(string email);
        public User GetUserById(int id);
        public Userprofile GetProfileById(int id);
    }
}
