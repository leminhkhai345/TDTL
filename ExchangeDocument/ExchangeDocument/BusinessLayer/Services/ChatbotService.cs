using System;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using ExchangeDocument.DataAccessLayer.Data;
using Google_GenerativeAI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace ExchangeDocument.BusinessLayer.Services
{
    /// <summary>
    /// Triển khai ChatbotService sử dụng Gemini 1.5-flash.
    /// </summary>
    public class ChatbotService : IChatbotService
    {
        private readonly ExchangeDocumentContext _db;
        private readonly GenerativeModel _model;
        private readonly ILogger<ChatbotService> _logger;
        private readonly IMemoryCache _cache;
        private readonly IUserStatisticsService? _userStats;
        private static readonly JsonSerializerOptions _jsonOpt = new(JsonSerializerDefaults.Web)
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        public ChatbotService(GenerativeModel model,
                              ExchangeDocumentContext db,
                              ILogger<ChatbotService> logger,
                              IMemoryCache cache,
                              IUserStatisticsService? userStats = null)
        {
            _model = model;
            _db = db;
            _logger = logger;
            _cache = cache;
            _userStats = userStats;
        }

        public async Task<string> AskAsync(string question, int? userId = null)
        {
            string trimmed = question.Trim();

            // -------- Cache --------
            string cacheKey = $"chat:{userId}:{trimmed}";
            if (_cache.TryGetValue(cacheKey, out string cached))
            {
                return cached;
            }

            // 1. Xây dựng ngữ cảnh đa bảng
            string? promptContext = await BuildContextAsync(trimmed, userId);

            // 2. Xây prompt tổng hợp
            var prompt = $"Bạn là trợ lý ảo của ExchangeDocument.\n" +
                         (promptContext != null ? $"Thông tin ngữ cảnh:\n{promptContext}\n" : "") +
                         $"Câu hỏi của người dùng: {question}\n" +
                         "Yêu cầu: Trả lời bằng tiếng Việt, ngắn gọn, chính xác và hữu ích. Nếu chưa đủ dữ liệu, hãy nói bạn không chắc.";

            // 3. Gọi Gemini qua SDK
            GenerateContentResponse gemResp;
            try
            {
                gemResp = await _model.GenerateContentAsync(prompt);
                // Nếu Gemini quyết định gọi hàm
                if (gemResp.IsFunctionCall)
                {
                    gemResp = await gemResp.ExecuteFunctionCallAsync();
                    gemResp = await gemResp.GetFinalAnswerAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gemini SDK error");
                return "Xin lỗi, hệ thống gặp lỗi khi gọi dịch vụ AI.";
            }

            string? answer = gemResp?.Text();
            answer ??= "Xin lỗi, tôi chưa có câu trả lời.";
            // Đảm bảo chuỗi được cắt gọn và chuyển dòng sang thẻ <br/>
            answer = answer.Trim().Replace("\n", "<br/>");

            // Lưu cache 5 phút
            _cache.Set(cacheKey, answer, TimeSpan.FromMinutes(5));

            return answer;
        }

        #region Context Builders

        private async Task<string?> BuildContextAsync(string q, int? userId)
        {
            // Ưu tiên theo ID (#123) trước, sau đó mới theo từ khoá tiêu đề
            // -------- Order --------
            var orderIdMatch = System.Text.RegularExpressions.Regex.Match(q, @"đơn\s*hàng\s*#?(\d+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            if (orderIdMatch.Success && int.TryParse(orderIdMatch.Groups[1].Value, out int orderId))
            {
                var order = await _db.Orders.AsNoTracking()
                    .Include(o => o.OrderStatus)
                    .Include(o => o.OrderDetails).ThenInclude(od => od.Document)
                    .Include(o => o.PaymentMethod)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId);
                if (order != null)
                {
                    var docs = string.Join("; ", order.OrderDetails.Take(3).Select(od => od.Document?.Title));
                    return $"ĐƠN HÀNG #{order.OrderId}\nNgày: {order.OrderDate:dd/MM/yyyy}\nNgười mua: {PseudoUser(order.BuyerId)}\nNgười bán: {PseudoUser(order.SellerId)}\nTổng tiền: {order.TotalAmount} VNĐ\nTrạng thái: {order.OrderStatus?.Name}\nPhương thức thanh toán: {order.PaymentMethod?.Name}\nTài liệu: {docs}";
                }
            }

            // -------- Listing (chi tiết theo ID) --------
            var listingIdMatch = System.Text.RegularExpressions.Regex.Match(q, @"tin\s*đăng\s*#?(\d+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            if (listingIdMatch.Success && int.TryParse(listingIdMatch.Groups[1].Value, out int listingId))
            {
                var listing = await _db.Listings.AsNoTracking()
                    .Include(l => l.Document).ThenInclude(d => d.Category)
                    .Include(l => l.SystemStatus)
                    .Include(l => l.ListingPaymentMethods).ThenInclude(lpm => lpm.PaymentMethod)
                    .FirstOrDefaultAsync(l => l.ListingId == listingId);
                if (listing != null)
                {
                    var pm = string.Join(", ", listing.ListingPaymentMethods.Select(p => p.PaymentMethod.Name));
                    return $"TIN ĐĂNG #{listing.ListingId}\nTài liệu: {listing.Document?.Title}\nGiá: {(listing.Price.HasValue ? listing.Price.Value + " VNĐ" : "Thoả thuận")}\nLoại: {listing.ListingType}\nTrạng thái: {listing.SystemStatus?.Name}\nChủ sở hữu: {PseudoUser(listing.OwnerId)}\nPhương thức thanh toán: {pm}";
                }
            }

            // -------- Listing overview --------
            if (System.Text.RegularExpressions.Regex.IsMatch(q, @"tin\s*đăng", System.Text.RegularExpressions.RegexOptions.IgnoreCase) ||
                q.Contains("listing", StringComparison.OrdinalIgnoreCase) ||
                q.Contains("đang bán", StringComparison.OrdinalIgnoreCase))
            {
                var listingsQuery = _db.Listings.AsNoTracking()
                    .Include(l => l.Document)
                    .Include(l => l.SystemStatus)
                    .Where(l => !l.IsDeleted);

                bool askApproved = q.Contains("duyệt", StringComparison.OrdinalIgnoreCase) || q.Contains("công khai", StringComparison.OrdinalIgnoreCase);

                if (askApproved)
                {
                    listingsQuery = listingsQuery.Where(l => l.SystemStatus.Name.Contains("duyệt") || l.SystemStatus.Name.Contains("công khai"));
                }
                else if (q.Contains("đang bán", StringComparison.OrdinalIgnoreCase))
                {
                    listingsQuery = listingsQuery.Where(l => l.SystemStatus.Code == "ON_SALE" || l.SystemStatus.Name.Contains("bán"));
                }

                var list = await listingsQuery.OrderByDescending(l => l.CreatedAt)
                    .Take(10)
                    .Select(l => $"• {l.Document.Title} (Giá: {(l.Price.HasValue ? l.Price.Value + " VNĐ" : "Thoả thuận")}, ID #{l.ListingId}, Trạng thái: {l.SystemStatus.Name})")
                    .ToListAsync();

                if (list.Any())
                {
                    string header = askApproved ? "CÁC TIN ĐĂNG ĐÃ ĐƯỢC DUYỆT:\n" : "CÁC TIN ĐĂNG GẦN ĐÂY:\n";
                    return header + string.Join("\n", list);
                }
            }

            // -------- Document theo tiêu đề --------
            if (q.Contains("tài liệu", StringComparison.OrdinalIgnoreCase))
            {
                var title = ExtractQuoted(q) ?? q;
                var doc = await _db.Documents.AsNoTracking()
                    .Include(d => d.Category)
                    .Include(d => d.SystemStatus)
                    .FirstOrDefaultAsync(d => d.Title.Contains(title));
                if (doc != null)
                {
                    return $"TÀI LIỆU\nTiêu đề: {doc.Title}\nTác giả: {doc.Author}\nDanh mục: {doc.Category?.CategoryName}\nGiá: {(doc.Price.HasValue ? doc.Price.Value + " VNĐ" : "Không có")}\nTrạng thái: {doc.SystemStatus?.Name}\nMô tả: {doc.Description}";
                }
            }

            // -------- Review --------
            if (q.Contains("đánh giá", StringComparison.OrdinalIgnoreCase))
            {
                var title = ExtractQuoted(q);
                if (!string.IsNullOrEmpty(title))
                {
                    var reviews = await _db.Reviews.AsNoTracking()
                        .Include(r => r.Order)
                            .ThenInclude(o => o.OrderDetails)
                                .ThenInclude(od => od.Document)
                        .Where(r => r.Order.OrderDetails.Any(od => od.Document.Title.Contains(title)))
                        .OrderByDescending(r => r.Rating)
                        .Take(3)
                        .ToListAsync();
                    if (reviews.Any())
                    {
                        var lines = reviews.Select(r => $"• {r.Rating}/5 bởi {PseudoUser(r.ReviewerId)}: {Truncate(r.Comment, 100)}");
                        return $"TOP ĐÁNH GIÁ CHO '{title}':\n" + string.Join("\n", lines);
                    }
                }
            }

            // -------- Notifications (nếu userId có) --------
            if (userId.HasValue && q.Contains("thông báo", StringComparison.OrdinalIgnoreCase))
            {
                var noti = await _db.Notifications.AsNoTracking()
                    .Where(n => n.UserId == userId.Value)
                    .OrderByDescending(n => n.CreatedAt)
                    .Take(5)
                    .Select(n => $"• {n.CreatedAt:dd/MM HH:mm}: {Truncate(n.Message, 120)}")
                    .ToListAsync();
                if (noti.Any())
                {
                    return "CÁC THÔNG BÁO GẦN ĐÂY:\n" + string.Join("\n", noti);
                }
            }

            // -------- User Statistics (nếu userId) --------
            if (userId.HasValue && (q.Contains("thống kê", StringComparison.OrdinalIgnoreCase) || q.Contains("bao nhiêu", StringComparison.OrdinalIgnoreCase)))
            {
                // Nếu có service thống kê, dùng; nếu không tự đếm.
                int numDocs = await _db.Documents.CountAsync(d => d.UserId == userId.Value && !d.IsDeleted);
                int bought = await _db.Orders.CountAsync(o => o.BuyerId == userId.Value);
                int sold = await _db.Orders.CountAsync(o => o.SellerId == userId.Value);
                return $"Thống kê của bạn:\n• Số tài liệu sở hữu: {numDocs}\n• Đơn hàng đã mua: {bought}\n• Đơn hàng đã bán: {sold}";
            }

            // -------- Categories phổ biến --------
            if (q.Contains("danh mục", StringComparison.OrdinalIgnoreCase) || q.Contains("thể loại", StringComparison.OrdinalIgnoreCase))
            {
                var topCat = await _db.Documents.AsNoTracking()
                    .GroupBy(d => new { d.CategoryId, d.Category.CategoryName })
                    .Select(g => new { g.Key.CategoryName, Count = g.Count() })
                    .OrderByDescending(g => g.Count)
                    .Take(5)
                    .ToListAsync();
                if (topCat.Any())
                {
                    var lines = topCat.Select(c => $"• {c.CategoryName}: {c.Count} tài liệu");
                    return "TOP DANH MỤC NHIỀU TÀI LIỆU:\n" + string.Join("\n", lines);
                }
            }

            // -------- Payment chi tiết --------
            var paymentMatch = System.Text.RegularExpressions.Regex.Match(q, @"thanh\s*toán\s*#?(\d+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            if (paymentMatch.Success && int.TryParse(paymentMatch.Groups[1].Value, out int payId))
            {
                var pay = await _db.Payments.AsNoTracking()
                    .Include(p => p.PaymentMethod)
                    .Include(p => p.PaymentStatus)
                    .Include(p => p.Order)
                    .FirstOrDefaultAsync(p => p.PaymentId == payId);
                if (pay != null)
                {
                    return $"CHI TIẾT THANH TOÁN #{pay.PaymentId}\nĐơn hàng: {pay.OrderId}\nSố tiền: {pay.Order?.TotalAmount ?? 0} VNĐ\nPhương thức: {pay.PaymentMethod?.Name}\nTrạng thái: {pay.PaymentStatus?.Name}";
                }
            }

            return null;
        }

        private static string PseudoUser(int userId) => $"User#{userId}";

        private static string Truncate(string? text, int max) =>
            string.IsNullOrEmpty(text) ? string.Empty : (text.Length <= max ? text : text[..max] + "...");

        private static string? ExtractQuoted(string input)
        {
            // Hỗ trợ cả '...' và "..."
            int first = input.IndexOf('\'');
            int last = input.LastIndexOf('\'');
            if (first >= 0 && last > first) return input.Substring(first + 1, last - first - 1);
            first = input.IndexOf('"');
            last = input.LastIndexOf('"');
            return (first >= 0 && last > first) ? input.Substring(first + 1, last - first - 1) : null;
        }

        #endregion
    }
}
