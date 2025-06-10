using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class UpdateProfileRequestDTO : IValidatableObject
    {
        [Required]
        [MaxLength(255)]
        public string FullName { get; set; }

        [Phone]
        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [DataType(DataType.Date)]
        public DateTime? Birth { get; set; }

        // Bank Account Information
        [MaxLength(50)]
        public string? BankAccountNumber { get; set; }

        [MaxLength(100)]
        public string? BankAccountName { get; set; }

        [MaxLength(100)]
        public string? BankName { get; set; }

        [MaxLength(100)]
        public string? BankBranch { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (Birth.HasValue && Birth.Value.Date > DateTime.Today)
                yield return new ValidationResult("Birth must be today or earlier", new[] { nameof(Birth) });
        }
    }
}
