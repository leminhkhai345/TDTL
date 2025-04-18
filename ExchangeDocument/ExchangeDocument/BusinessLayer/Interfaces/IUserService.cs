using ExchangeDocument.BusinessLayer.DTOs;

namespace ExchangeDocument.BusinessLayer.Interfaces
{
    public interface IUserService
    {
        public bool Register(RegisterRequest request);
    }
}
