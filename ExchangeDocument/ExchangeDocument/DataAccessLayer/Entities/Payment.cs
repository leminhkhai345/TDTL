    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    namespace ExchangeDocument.DataAccessLayer.Entities;

    public partial class Payment
    {
        public int PaymentId { get; set; }

        public int OrderId { get; set; }

        public int PaymentMethodId { get; set; }

        public DateTime PaymentDate { get; set; }

        public int PaymentStatusId { get; set; }

        public string? TransactionId { get; set; }

        [Timestamp]
        public byte[] RowVersion { get; set; } = null!;

        public virtual Order Order { get; set; } = null!;

        public virtual PaymentMethod PaymentMethod { get; set; } = null!;

        public virtual SystemStatus PaymentStatus { get; set; } = null!;
    }
