using System;
using System.Collections.Generic;
using ExchangeDocument.DataAccessLayer.ModelFromDB;
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

    public virtual DbSet<Comment> Comments { get; set; }

    public virtual DbSet<Document> Documents { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Userprofile> Userprofiles { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=MINHKHAI;Initial Catalog=exchangedocument;Persist Security Info=True;User ID=sa;Password=123456;Encrypt=false;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.CommentId).HasName("PK__comment__CDDE919DCEF0AF52");

            entity.HasOne(d => d.Document).WithMany(p => p.Comments).HasConstraintName("FK__comment__documen__5165187F");
        });

        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(e => e.DocumentId).HasName("PK__document__EFAAAD851A77836D");

            entity.HasOne(d => d.User).WithMany(p => p.Documents).HasConstraintName("FK__document__userId__4E88ABD4");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__orders__0809335D3DA3EC6B");

            entity.HasOne(d => d.User).WithMany(p => p.Orders).HasConstraintName("FK__orders__userId__5441852A");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.OrderDetailId).HasName("PK__orderDet__E4FEDE4A106E3DCA");

            entity.HasOne(d => d.Document).WithMany(p => p.OrderDetails).HasConstraintName("FK__orderDeta__docum__5812160E");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails).HasConstraintName("FK__orderDeta__order__571DF1D5");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__payments__A0D9EFC6862B7498");

            entity.HasOne(d => d.Order).WithMany(p => p.Payments).HasConstraintName("FK__payments__orderI__5AEE82B9");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__users__CB9A1CFFC55266CA");
        });

        modelBuilder.Entity<Userprofile>(entity =>
        {
            entity.HasKey(e => e.UserprofileId).HasName("PK__userprof__CCABE6BF2F9CAF64");

            entity.HasOne(d => d.User).WithMany(p => p.Userprofiles).HasConstraintName("FK__userprofi__userI__4BAC3F29");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
