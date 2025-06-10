using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using ExchangeDocument.BusinessLayer.Enums;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/metadata")]
    public class MetadataController : ControllerBase
    {
        private readonly ISystemStatusRepository _statusRepo;

        public MetadataController(ISystemStatusRepository statusRepo)
        {
            _statusRepo = statusRepo;
        }

        /// <summary>
        /// Get listing types for dropdowns
        /// </summary>
        [HttpGet("listing-types")]
        public ActionResult<List<ListingTypeDto>> GetListingTypes()
        {
            var items = Enum.GetValues(typeof(ListingType))
                .Cast<ListingType>()
                .Select(e => new ListingTypeDto { Value = (int)e, Name = e.ToString() })
                .ToList();
            return Ok(items);
        }

        /// <summary>
        /// Get system statuses for a given domain
        /// </summary>
        [HttpGet("system-statuses")]
        public async Task<ActionResult<List<SystemStatusDto>>> GetSystemStatuses([FromQuery] string domain)
        {
            if (string.IsNullOrWhiteSpace(domain))
                return BadRequest(new { error = "Domain is required.", allowedDomains = new[] { "Listing", "Document" } });

            var statuses = await _statusRepo.GetByDomainAsync(domain);
            if (!statuses.Any())
                return NotFound(new { error = $"No statuses found for domain '{domain}'." });

            var result = statuses.Select(s => new SystemStatusDto
            {
                StatusId = s.StatusId,
                Code = s.Code,
                Name = s.Name
            }).ToList();

            return Ok(result);
        }
    }
}
