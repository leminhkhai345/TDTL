using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using ExchangeDocument.BusinessLayer.DTOs;
using System.Linq;
using System.Linq.Expressions;

namespace ExchangeDocument.DataAccessLayer.Repositories
{
    public class DocumentRepository : IDocumentRepository
    {
        private readonly ExchangeDocumentContext _context;

        public DocumentRepository(ExchangeDocumentContext context)
        {
            _context = context;
        }

        public async Task<Document> AddAsync(Document document)
        {
            var entry = await _context.Documents.AddAsync(document);
            await _context.SaveChangesAsync();
            return entry.Entity;
        }

        public async Task<Document?> GetByIdAsync(int id)
        {
            return await _context.Documents
                                 .Include(d => d.Category)
                                 .Include(d => d.User)
                                 .Include(d => d.DocumentStatus)
                                 .FirstOrDefaultAsync(d => d.DocumentId == id);
        }

        public async Task<Document?> GetListedDocumentDetailsByIdAsync(int id)
        {
            return await _context.Documents
                                 .Include(d => d.Category)
                                 
                                 .Include(d => d.User)
                                 .Include(d => d.DocumentStatus)
                                 .FirstOrDefaultAsync(d => d.DocumentId == id && d.DocumentStatus.Code == "Listed");
        }

        public async Task<List<Document>> GetAllDocumentDetailsByAsync()
        {
            return await _context.Documents
                                 .ToListAsync();
        }

        public async Task<Document> UpdateAsync(Document document)
        {
            _context.Documents.Update(document);
            await _context.SaveChangesAsync();
            return document;
        }

        /// <summary>
        /// Soft-delete a document by marking IsDeleted flag and DeletedAt timestamp.
        /// </summary>
        public async Task SoftDeleteAsync(Document document)
        {
            document.IsDeleted = true;
            document.DeletedAt = DateTime.UtcNow;
            _context.Documents.Update(document);
            await _context.SaveChangesAsync();
        }

        public async Task<PagedResult<Document>> GetInventoryByUserAsync(int userId, DocumentQueryParameters queryParams)
        {
            // Basic query to get user's documents that are considered in inventory
            var query = _context.Documents
                .Include(d => d.Category) // Include related data needed for DTO mapping later
                .Include(d => d.User)
                .Include(d => d.DocumentStatus)
                .Where(d => d.UserId == userId && !d.IsDeleted &&
                            (d.DocumentStatus.Code == "InStock" || d.DocumentStatus.Code == "Listed")); // Core inventory logic

            // Get total count before sorting and pagination for accurate total
            var totalCount = await query.CountAsync();

            // --- Default Sorting --- Always sort by DocumentId descending for basic list
            query = query.OrderByDescending(d => d.DocumentId);

            // --- Pagination ---
            var items = await query
                .Skip((queryParams.Page - 1) * queryParams.PageSize)
                .Take(queryParams.PageSize)
                .ToListAsync();

            return new PagedResult<Document>
            {
                Items = items,
                TotalCount = totalCount,
                Page = queryParams.Page,
                PageSize = queryParams.PageSize
            };
        }
    }
}
