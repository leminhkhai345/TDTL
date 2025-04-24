using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Interfaces;
using ExchangeDocument.DataAccessLayer.Entities;

namespace ExchangeDocument.DataAccessLayer.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly exchangeDocument exchangeDoc;
        public UserRepository(exchangeDocument _exchangeDoc)
        {
            exchangeDoc = _exchangeDoc;
        }

        public User GetUserById(int id)
        {
            User user = exchangeDoc.Users.FirstOrDefault(s => s.UserId == id);
            return user;
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

        public Userprofile GetProfileById(int id)
        {
            Userprofile userprofile = exchangeDoc.Userprofiles.FirstOrDefault(s => s.UserId == id);
            return userprofile;
        }
        public void AddUserprofile(Userprofile userprofile)
        {
            exchangeDoc.Userprofiles.Add(userprofile);
        }

        public List<Userprofile> GetAllUSerProfile()
        {
            List<Userprofile> profiles = exchangeDoc.Userprofiles.Select(s => s).ToList();
            return profiles;
        }

        public List<User> GetAllUser()
        {
            List<User> users = exchangeDoc.Users.Select(s => s).ToList();
            return users;
        }

        public void DeleteUser(User user)
        {
            exchangeDoc.Users.Remove(user);
        }

    }
}
