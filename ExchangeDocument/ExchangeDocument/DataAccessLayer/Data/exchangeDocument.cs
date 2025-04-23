using System;
using System.Collections.Generic;
using ExchangeDocument.DataAccessLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.Data;

public partial class exchangeDocument : DbContext
{
    public exchangeDocument()
    {
    }

    public exchangeDocument(DbContextOptions<exchangeDocument> options)
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

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=MINHKHAI;Initial Catalog=exchangedocument;Persist Security Info=True;User ID=sa;Password=123456;Encrypt=false;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__categori__23CAF1D8680ADE1A");
        });

        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(e => e.DocumentId).HasName("PK__document__EFAAAD8568A14E4B");

            entity.Property(e => e.Status).HasDefaultValue("Available");

            entity.HasOne(d => d.Category).WithMany(p => p.Documents)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__document__catego__48CFD27E");

            entity.HasOne(d => d.User).WithMany(p => p.Documents)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__document__userId__47DBAE45");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__orders__0809335D1510A537");

            entity.Property(e => e.OrderDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Status).HasDefaultValue("Pending");

            entity.HasOne(d => d.User).WithMany(p => p.Orders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__orders__userId__5441852A");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.OrderDetailId).HasName("PK__orderDet__E4FEDE4A233BA4C0");

            entity.Property(e => e.Amount).HasComputedColumnSql("([priceAtOrderTime]*[quantity])", false);

            entity.HasOne(d => d.Document).WithMany(p => p.OrderDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__orderDeta__docum__59063A47");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails).HasConstraintName("FK__orderDeta__order__5812160E");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__payments__A0D9EFC675A53B9A");

            entity.Property(e => e.PaymentDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.PaymentStatus).HasDefaultValue("Completed");

            entity.HasOne(d => d.Order).WithOne(p => p.Payment)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__payments__orderI__5EBF139D");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.ReviewId).HasName("PK__reviews__2ECD6E040A4C65B6");

            entity.Property(e => e.ReviewDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Document).WithMany(p => p.Reviews).HasConstraintName("FK__reviews__documen__4D94879B");

            entity.HasOne(d => d.User).WithMany(p => p.Reviews)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__reviews__userId__4E88ABD4");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__roles__CD98462AE24D247E");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__users__CB9A1CFF1290990D");

            entity.Property(e => e.RoleId).HasDefaultValue(2);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Users_Roles");
        });

        modelBuilder.Entity<Userprofile>(entity =>
        {
            entity.HasKey(e => e.UserprofileId).HasName("PK__userprof__CCABE6BF78C1700D");

            entity.HasOne(d => d.User).WithOne(p => p.Userprofile).HasConstraintName("FK__userprofi__userI__403A8C7D");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
