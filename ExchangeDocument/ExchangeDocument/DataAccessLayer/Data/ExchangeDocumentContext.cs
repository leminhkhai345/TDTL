using System;
using System.Collections.Generic;
using ExchangeDocument.DataAccessLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.Data;

public partial class ExchangeDocumentContext : DbContext
{
    public ExchangeDocumentContext()
    {
    }

    public ExchangeDocumentContext(DbContextOptions<ExchangeDocumentContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Document> Documents { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Userprofile> Userprofiles { get; set; }

    public virtual DbSet<SystemStatus> SystemStatuses { get; set; }

    public virtual DbSet<Listing> Listings { get; set; }

    public virtual DbSet<ListingExchangeItem> ListingExchangeItems { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<PaymentMethod> PaymentMethods { get; set; }

    public virtual DbSet<ListingPaymentMethod> ListingPaymentMethods { get; set; }

    public virtual DbSet<ReviewEvidence> ReviewEvidences { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Only configure if no options have been configured yet (e.g., when created outside DI)
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseSqlServer("Server=DESKTOP-6HCA7KG\\KHOA_SQLSERVER;Database=PBL3;User ID=sa;Password=dumamay12344321@@;TrustServerCertificate=True;MultipleActiveResultSets=true");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__categori__23CAF1D81CED1810");

            entity.ToTable("categories");

            entity.HasIndex(e => e.CategoryName, "UQ__categori__37077ABD5AD55994").IsUnique();

            entity.Property(e => e.CategoryId).HasColumnName("categoryId");
            entity.Property(e => e.CategoryName)
                .HasMaxLength(255)
                .HasColumnName("categoryName");
        });

        modelBuilder.Entity<Document>(entity =>
        {
            // Global filter: loại bỏ các document đã soft-delete
            entity.HasQueryFilter(d => !d.IsDeleted);
            entity.HasKey(e => e.DocumentId).HasName("PK__document__EFAAAD85262EE6A7");

            entity.ToTable("document");

            entity.Property(e => e.DocumentId).HasColumnName("documentId");
            entity.Property(e => e.Author)
                .HasMaxLength(255)
                .HasColumnName("author");
            entity.Property(e => e.CategoryId).HasColumnName("categoryId");
            entity.Property(e => e.Condition)
                .HasMaxLength(255)
                .HasColumnName("condition");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.StatusId)
                .HasColumnName("statusId")
                .HasDefaultValue(1);
            entity.Property(e => e.Edition)
                .HasMaxLength(100)
                .HasColumnName("edition");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(500)
                .HasColumnName("imageUrl");
            entity.Property(e => e.Isbn)
                .HasMaxLength(20)
                .HasColumnName("ISBN");
            entity.Property(e => e.Price)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("price")
                .IsRequired(false);

            // --- Thời gian tạo & cập nhật ---
            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime")
                .HasColumnName("createdAt")
                .HasDefaultValueSql("(getutcdate())");

            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updatedAt");

            entity.Property(e => e.PublicationYear).HasColumnName("publicationYear");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.UserId).HasColumnName("userId");

            entity.HasOne(d => d.Category).WithMany(p => p.Documents)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__document__catego__48CFD27E");

            entity.HasOne(d => d.SystemStatus)
                .WithMany(p => p.Documents)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Document_SystemStatus");

            entity.HasOne(d => d.User).WithMany(p => p.Documents)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__document__userId__47DBAE45");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__orders__0809335D8C96FDD5");

            entity.ToTable("orders");

            entity.Property(e => e.OrderId).HasColumnName("orderId");
            entity.Property(e => e.OrderDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("orderDate");
            entity.Property(e => e.ShippingAddress)
                .HasMaxLength(500)
                .HasColumnName("shippingAddress");
            entity.Property(e => e.SellerId).HasColumnName("sellerId");
            entity.Property(e => e.Notes)
                .HasMaxLength(1000)
                .HasColumnName("notes");
            entity.Property(e => e.OrderStatusId).HasColumnName("statusId");
            entity.Property(e => e.TotalAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("totalAmount");
            entity.Property(e => e.BuyerId).HasColumnName("buyerId");
            entity.Property(e => e.RowVersion).IsRowVersion().HasColumnName("rowVersion");
            entity.Property(e => e.RejectionReason)
                .HasColumnName("rejectionReason");
            entity.Property(e => e.ShippingProvider)
                .HasMaxLength(255)
                .HasColumnName("shippingProvider");
            entity.Property(e => e.TrackingNumber)
                .HasMaxLength(100)
                .HasColumnName("trackingNumber");
            entity.Property(e => e.PaymentMethodId).HasColumnName("paymentMethodId");
            entity.Property(e => e.ProofImageUrl).HasColumnName("proofImageUrl");
            entity.Property(e => e.CancellationReason).HasColumnName("cancellationReason");

            entity.HasOne(d => d.Buyer).WithMany(p => p.Orders)
                .HasForeignKey(d => d.BuyerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Orders_User");

            entity.HasOne(d => d.OrderStatus).WithMany()
                .HasForeignKey(d => d.OrderStatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Orders_SystemStatus");

            entity.HasOne(d => d.Seller).WithMany()
                .HasForeignKey(d => d.SellerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Orders_Seller_User");

            // Composite indexes to optimize queries on buyer/seller & status
            entity.HasIndex(e => new { e.BuyerId, e.OrderStatusId })
                .HasDatabaseName("IX_orders_buyerId_statusId");
            entity.HasIndex(e => new { e.SellerId, e.OrderStatusId })
                .HasDatabaseName("IX_orders_sellerId_statusId");
            entity.HasIndex(e => e.PaymentMethodId);
            entity.HasIndex(e => e.OrderDate);
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.OrderDetailId).HasName("PK__orderDet__E4FEDE4AE6141E30");

            entity.ToTable("orderDetails");

            entity.Property(e => e.OrderDetailId).HasColumnName("orderDetailId");
            entity.Property(e => e.DocumentId).HasColumnName("documentId");
            entity.Property(e => e.OrderId).HasColumnName("orderId");
            entity.Property(e => e.PriceAtOrderTime)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("priceAtOrderTime");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.ListingId).HasColumnName("listingId");
            entity.Property(e => e.Amount)
                .HasColumnType("decimal(29, 2)")
                .HasColumnName("amount")
                .HasComputedColumnSql("([priceAtOrderTime]*[quantity])");
            entity.Property(e => e.RowVersion).IsRowVersion().HasColumnName("rowVersion");

            entity.HasOne(d => d.Document).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.DocumentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__orderDeta__docum__59063A47");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__orderDeta__order__5812160E");

            entity.HasOne(d => d.Listing).WithMany()
                .HasForeignKey(d => d.ListingId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderDetails_Listing");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__payments__A0D9EFC6903F7ADB");

            entity.ToTable("payments");

            entity.HasIndex(e => e.OrderId, "UQ__payments__0809335CA88D5F23").IsUnique();

            entity.Property(e => e.PaymentId).HasColumnName("paymentId");
            entity.Property(e => e.OrderId).HasColumnName("orderId");
            entity.Property(e => e.PaymentDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnName("paymentDate");
            entity.Property(e => e.PaymentMethodId).HasColumnName("paymentMethodId");
            entity.Property(e => e.PaymentStatusId).HasColumnName("paymentStatusId");
            entity.Property(e => e.TransactionId)
                .HasMaxLength(255)
                .HasColumnName("transactionId");
            entity.Property(e => e.RowVersion).IsRowVersion().HasColumnName("rowVersion");

            entity.HasOne(d => d.Order).WithOne(p => p.Payment)
                .HasForeignKey<Payment>(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__payments__orderI__5EBF139D");

            entity.HasOne(d => d.PaymentStatus).WithMany()
                .HasForeignKey(d => d.PaymentStatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Payments_SystemStatus");

            entity.HasOne(d => d.PaymentMethod)
                .WithMany()
                .HasForeignKey(d => d.PaymentMethodId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Payments_PaymentMethod");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.ReviewId).HasName("PK_review");

            entity.ToTable("reviews");

            // Soft-delete global filter
            entity.HasQueryFilter(r => !r.IsDeleted);

            entity.Property(e => e.ReviewId).HasColumnName("reviewId");
            entity.Property(e => e.OrderId).HasColumnName("orderId");
            entity.Property(e => e.ReviewerId).HasColumnName("reviewerId");
            entity.Property(e => e.Rating).HasColumnName("rating");
            entity.Property(e => e.Comment).HasColumnName("comment");
            entity.Property(e => e.ReviewType).HasColumnName("reviewType");
            entity.Property(e => e.ReviewDate)
                .HasColumnType("datetime2")
                .HasColumnName("reviewDate")
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.IsEdited).HasColumnName("isEdited");
            entity.Property(e => e.LastEditedDate).HasColumnName("lastEditedDate");
            entity.Property(e => e.IsDeleted).HasColumnName("isDeleted");
            entity.Property(e => e.RowVersion).IsRowVersion().HasColumnName("rowVersion");

            // Unique constraint: each order has max 1 review
            entity.HasIndex(e => e.OrderId).IsUnique();

            entity.HasOne(d => d.Order)
                .WithOne(p => p.Review)
                .HasForeignKey<Review>(d => d.OrderId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Review_Order");

            entity.HasOne(d => d.Reviewer)
                .WithMany()
                .HasForeignKey(d => d.ReviewerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Review_User");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__roles__CD98462A6EE9A78E");

            entity.ToTable("roles");

            entity.HasIndex(e => e.RoleName, "UQ__roles__B1947861244D93DE").IsUnique();

            entity.Property(e => e.RoleId).HasColumnName("roleId");
            entity.Property(e => e.RoleName)
                .HasMaxLength(50)
                .HasColumnName("roleName");

            // Seed default roles (ensure IDs stable)
            entity.HasData(
                new Role { RoleId = 1, RoleName = "Admin" },
                new Role { RoleId = 2, RoleName = "User" }
            );
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__users__CB9A1CFFCF587D49");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "UQ__users__AB6E616450D264B5").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("userId");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(255)
                .HasColumnName("fullName");
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .HasColumnName("password");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .HasColumnName("phone");
            entity.Property(e => e.RoleId)
                .HasDefaultValue(2)
                .HasColumnName("roleId");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Users_Roles");
        });

        modelBuilder.Entity<User>()
            .HasQueryFilter(u => !u.IsDeleted);
        // User lock filter (optional): do NOT return locked users in admin queries if needed
        // modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted && !u.IsLocked);

        modelBuilder.Entity<Userprofile>(entity =>
        {
            entity.HasKey(e => e.UserprofileId).HasName("PK__userprof__CCABE6BFE822A043");

            entity.ToTable("userprofiles");

            entity.HasIndex(e => e.UserId, "UQ__userprof__CB9A1CFE701C0233").IsUnique();

            entity.Property(e => e.UserprofileId).HasColumnName("userprofileId");
            entity.Property(e => e.Address)
                .HasMaxLength(500)
                .HasColumnName("address");
            entity.Property(e => e.Birth)
                .HasColumnType("datetime")
                .HasColumnName("birth");
            entity.Property(e => e.UserId).HasColumnName("userId");

            entity.HasOne(d => d.User).WithOne(p => p.Userprofile)
                .HasForeignKey<Userprofile>(d => d.UserId)
                .HasConstraintName("FK__userprofi__userI__403A8C7D");
        });

        modelBuilder.Entity<SystemStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK_SystemStatus");

            entity.ToTable("systemStatus");

            entity.Property(e => e.StatusId).HasColumnName("statusId");
            entity.Property(e => e.Domain).IsRequired().HasMaxLength(50).HasColumnName("domain");
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50).HasColumnName("statusCode");
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100).HasColumnName("statusName");
            entity.Property(e => e.Description).HasMaxLength(250).HasColumnName("description");
            entity.Property(e => e.SortOrder).HasColumnName("sortOrder");

            entity.HasIndex(e => new { e.Domain, e.Code })
                .IsUnique()
                .HasDatabaseName("UQ_SystemStatus_Domain_Code");

            entity.HasData(
                new SystemStatus { StatusId = 1, Domain = "Document", Code = "InStock", Name = "In Stock", Description = null, SortOrder = 1 },
                new SystemStatus { StatusId = 2, Domain = "Document", Code = "Listed", Name = "Listed", Description = null, SortOrder = 2 },
                new SystemStatus { StatusId = 3, Domain = "Document", Code = "PendingSale", Name = "Pending Sale", Description = null, SortOrder = 3 },
                new SystemStatus { StatusId = 4, Domain = "Document", Code = "Sold", Name = "Sold", Description = null, SortOrder = 4 },
                new SystemStatus { StatusId = 5, Domain = "Document", Code = "Cancelled", Name = "Cancelled", Description = null, SortOrder = 5 },
                new SystemStatus { StatusId = 6, Domain = "Listing", Code = "Pending", Name = "Pending", Description = null, SortOrder = 1 },
                new SystemStatus { StatusId = 7, Domain = "Listing", Code = "Active", Name = "Active", Description = null, SortOrder = 2 },
                new SystemStatus { StatusId = 8, Domain = "Listing", Code = "Rejected", Name = "Rejected", Description = null, SortOrder = 3 },
                new SystemStatus { StatusId = 22, Domain = "Listing", Code = "Reserved", Name = "Reserved", Description = null, SortOrder = 4 },
                new SystemStatus { StatusId = 23, Domain = "Listing", Code = "Sold", Name = "Sold", Description = null, SortOrder = 5 },
                new SystemStatus { StatusId = 9, Domain = "Order", Code = "PendingSellerConfirmation", Name = "Pending Seller Confirmation", Description = null, SortOrder = 1 },
                new SystemStatus { StatusId = 10, Domain = "Order", Code = "ConfirmedBySeller", Name = "Confirmed By Seller", Description = null, SortOrder = 2 },
                new SystemStatus { StatusId = 11, Domain = "Order", Code = "AwaitingOfflinePayment", Name = "Awaiting Offline Payment", Description = null, SortOrder = 3 },
                new SystemStatus { StatusId = 12, Domain = "Order", Code = "PaymentConfirmed", Name = "Payment Confirmed", Description = null, SortOrder = 4 },
                new SystemStatus { StatusId = 13, Domain = "Order", Code = "Shipped", Name = "Shipped", Description = null, SortOrder = 5 },
                new SystemStatus { StatusId = 14, Domain = "Order", Code = "Delivered", Name = "Delivered", Description = null, SortOrder = 6 },
                new SystemStatus { StatusId = 15, Domain = "Order", Code = "Completed", Name = "Completed", Description = null, SortOrder = 7 },
                new SystemStatus { StatusId = 16, Domain = "Order", Code = "CancelledByBuyer", Name = "Cancelled By Buyer", Description = null, SortOrder = 8 },
                new SystemStatus { StatusId = 17, Domain = "Order", Code = "CancelledBySeller", Name = "Cancelled By Seller", Description = null, SortOrder = 9 },
                new SystemStatus { StatusId = 18, Domain = "Order", Code = "RejectedBySeller", Name = "Rejected By Seller", Description = null, SortOrder = 10 },
                new SystemStatus { StatusId = 24, Domain = "Order", Code = "PendingShipment", Name = "Pending Shipment", Description = null, SortOrder = 5 },
                new SystemStatus { StatusId = 19, Domain = "Payment", Code = "Succeeded", Name = "Succeeded", Description = null, SortOrder = 1 },
                new SystemStatus { StatusId = 20, Domain = "Payment", Code = "Failed", Name = "Failed", Description = null, SortOrder = 2 },
                new SystemStatus { StatusId = 21, Domain = "Payment", Code = "Pending", Name = "Pending", Description = null, SortOrder = 3 }
            );
        });

        modelBuilder.Entity<Listing>(entity =>
        {
            entity.HasKey(e => e.ListingId).HasName("PK_Listings");

            entity.ToTable("listings");

            entity.Property(e => e.ListingId).HasColumnName("listingId");
            entity.Property(e => e.DocumentId).HasColumnName("documentId");
            entity.Property(e => e.OwnerId).HasColumnName("ownerId");
            entity.Property(e => e.ListingType).HasColumnName("listingType");
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)").HasColumnName("price");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.ListingStatusId).HasColumnName("statusId");
            entity.Property(e => e.CreatedAt).HasColumnName("createdAt").HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.UpdatedAt).HasColumnName("updatedAt");
            entity.Property(e => e.IsDeleted).HasColumnName("isDeleted");

            entity.HasOne(d => d.SystemStatus)
                .WithMany(p => p.Listings)
                .HasForeignKey(d => d.ListingStatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Listings_SystemStatus");

            entity.HasOne(d => d.Document)
                .WithMany()
                .HasForeignKey(d => d.DocumentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Listings_Document");

            entity.HasOne(d => d.Owner)
                .WithMany()
                .HasForeignKey(d => d.OwnerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Listings_User");

            // Composite index for owner & status
            entity.HasIndex(e => new { e.OwnerId, e.ListingStatusId })
                .HasDatabaseName("IX_listings_ownerId_statusId");

            entity.HasIndex(e => e.ListingStatusId).HasName("IX_Listings_ListingStatusId");
            entity.HasIndex(e => e.IsDeleted).HasName("IX_Listings_IsDeleted");
            entity.HasIndex(e => e.CreatedAt).HasName("IX_Listings_CreatedAt");
        });

        modelBuilder.Entity<ListingExchangeItem>(entity =>
        {
            entity.HasKey(e => e.ExchangeItemId).HasName("PK_ListingExchangeItems");

            entity.ToTable("listingExchangeItems");

            entity.Property(e => e.ExchangeItemId).HasColumnName("exchangeItemId");
            entity.Property(e => e.ListingId).HasColumnName("listingId");
            entity.Property(e => e.DesiredDocumentId).HasColumnName("desiredDocumentId");

            entity.HasOne(d => d.Listing)
                .WithMany(p => p.ExchangeItems)
                .HasForeignKey(d => d.ListingId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ListingItems_Listing");

            entity.HasOne(d => d.DesiredDocument)
                .WithMany()
                .HasForeignKey(d => d.DesiredDocumentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ListingItems_Document");
        });

        modelBuilder.Entity<Document>()
            .HasOne(d => d.SystemStatus)
            .WithMany(p => p.Documents)
            .HasForeignKey(d => d.StatusId)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("FK_Document_SystemStatus");

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId);

            entity.Property(e => e.Message)
                .IsRequired()
                .HasMaxLength(500);

            entity.Property(e => e.IsRead)
                .HasDefaultValue(false);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            entity.Property(e => e.NotificationType)
                .HasMaxLength(50);

            entity.Property(e => e.Link)
                .HasMaxLength(255);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Notifications_User");

            entity.HasIndex(e => new { e.UserId, e.IsRead });
            entity.HasIndex(e => e.CreatedAt);
        });

        modelBuilder.Entity<PaymentMethod>(entity =>
        {
            entity.HasKey(e => e.PaymentMethodId);
            entity.ToTable("paymentMethods");
            entity.Property(e => e.PaymentMethodId).HasColumnName("paymentMethodId");
            entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.IsEnabled).HasColumnName("isEnabled").HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasColumnName("createdAt").HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.UpdatedAt).HasColumnName("updatedAt");

            // Seed default payment methods (ensure IDs stable)
            entity.HasData(
                new PaymentMethod { PaymentMethodId = 1, Name = "COD", IsEnabled = true },
                new PaymentMethod { PaymentMethodId = 2, Name = "BankTransfer", IsEnabled = true },
                new PaymentMethod { PaymentMethodId = 3, Name = "OnlineGateway", IsEnabled = true }
            );
        });

        modelBuilder.Entity<ListingPaymentMethod>(entity =>
        {
            entity.HasKey(e => new { e.ListingId, e.PaymentMethodId });
            entity.ToTable("listingPaymentMethods");
            entity.Property(e => e.ListingId).HasColumnName("listingId");
            entity.Property(e => e.PaymentMethodId).HasColumnName("paymentMethodId");

            entity.HasOne(d => d.Listing)
                .WithMany(p => p.ListingPaymentMethods)
                .HasForeignKey(d => d.ListingId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_ListingPaymentMethod_Listing");

            entity.HasOne(d => d.PaymentMethod)
                .WithMany(p => p.ListingPaymentMethods)
                .HasForeignKey(d => d.PaymentMethodId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_ListingPaymentMethod_PaymentMethod");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__payments__A0D9EFC6903F7ADB");

            entity.ToTable("payments");

            entity.HasIndex(e => e.OrderId, "UQ__payments__0809335CA88D5F23").IsUnique();

            entity.Property(e => e.PaymentId).HasColumnName("paymentId");
            entity.Property(e => e.OrderId).HasColumnName("orderId");
            entity.Property(e => e.PaymentDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnName("paymentDate");
            entity.Property(e => e.PaymentMethodId).HasColumnName("paymentMethodId");
            entity.Property(e => e.PaymentStatusId).HasColumnName("paymentStatusId");
            entity.Property(e => e.TransactionId)
                .HasMaxLength(255)
                .HasColumnName("transactionId");
            entity.Property(e => e.RowVersion).IsRowVersion().HasColumnName("rowVersion");

            entity.HasOne(d => d.Order).WithOne(p => p.Payment)
                .HasForeignKey<Payment>(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__payments__orderI__5EBF139D");

            entity.HasOne(d => d.PaymentStatus).WithMany()
                .HasForeignKey(d => d.PaymentStatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Payments_SystemStatus");

            entity.HasOne(d => d.PaymentMethod)
                .WithMany()
                .HasForeignKey(d => d.PaymentMethodId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Payments_PaymentMethod");
        });

        modelBuilder.Entity<ReviewEvidence>(entity =>
        {
            entity.HasKey(e => e.ReviewEvidenceId).HasName("PK_review_evidences");

            entity.ToTable("review_evidences");

            entity.Property(e => e.ReviewEvidenceId).HasColumnName("reviewEvidenceId");
            entity.Property(e => e.ReviewId).HasColumnName("reviewId");
            entity.Property(e => e.FileUrl).HasColumnName("fileUrl");
            entity.Property(e => e.FileType).HasColumnName("fileType");
            entity.Property(e => e.UploadedDate)
                .HasColumnType("datetime2")
                .HasColumnName("uploadedDate")
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.IsDeleted).HasColumnName("isDeleted");
            entity.Property(e => e.RowVersion).IsRowVersion().HasColumnName("rowVersion");

            entity.HasIndex(e => e.ReviewId);

            entity.HasOne(d => d.Review).WithMany(r => r.Evidences)
                .HasForeignKey(d => d.ReviewId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_ReviewEvidences_Review");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
