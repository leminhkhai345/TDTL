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

    public virtual DbSet<DocumentStatus> DocumentStatuses { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=MINHKHAI;Database=exchangedocument;User ID=sa;Password=123456;TrustServerCertificate=True;MultipleActiveResultSets=true");

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
            entity.Property(e => e.DocumentStatusId)
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
            entity.Property(e => e.PublicationYear).HasColumnName("publicationYear");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.UserId).HasColumnName("userId");

            entity.HasOne(d => d.Category).WithMany(p => p.Documents)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__document__catego__48CFD27E");

            entity.HasOne(d => d.DocumentStatus)
                .WithMany(p => p.Documents)
                .HasForeignKey(d => d.DocumentStatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Document_DocumentStatus");

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
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Pending")
                .HasColumnName("status");
            entity.Property(e => e.TotalAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("totalAmount");
            entity.Property(e => e.UserId).HasColumnName("userId");

            entity.HasOne(d => d.User).WithMany(p => p.Orders)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__orders__userId__5441852A");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.OrderDetailId).HasName("PK__orderDet__E4FEDE4AE6141E30");

            entity.ToTable("orderDetails");

            entity.Property(e => e.OrderDetailId).HasColumnName("orderDetailId");
            entity.Property(e => e.Amount)
                .HasComputedColumnSql("([priceAtOrderTime]*[quantity])", false)
                .HasColumnType("decimal(29, 2)")
                .HasColumnName("amount");
            entity.Property(e => e.DocumentId).HasColumnName("documentId");
            entity.Property(e => e.OrderId).HasColumnName("orderId");
            entity.Property(e => e.PriceAtOrderTime)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("priceAtOrderTime");
            entity.Property(e => e.Quantity).HasColumnName("quantity");

            entity.HasOne(d => d.Document).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.DocumentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__orderDeta__docum__59063A47");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__orderDeta__order__5812160E");
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
            entity.Property(e => e.PaymentMethod)
                .HasMaxLength(100)
                .HasColumnName("paymentMethod");
            entity.Property(e => e.PaymentStatus)
                .HasMaxLength(50)
                .HasDefaultValue("Completed")
                .HasColumnName("paymentStatus");
            entity.Property(e => e.TransactionId)
                .HasMaxLength(255)
                .HasColumnName("transactionId");

            entity.HasOne(d => d.Order).WithOne(p => p.Payment)
                .HasForeignKey<Payment>(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__payments__orderI__5EBF139D");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.ReviewId).HasName("PK__reviews__2ECD6E0429623377");

            entity.ToTable("reviews");

            entity.Property(e => e.ReviewId).HasColumnName("reviewId");
            entity.Property(e => e.Content)
                .HasMaxLength(1000)
                .HasColumnName("content");
            entity.Property(e => e.DocumentId).HasColumnName("documentId");
            entity.Property(e => e.Rating).HasColumnName("rating");
            entity.Property(e => e.ReviewDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("reviewDate");
            entity.Property(e => e.UserId).HasColumnName("userId");

            entity.HasOne(d => d.Document).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.DocumentId)
                .HasConstraintName("FK__reviews__documen__4D94879B");

            entity.HasOne(d => d.User).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__reviews__userId__4E88ABD4");
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

        modelBuilder.Entity<DocumentStatus>(entity =>
        {
            entity.HasKey(e => e.DocumentStatusId).HasName("PK_DocumentStatus");

            entity.ToTable("documentStatus");

            entity.Property(e => e.DocumentStatusId).HasColumnName("documentStatusId");
            entity.Property(e => e.Code)
                .IsRequired()
                .HasMaxLength(50)
                .HasColumnName("statusCode");
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(50)
                .HasColumnName("statusName");

            // Seed document statuses
            entity.HasData(
                new DocumentStatus { DocumentStatusId = 1, Code = "InStock", Name = "In Stock" },
                new DocumentStatus { DocumentStatusId = 2, Code = "Listed", Name = "Listed" },
                new DocumentStatus { DocumentStatusId = 3, Code = "PendingSale", Name = "Pending Sale" },
                new DocumentStatus { DocumentStatusId = 4, Code = "Sold", Name = "Sold" },
                new DocumentStatus { DocumentStatusId = 5, Code = "Cancelled", Name = "Cancelled" }
            );
        });

        modelBuilder.Entity<Document>()
            .HasOne(d => d.DocumentStatus)
            .WithMany(p => p.Documents)
            .HasForeignKey(d => d.DocumentStatusId)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("FK_Document_DocumentStatus");

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
