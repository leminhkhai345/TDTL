// public class GeminiController : ControllerBase
// {
//     private readonly HttpClient _client;
//     private readonly IConfiguration Configuration;
//     private readonly IProductRepository ProductRepository;
//     private readonly IProductDetailsRepository ProductDetailsRepository;
//     public GeminiController(IConfiguration Configuration, IProductRepository ProductRepository, IProductDetailsRepository ProductDetailsRepository)
//     {
//         _client = new HttpClient();
//         this.Configuration = Configuration;
//         this.ProductRepository = ProductRepository;
//         this.ProductDetailsRepository = ProductDetailsRepository;
//     }
//     [HttpPost]
//     public async Task<IActionResult> GetResponseAsync([FromBody] string userInput)
//     {
//         var dataProduct = "Đây là dữ liệu tôi muốn cung cấp cho bạn: ";
//         var listProduct = ProductRepository.GetAllProduct(null, null, null, null);          
//         foreach(var product in listProduct)
//         {
//             dataProduct += product.MaSP + product.TenSp + product.SoLuong + product.KhoangGia + "Các biến thể gồm có: ";
//             foreach(var detail in product.Chitietsanphams)
//             {
//                 dataProduct += detail.TenMau + detail.TenKichThuoc + detail.DonGia + detail.SoLuongTon;
//             }
//         }
//         var requestBody = new
//         {
//             contents = new[]
//             {
//                 new
//                 {
//                     parts = new[]
//                     {
//                         new
//                         {
//                             text = dataProduct +
//                             "\n Yêu cầu đầu ra: bạn hãy trả lời một cách linh hoạt, ngắn gọn, sau mỗi thông tin được liệt kê ra phải xuống dòng bằng cách thêm <br/>. Riêng thông tin liên quan tới biến thể của sản phẩm bạn phải trả lời thật chi tiết" +
//                             "Bạn hãy dựa vào dữ liệu tôi đưa ra và trả lời cho câu hỏi: " + userInput,
//                         }
//                     }
//                 }
//             }
//         };
//         var jsonRequestBody = JsonConvert.SerializeObject(requestBody);
//         StringContent content = new StringContent(jsonRequestBody, Encoding.UTF8, "application/json");
//         string UrlGemini = Configuration["Chatbot:Gemini:GeminiAPIUrl"];
//         string KeyGemini = Configuration["Chatbot:Gemini:GeminiAPIKey"];
//         HttpResponseMessage response = await _client.PostAsync(UrlGemini + $"?key={KeyGemini}", content);
//         if (response.IsSuccessStatusCode)
//         {
//             var data = await response.Content.ReadAsStringAsync();
//             dynamic responseObject = JsonConvert.DeserializeObject(data);
//             string answer = responseObject?.candidates[0].content?.parts[0]?.text ?? "Xin lỗi, chúng tôi chỉ có thể tư vấn cho bạn những thông tin liên quan đến sản phẩm trong cửa hàng";
//             return Ok(new
//             {
//                 Message = answer
//             });
//         }
//         return Ok(new
//         {
//             Message = "Có lỗi xảy ra"
//         });
//     }
// }