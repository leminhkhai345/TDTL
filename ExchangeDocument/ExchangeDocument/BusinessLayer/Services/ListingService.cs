using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Services
{
    public class ListingService : IListingService
    {
        private readonly IDocumentRepository _docRepo;
        private readonly IListingRepository _listingRepo;
        private readonly ISystemStatusRepository _statusRepo;
        private readonly ExchangeDocumentContext _context;
        private readonly ILogger<ListingService> _logger;
        private readonly INotificationService _notificationService;

        public ListingService(
            IDocumentRepository docRepo,
            IListingRepository listingRepo,
            ISystemStatusRepository statusRepo,
            ExchangeDocumentContext context,
            ILogger<ListingService> logger,
            INotificationService notificationService)
        {
            _docRepo = docRepo;
            _listingRepo = listingRepo;
            _statusRepo = statusRepo;
            _context = context;
            _logger = logger;
            _notificationService = notificationService;
        }

        public async Task<(ListingDetailDto? dto, string? error)> CreateListingAsync(ListingCreateDto dto, int userId)
        {
            _logger.LogInformation("Begin creating listing for user {UserId} and document {DocumentId}", userId, dto.DocumentId);

            if (dto.DocumentId < 1)
                return (null, "Invalid DocumentId.");
            if (dto.ListingType != 0 && dto.ListingType != 1)
                return (null, "Invalid ListingType.");
            if (dto.ListingType == 0)
            {
                if (!dto.Price.HasValue || dto.Price <= 0)
                    return (null, "Price must be >0 for sell listings.");
                if (dto.DesiredDocumentIds != null && dto.DesiredDocumentIds.Any())
                    return (null, "DesiredDocumentIds must be empty for sell listings.");
            }
            else
            {
                if (dto.DesiredDocumentIds == null || !dto.DesiredDocumentIds.Any())
                    return (null, "At least one DesiredDocumentId required for exchange listings.");
                if (dto.Price.HasValue)
                    return (null, "Price must be null for exchange listings.");
            }

            var document = await _docRepo.GetByIdAsync(dto.DocumentId);
            if (document == null)
                return (null, "Document not found.");
            if (document.UserId != userId)
                return (null, "You are not the owner of this document.");
            if (document.SystemStatus.Code != "InStock")
                return (null, "Document must be InStock to create a listing.");

            var listingPending = await _statusRepo.GetByDomainAndCodeAsync("Listing", "Pending");
            if (listingPending == null)
                return (null, "Listing Pending status not found.");
            var documentListed = await _statusRepo.GetByDomainAndCodeAsync("Document", "Listed");
            if (documentListed == null)
                return (null, "Document Listed status not found.");
            var listingActive = await _statusRepo.GetByDomainAndCodeAsync("Listing", "Active");
            if (listingActive == null)
                return (null, "Listing Active status not found.");
            var existsConflict = await _context.Listings
                .Where(l => !l.IsDeleted && l.DocumentId == dto.DocumentId
                            && (l.ListingStatusId == listingPending.StatusId || l.ListingStatusId == listingActive.StatusId))
                .AnyAsync();
            if (existsConflict)
                return (null, "Document is already part of another pending/active listing.");

            var desiredIds = new List<int>();
            if (dto.ListingType == 1)
            {
                desiredIds = dto.DesiredDocumentIds!.Distinct().ToList();
                int? otherOwnerId = null;
                foreach (var did in desiredIds)
                {
                    if (did == dto.DocumentId)
                        return (null, "Cannot exchange a document with itself.");
                    var ddoc = await _docRepo.GetByIdAsync(did);
                    if (ddoc == null)
                        return (null, $"Desired document {did} not found.");
                    if (ddoc.UserId == userId)
                        return (null, $"Cannot exchange with your own document {did}.");
                    if (ddoc.SystemStatus.Code != "InStock")
                        return (null, $"Desired document {did} is not available for exchange.");
                    if (otherOwnerId == null)
                        otherOwnerId = ddoc.UserId;
                    else if (otherOwnerId != ddoc.UserId)
                        return (null, "All desired documents must belong to the same owner.");
                }
            }

            // Validate payment methods
            var paymentMethodIds = dto.PaymentMethodIds?.Distinct().ToList() ?? new List<int>();
            if (paymentMethodIds.Any())
            {
                var validCount = await _context.PaymentMethods.Where(p => paymentMethodIds.Contains(p.PaymentMethodId) && p.IsEnabled).CountAsync();
                if (validCount != paymentMethodIds.Count)
                    return (null, "Some payment methods are invalid or disabled.");
            }
            // If none provided, leave list empty meaning all enabled methods allowed

            using var tx = await _context.Database.BeginTransactionAsync();
            var committed = false;
            try
            {
                var listing = new Listing
                {
                    DocumentId = dto.DocumentId,
                    OwnerId = userId,
                    ListingType = dto.ListingType,
                    Price = dto.ListingType == 0 ? dto.Price : null,
                    Description = dto.Description,
                    ListingStatusId = listingPending.StatusId,
                    CreatedAt = DateTime.UtcNow
                };
                if (dto.ListingType == 1)
                    foreach (var did in desiredIds)
                        listing.ExchangeItems.Add(new ListingExchangeItem { DesiredDocumentId = did });

                foreach (var pid in paymentMethodIds)
                    listing.ListingPaymentMethods.Add(new ListingPaymentMethod { PaymentMethodId = pid });

                await _listingRepo.AddAsync(listing);
                document.StatusId = documentListed.StatusId;
                await _docRepo.UpdateAsync(document);

                await _context.SaveChangesAsync();
                _logger.LogInformation("User {UserId} created listing {ListingId}", userId, listing.ListingId);

                // Load payment method names (navigation PaymentMethod may be null because not eagerly loaded)
                var paymentDict = paymentMethodIds.Any()
                    ? await _context.PaymentMethods
                        .Where(p => paymentMethodIds.Contains(p.PaymentMethodId))
                        .ToDictionaryAsync(p => p.PaymentMethodId, p => (p.Name, p.IsEnabled))
                    : new Dictionary<int, (string Name, bool IsEnabled)>();

                var resultDto = new ListingDetailDto
                {
                    ListingId = listing.ListingId,
                    DocumentId = listing.DocumentId,
                    DocumentTitle = listing.Document.Title,
                    Author = listing.Document.Author,
                    CategoryName = listing.Document.Category.CategoryName,
                    ImageUrl = listing.Document.ImageUrl,
                    OwnerId = listing.OwnerId,
                    OwnerName = listing.Owner.FullName,
                    ListingType = listing.ListingType,
                    Price = listing.Price,
                    Description = listing.Description,
                    ListingStatusId = listing.ListingStatusId,
                    StatusName = listingPending.Name,
                    CreatedAt = listing.CreatedAt,
                    DesiredDocumentIds = dto.ListingType == 1 ? desiredIds : null,
                    AcceptedPaymentMethods = listing.ListingPaymentMethods.Select(pm =>
                    {
                        if (paymentDict.TryGetValue(pm.PaymentMethodId, out var info))
                        {
                            return new PaymentMethodDto
                            {
                                PaymentMethodId = pm.PaymentMethodId,
                                Name = info.Name,
                                IsEnabled = info.IsEnabled
                            };
                        }
                        return new PaymentMethodDto { PaymentMethodId = pm.PaymentMethodId, Name = string.Empty, IsEnabled = false };
                    }).ToList(),
                    RowVersion = listing.RowVersion
                };
                await tx.CommitAsync();
                committed = true;
                return (resultDto, null);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!committed)
                    await tx.RollbackAsync();
                _logger.LogWarning("Concurrency conflict when creating listing for user {UserId}", userId);
                return (null, "Conflict: concurrent update detected.");
            }
            catch (Exception ex)
            {
                if (!committed)
                    await tx.RollbackAsync();
                _logger.LogError(ex, "Unexpected error when creating listing for user {UserId}", userId);
                throw;
            }
        }

        public async Task<ListingDetailDto?> GetListingByIdAsync(int id)
        {
            var listing = await _listingRepo.GetByIdAsync(id);

            // Only return if listing exists, not soft-deleted and is currently Active
            //if (listing == null || listing.IsDeleted || listing.SystemStatus.Domain != "Listing" || listing.SystemStatus.Code != "Active")
            if (listing == null || listing.IsDeleted || listing.SystemStatus.Domain != "Listing")
                return null;

            var dto = new ListingDetailDto
            {
                ListingId = listing.ListingId,
                DocumentId = listing.DocumentId,
                DocumentTitle = listing.Document?.Title ?? string.Empty,
                Author = listing.Document?.Author,
                CategoryName = listing.Document?.Category?.CategoryName ?? string.Empty,
                ImageUrl = listing.Document?.ImageUrl,
                OwnerId = listing.OwnerId,
                OwnerName = listing.Owner?.FullName ?? string.Empty,
                ListingType = listing.ListingType,
                Price = listing.Price,
                Description = listing.Description,
                ListingStatusId = listing.ListingStatusId,
                StatusName = listing.SystemStatus.Name,
                CreatedAt = listing.CreatedAt,
                DesiredDocumentIds = listing.ExchangeItems.Select(e => e.DesiredDocumentId).ToList(),
                AcceptedPaymentMethods = listing.ListingPaymentMethods.Select(pm => new PaymentMethodDto { PaymentMethodId = pm.PaymentMethodId, Name = pm.PaymentMethod.Name, IsEnabled = pm.PaymentMethod.IsEnabled }).ToList(),
                RowVersion = listing.RowVersion
            };

            return dto;
        }

        public async Task<ListingDetailDto?> AdminGetListingByIdAsync(int id)
        {
            var listing = await _listingRepo.GetByIdAsync(id);
            if (listing == null) return null;
            var dto = new ListingDetailDto
            {
                ListingId = listing.ListingId,
                DocumentId = listing.DocumentId,
                DocumentTitle = listing.Document.Title,
                Author = listing.Document.Author,
                CategoryName = listing.Document.Category.CategoryName,
                ImageUrl = listing.Document.ImageUrl,
                OwnerId = listing.OwnerId,
                OwnerName = listing.Owner.FullName,
                ListingType = listing.ListingType,
                Price = listing.Price,
                Description = listing.Description,
                ListingStatusId = listing.ListingStatusId,
                StatusName = listing.SystemStatus.Name,
                CreatedAt = listing.CreatedAt,
                DesiredDocumentIds = listing.ExchangeItems.Select(e => e.DesiredDocumentId).ToList(),
                AcceptedPaymentMethods = listing.ListingPaymentMethods.Select(pm => new PaymentMethodDto { PaymentMethodId = pm.PaymentMethodId, Name = pm.PaymentMethod.Name, IsEnabled = pm.PaymentMethod.IsEnabled }).ToList(),
                RowVersion = listing.RowVersion
            };
            return dto;
        }

        public async Task<PagedResult<ListingDetailDto>> GetMyListingsAsync(int userId, int pageNumber, int pageSize)
        {
            var listings = await _listingRepo.GetByOwnerAsync(userId);
            var totalCount = listings.Count;
            var items = listings
                .Where(l => !l.IsDeleted && l.SystemStatus.Domain == "Listing" &&
                            (l.SystemStatus.Code == "Pending" || l.SystemStatus.Code == "Active" || l.SystemStatus.Code == "Rejected"))
                .OrderByDescending(l => l.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new ListingDetailDto
                {
                    ListingId = l.ListingId,
                    DocumentId = l.DocumentId,
                    DocumentTitle = l.Document.Title,
                    Author = l.Document.Author,
                    CategoryName = l.Document.Category.CategoryName,
                    ImageUrl = l.Document.ImageUrl,
                    OwnerId = l.OwnerId,
                    OwnerName = l.Owner.FullName,
                    ListingType = l.ListingType,
                    Price = l.Price,
                    Description = l.Description,
                    ListingStatusId = l.ListingStatusId,
                    StatusName = l.SystemStatus.Name,
                    CreatedAt = l.CreatedAt,
                    DesiredDocumentIds = l.ExchangeItems.Select(e => e.DesiredDocumentId).ToList(),
                    AcceptedPaymentMethods = l.ListingPaymentMethods.Select(pm => new PaymentMethodDto { PaymentMethodId = pm.PaymentMethodId, Name = pm.PaymentMethod.Name, IsEnabled = pm.PaymentMethod.IsEnabled }).ToList(),
                    RowVersion = l.RowVersion
                })
                .ToList();

            return new PagedResult<ListingDetailDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<PagedResult<ListingSummaryDto>> GetPublicListingsAsync(int pageNumber, int pageSize)
        {
            var (items, totalCount) = await _listingRepo.GetActivePagedAsync(pageNumber, pageSize);
            var dtos = items
                .Where(l => !l.IsDeleted && l.SystemStatus.Domain == "Listing" && l.SystemStatus.Code == "Active")
                .Select(l => new ListingSummaryDto
                {
                    ListingId = l.ListingId,
                    DocumentId = l.DocumentId,
                    DocumentTitle = l.Document.Title,
                    Author = l.Document.Author,
                    CategoryName = l.Document.Category.CategoryName,
                    ImageUrl = l.Document.ImageUrl,
                    Price = l.Price,
                    ListingType = l.ListingType,
                    StatusName = l.SystemStatus.Name,
                    CreatedAt = l.CreatedAt
                })
                .ToList();

            return new PagedResult<ListingSummaryDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                Page = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<(ListingDetailDto? dto, string? error)> UpdateListingAsync(int id, ListingUpdateDto dto, int userId)
        {
            var listing = await _listingRepo.GetByIdAsync(id);
            if (listing == null) return (null, "NotFound");
            if (listing.OwnerId != userId) return (null, "Forbidden");
            if (listing.IsDeleted) return (null, "NotFound");
            // capture initial listing status
            string initialStatusCode = listing.SystemStatus.Code;
            var status = listing.SystemStatus;
            if (status.Domain != "Listing" || (status.Code != "Pending" && status.Code != "Active" && status.Code != "Rejected"))
                return (null, "Cannot update listing in its current state.");

            if (listing.ListingType == 0)
            {
                if (!dto.Price.HasValue || dto.Price <= 0)
                    return (null, "Price must be > 0 for sell listings.");
                if (dto.DesiredDocumentIds != null && dto.DesiredDocumentIds.Any())
                    return (null, "DesiredDocumentIds must be empty for sell listings.");
            }
            else
            {
                if (dto.DesiredDocumentIds == null || !dto.DesiredDocumentIds.Any())
                    return (null, "At least one DesiredDocumentId required for exchange listings.");
                if (dto.Price.HasValue)
                    return (null, "Price must be null for exchange listings.");
            }

            var entry = _context.Entry(listing);
            entry.Property(l => l.RowVersion).OriginalValue = dto.RowVersion;

            if (listing.ListingType == 0)
            {
                listing.Price = dto.Price;
                listing.Description = dto.Description;
            }
            else
            {
                // validate desired documents for exchange update
                var desiredIds = dto.DesiredDocumentIds!.Distinct().ToList();
                int? otherOwnerId = null;
                foreach (var did in desiredIds)
                {
                    if (did == listing.DocumentId)
                        return (null, "Cannot exchange a document with itself.");
                    var ddoc = await _docRepo.GetByIdAsync(did);
                    if (ddoc == null)
                        return (null, $"Desired document {did} not found.");
                    if (ddoc.UserId == userId)
                        return (null, $"Cannot exchange with your own document {did}.");
                    if (ddoc.SystemStatus.Code != "InStock")
                        return (null, $"Desired document {did} is not available for exchange.");
                    if (otherOwnerId == null)
                        otherOwnerId = ddoc.UserId;
                    else if (otherOwnerId != ddoc.UserId)
                        return (null, "All desired documents must belong to the same owner.");
                }
                _context.ListingExchangeItems.RemoveRange(listing.ExchangeItems);
                // apply exchange items
                var newItems = desiredIds
                    .Select(did => new ListingExchangeItem { ListingId = id, DesiredDocumentId = did })
                    .ToList();
                _context.ListingExchangeItems.AddRange(newItems);
                listing.ExchangeItems = newItems;
                listing.Price = null;
                listing.Description = dto.Description;
            }

            // Handle payment methods update
            var newPaymentIds = dto.PaymentMethodIds?.Distinct().ToList();
            if (newPaymentIds != null)
            {
                if (newPaymentIds.Any())
                {
                    var countValid = await _context.PaymentMethods.Where(p => newPaymentIds.Contains(p.PaymentMethodId) && p.IsEnabled).CountAsync();
                    if (countValid != newPaymentIds.Count) return (null, "Some payment methods are invalid or disabled.");
                }
                // Clear existing and apply new (can be empty)
                listing.ListingPaymentMethods.Clear();
                foreach (var pid in newPaymentIds)
                    listing.ListingPaymentMethods.Add(new ListingPaymentMethod { PaymentMethodId = pid });
            }

            listing.UpdatedAt = DateTime.UtcNow;
            // if resubmitting after rejection, enforce single listing and reset statuses
            if (initialStatusCode == "Rejected")
            {
                var pendingListingStatus = await _statusRepo.GetByDomainAndCodeAsync("Listing", "Pending");
                var activeListingStatus = await _statusRepo.GetByDomainAndCodeAsync("Listing", "Active");
                if (pendingListingStatus == null)
                    return (null, "System error: Pending Listing status missing.");
                if (activeListingStatus == null)
                    return (null, "System error: Active Listing status missing.");
                var conflictExists = await _context.Listings
                    .Where(l => !l.IsDeleted && l.DocumentId == listing.DocumentId && l.ListingId != id
                                && (l.ListingStatusId == pendingListingStatus.StatusId || l.ListingStatusId == activeListingStatus.StatusId))
                    .AnyAsync();
                if (conflictExists)
                    return (null, "Document is already part of another pending/active listing.");

                // reset statuses for this listing
                listing.ListingStatusId = pendingListingStatus.StatusId;
                listing.RejectionReason = null;
                var listedDocumentStatus = await _statusRepo.GetByDomainAndCodeAsync("Document", "Listed");
                if (listedDocumentStatus == null)
                    return (null, "System error: Listed Document status missing.");
                listing.Document.StatusId = listedDocumentStatus.StatusId;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogWarning(ex, "Conflict updating listing {ListingId} for user {UserId}", id, userId);
                return (null, "Conflict: concurrent update detected.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error when updating listing for user {UserId}", userId);
                throw;
            }

            var resultDto = new ListingDetailDto
            {
                ListingId = listing.ListingId,
                DocumentId = listing.DocumentId,
                DocumentTitle = listing.Document.Title,
                Author = listing.Document.Author,
                CategoryName = listing.Document.Category.CategoryName,
                ImageUrl = listing.Document.ImageUrl,
                OwnerId = listing.OwnerId,
                OwnerName = listing.Owner.FullName,
                ListingType = listing.ListingType,
                Price = listing.Price,
                Description = listing.Description,
                ListingStatusId = listing.ListingStatusId,
                StatusName = listing.SystemStatus.Name,
                CreatedAt = listing.CreatedAt,
                DesiredDocumentIds = listing.ExchangeItems.Select(e => e.DesiredDocumentId).ToList(),
                AcceptedPaymentMethods = listing.ListingPaymentMethods.Select(pm => new PaymentMethodDto { PaymentMethodId = pm.PaymentMethodId, Name = pm.PaymentMethod.Name, IsEnabled = pm.PaymentMethod.IsEnabled }).ToList(),
                RowVersion = listing.RowVersion
            };
            return (resultDto, null);
        }

        /// <summary>
        /// Soft-delete an existing listing (owner only).
        /// </summary>
        public async Task<string?> DeleteListingAsync(int id, int userId, byte[] rowVersion)
        {
            // Fetch the listing including related data
            var listing = await _listingRepo.GetByIdAsync(id);
            if (listing == null)
                return "NotFound";
            if (listing.OwnerId != userId)
                return "Forbidden";
            if (listing.SystemStatus.Code == "Sold")
                return "Cannot delete a sold listing.";
            if (listing.SystemStatus.Code == "Reserved")
                return "Cannot delete a reserved listing.";

            // Apply concurrency token for optimistic concurrency
            var entry = _context.Entry(listing);
            entry.Property(l => l.RowVersion).OriginalValue = rowVersion;

            // start transaction
            using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                // Remove any exchange items linked to this listing
                if (listing.ExchangeItems?.Any() == true)
                    _context.ListingExchangeItems.RemoveRange(listing.ExchangeItems);

                // Remove any payment methods linked to this listing
                if (listing.ListingPaymentMethods?.Any() == true)
                    _context.ListingPaymentMethods.RemoveRange(listing.ListingPaymentMethods);

                // Soft delete the listing
                listing.IsDeleted = true;
                listing.UpdatedAt = DateTime.UtcNow;

                // Update document status back to InStock if it was Listed
                var document = await _docRepo.GetByIdAsync(listing.DocumentId);
                if (document != null && document.SystemStatus.Code == "Listed")
                {
                    var inStockStatus = await _statusRepo.GetByDomainAndCodeAsync("Document", "InStock");
                    if (inStockStatus == null)
                        return "Document InStock status not found.";
                    document.StatusId = inStockStatus.StatusId;
                    await _docRepo.UpdateAsync(document);
                }

                await _context.SaveChangesAsync();
                await tx.CommitAsync();
                return null;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogWarning(ex, "Conflict deleting listing {ListingId} for user {UserId}", id, userId);
                return "Conflict: concurrent update detected.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting listing {ListingId}", id);
                throw;
            }
        }

        /// <summary>
        /// Admin: retrieve paginated listings with filtering and sorting.
        /// </summary>
        public async Task<PagedResult<AdminListingViewDto>> GetAdminListingsAsync(AdminListingQueryParametersDto queryParams)
        {
            // Base query: include related entities, exclude soft-deleted
            var query = _context.Listings
                .AsNoTracking()
                .Include(l => l.Owner)
                .Include(l => l.Document)
                .Include(l => l.SystemStatus)
                .Include(l => l.ExchangeItems).ThenInclude(e => e.DesiredDocument)
                .Include(l => l.ListingPaymentMethods).ThenInclude(pm => pm.PaymentMethod)
                .Where(l => !l.IsDeleted);

            // Filter by status code
            if (!string.IsNullOrWhiteSpace(queryParams.Status))
            {
                var status = await _statusRepo.GetByDomainAndCodeAsync("Listing", queryParams.Status);
                if (status != null)
                    query = query.Where(l => l.ListingStatusId == status.StatusId);
            }

            // Sorting
            var sortOrder = (queryParams.SortOrder ?? "desc").ToLower();
            switch (queryParams.SortBy?.ToLower())
            {
                case "ownername":
                    query = sortOrder == "asc"
                        ? query.OrderBy(l => l.Owner.FullName)
                        : query.OrderByDescending(l => l.Owner.FullName);
                    break;
                case "documenttitle":
                    query = sortOrder == "asc"
                        ? query.OrderBy(l => l.Document.Title)
                        : query.OrderByDescending(l => l.Document.Title);
                    break;
                case "statusname":
                    query = sortOrder == "asc"
                        ? query.OrderBy(l => l.SystemStatus.Name)
                        : query.OrderByDescending(l => l.SystemStatus.Name);
                    break;
                case "listingtype":
                    query = sortOrder == "asc"
                        ? query.OrderBy(l => l.ListingType)
                        : query.OrderByDescending(l => l.ListingType);
                    break;
                case "createdat":
                default:
                    query = sortOrder == "asc"
                        ? query.OrderBy(l => l.CreatedAt)
                        : query.OrderByDescending(l => l.CreatedAt);
                    break;
            }

            // Paging: ensure parameters valid
            var pageNumber = Math.Max(queryParams.PageNumber, 1);
            // Clamp PageSize between 1 and 50
            var pageSize = Math.Min(Math.Max(queryParams.PageSize, 1), 50);
            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new AdminListingViewDto
                {
                    ListingId = l.ListingId,
                    DocumentId = l.DocumentId,
                    DocumentTitle = l.Document.Title,
                    Author = l.Document.Author,
                    CategoryName = l.Document.Category.CategoryName,
                    ImageUrl = l.Document.ImageUrl,
                    OwnerId = l.OwnerId,
                    OwnerName = l.Owner.FullName,
                    ListingType = l.ListingType,
                    Price = l.Price,
                    Description = l.Description,
                    ListingStatusId = l.ListingStatusId,
                    StatusName = l.SystemStatus.Name,
                    StatusCode = l.SystemStatus.Code,
                    CreatedAt = l.CreatedAt,
                    UpdatedAt = l.UpdatedAt,
                    RejectionReason = l.RejectionReason,
                    RowVersion = l.RowVersion,
                    DesiredDocuments = l.ExchangeItems
                        .Select(ei => new DesiredDocumentDto { DocumentId = ei.DesiredDocumentId, Title = ei.DesiredDocument.Title })
                        .ToList(),
                    AcceptedPaymentMethods = l.ListingPaymentMethods
                        .Select(pm => new PaymentMethodDto { PaymentMethodId = pm.PaymentMethodId, Name = pm.PaymentMethod.Name, IsEnabled = pm.PaymentMethod.IsEnabled })
                        .ToList()
                })
                .ToListAsync();

            return new PagedResult<AdminListingViewDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<string?> ApproveListingAsync(int id, byte[] rowVersion)
        {
            _logger.LogInformation("Begin approving listing {ListingId}", id);
            var listing = await _listingRepo.GetByIdAsync(id);
            if (listing == null) return "NotFound";
            if (listing.SystemStatus.Code != "Pending") return "InvalidState";
            _context.Entry(listing).Property(l => l.RowVersion).OriginalValue = rowVersion;
            var statusActive = await _statusRepo.GetByDomainAndCodeAsync("Listing", "Active");
            if (statusActive == null)
                throw new InvalidOperationException("Active listing status not configured.");
            listing.ListingStatusId = statusActive.StatusId;
            listing.UpdatedAt = DateTime.UtcNow;

            using var tx = await _context.Database.BeginTransactionAsync();
            var committed = false;
            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Listing {ListingId} approved", listing.ListingId);
                var (notif, error) = await _notificationService.CreateNotificationAsync(listing.OwnerId, new NotificationCreateDto
                {
                    Message = "Your listing has been approved.",
                    NotificationType = "ListingApproved",
                    ReferenceId = listing.ListingId,
                    Link = $"/api/listings/{listing.ListingId}"
                });
                if (error != null) _logger.LogWarning("Notification failed: {Error}", error);

                await tx.CommitAsync();
                committed = true;
                return null;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                if (!committed)
                    await tx.RollbackAsync();
                _logger.LogWarning(ex, "Concurrency conflict approving listing {ListingId}", id);
                return "ConcurrencyConflict";
            }
            catch (Exception ex)
            {
                if (!committed)
                    await tx.RollbackAsync();
                _logger.LogError(ex, "Unexpected error approving listing {ListingId}", id);
                throw;
            }
        }

        public async Task<string?> RejectListingAsync(int id, string reason, byte[] rowVersion)
        {
            _logger.LogInformation("Begin rejecting listing {ListingId}", id);
            var listing = await _listingRepo.GetByIdAsync(id);
            if (listing == null) return "NotFound";
            if (listing.SystemStatus.Code != "Pending") return "InvalidState";
            _context.Entry(listing).Property(l => l.RowVersion).OriginalValue = rowVersion;
            var statusRejected = await _statusRepo.GetByDomainAndCodeAsync("Listing", "Rejected");
            if (statusRejected == null)
                throw new InvalidOperationException("Rejected listing status not configured.");
            listing.ListingStatusId = statusRejected.StatusId;
            listing.RejectionReason = reason;
            listing.UpdatedAt = DateTime.UtcNow;
            var statusInStock = await _statusRepo.GetByDomainAndCodeAsync("Document", "InStock");
            if (statusInStock == null)
                throw new InvalidOperationException("Document InStock status not configured.");
            listing.Document.StatusId = statusInStock.StatusId;

            using var tx = await _context.Database.BeginTransactionAsync();
            var committed = false;
            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Listing {ListingId} rejected", listing.ListingId);
                var (notif, error) = await _notificationService.CreateNotificationAsync(listing.OwnerId, new NotificationCreateDto
                {
                    Message = $"Your listing has been rejected: {reason}",
                    NotificationType = "ListingRejected",
                    ReferenceId = listing.ListingId,
                    Link = $"/api/listings/{listing.ListingId}"
                });
                if (error != null) _logger.LogWarning("Notification failed: {Error}", error);

                await tx.CommitAsync();
                committed = true;
                return null;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                if (!committed)
                    await tx.RollbackAsync();
                _logger.LogWarning(ex, "Concurrency conflict rejecting listing {ListingId}", id);
                return "ConcurrencyConflict";
            }
            catch (Exception ex)
            {
                if (!committed)
                    await tx.RollbackAsync();
                _logger.LogError(ex, "Unexpected error rejecting listing {ListingId}", id);
                throw;
            }
        }
    }
}

//111