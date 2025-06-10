using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Interfaces.Services
{
    /// <summary>
    /// Service chịu trách nhiệm giao tiếp với mô hình Gemini và xây dựng ngữ cảnh dữ liệu.
    /// </summary>
    public interface IChatbotService
    {
        /// <summary>
        /// Gửi câu hỏi của người dùng tới chatbot và nhận lại câu trả lời.
        /// </summary>
        /// <param name="question">Câu hỏi của người dùng.</param>
        /// <param name="userId">Id người dùng (nullable) để cá nhân hoá kết quả.</param>
        /// <returns>Chuỗi câu trả lời tiếng Việt.</returns>
        Task<string> AskAsync(string question, int? userId = null);
    }
}
