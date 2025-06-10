using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ExchangeDocument.Migrations
{
    /// <inheritdoc />
    public partial class InitFullSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "categories",
                columns: table => new
                {
                    categoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    categoryName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__categori__23CAF1D81CED1810", x => x.categoryId);
                });

            migrationBuilder.CreateTable(
                name: "paymentMethods",
                columns: table => new
                {
                    paymentMethodId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    isEnabled = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    createdAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    updatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_paymentMethods", x => x.paymentMethodId);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    roleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    roleName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__roles__CD98462A6EE9A78E", x => x.roleId);
                });

            migrationBuilder.CreateTable(
                name: "systemStatus",
                columns: table => new
                {
                    statusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    domain = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    statusCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    statusName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    sortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemStatus", x => x.statusId);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    userId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fullName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    password = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    roleId = table.Column<int>(type: "int", nullable: false, defaultValue: 2),
                    IsEmailVerified = table.Column<bool>(type: "bit", nullable: false),
                    PasswordResetToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResetTokenExpires = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsLocked = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__users__CB9A1CFFCF587D49", x => x.userId);
                    table.ForeignKey(
                        name: "FK_Users_Roles",
                        column: x => x.roleId,
                        principalTable: "roles",
                        principalColumn: "roleId");
                });

            migrationBuilder.CreateTable(
                name: "document",
                columns: table => new
                {
                    documentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    userId = table.Column<int>(type: "int", nullable: false),
                    categoryId = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    author = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ISBN = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    edition = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    publicationYear = table.Column<int>(type: "int", nullable: true),
                    condition = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    imageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    statusId = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__document__EFAAAD85262EE6A7", x => x.documentId);
                    table.ForeignKey(
                        name: "FK_Document_SystemStatus",
                        column: x => x.statusId,
                        principalTable: "systemStatus",
                        principalColumn: "statusId");
                    table.ForeignKey(
                        name: "FK__document__catego__48CFD27E",
                        column: x => x.categoryId,
                        principalTable: "categories",
                        principalColumn: "categoryId");
                    table.ForeignKey(
                        name: "FK__document__userId__47DBAE45",
                        column: x => x.userId,
                        principalTable: "users",
                        principalColumn: "userId");
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotificationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    NotificationType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ReferenceId = table.Column<int>(type: "int", nullable: true),
                    Link = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.NotificationId);
                    table.ForeignKey(
                        name: "FK_Notifications_User",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "userId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "orders",
                columns: table => new
                {
                    orderId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    buyerId = table.Column<int>(type: "int", nullable: false),
                    orderDate = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())"),
                    totalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    statusId = table.Column<int>(type: "int", nullable: false),
                    shippingAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    sellerId = table.Column<int>(type: "int", nullable: false),
                    notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    rejectionReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    paymentMethodId = table.Column<int>(type: "int", nullable: false),
                    proofImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    cancellationReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    shippingProvider = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    trackingNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    rowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__orders__0809335D8C96FDD5", x => x.orderId);
                    table.ForeignKey(
                        name: "FK_Orders_Seller_User",
                        column: x => x.sellerId,
                        principalTable: "users",
                        principalColumn: "userId");
                    table.ForeignKey(
                        name: "FK_Orders_SystemStatus",
                        column: x => x.statusId,
                        principalTable: "systemStatus",
                        principalColumn: "statusId");
                    table.ForeignKey(
                        name: "FK_Orders_User",
                        column: x => x.buyerId,
                        principalTable: "users",
                        principalColumn: "userId");
                    table.ForeignKey(
                        name: "FK_orders_paymentMethods_paymentMethodId",
                        column: x => x.paymentMethodId,
                        principalTable: "paymentMethods",
                        principalColumn: "paymentMethodId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "userprofiles",
                columns: table => new
                {
                    userprofileId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    birth = table.Column<DateTime>(type: "datetime", nullable: true),
                    address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    userId = table.Column<int>(type: "int", nullable: false),
                    BankAccountNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BankAccountName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BankName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BankBranch = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__userprof__CCABE6BFE822A043", x => x.userprofileId);
                    table.ForeignKey(
                        name: "FK__userprofi__userI__403A8C7D",
                        column: x => x.userId,
                        principalTable: "users",
                        principalColumn: "userId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "listings",
                columns: table => new
                {
                    listingId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    documentId = table.Column<int>(type: "int", nullable: false),
                    ownerId = table.Column<int>(type: "int", nullable: false),
                    listingType = table.Column<int>(type: "int", nullable: false),
                    price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    statusId = table.Column<int>(type: "int", nullable: false),
                    createdAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    updatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Listings", x => x.listingId);
                    table.ForeignKey(
                        name: "FK_Listings_Document",
                        column: x => x.documentId,
                        principalTable: "document",
                        principalColumn: "documentId");
                    table.ForeignKey(
                        name: "FK_Listings_SystemStatus",
                        column: x => x.statusId,
                        principalTable: "systemStatus",
                        principalColumn: "statusId");
                    table.ForeignKey(
                        name: "FK_Listings_User",
                        column: x => x.ownerId,
                        principalTable: "users",
                        principalColumn: "userId");
                });

            migrationBuilder.CreateTable(
                name: "reviews",
                columns: table => new
                {
                    reviewId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    documentId = table.Column<int>(type: "int", nullable: false),
                    userId = table.Column<int>(type: "int", nullable: false),
                    rating = table.Column<int>(type: "int", nullable: true),
                    content = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    reviewDate = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__reviews__2ECD6E0429623377", x => x.reviewId);
                    table.ForeignKey(
                        name: "FK__reviews__documen__4D94879B",
                        column: x => x.documentId,
                        principalTable: "document",
                        principalColumn: "documentId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__reviews__userId__4E88ABD4",
                        column: x => x.userId,
                        principalTable: "users",
                        principalColumn: "userId");
                });

            migrationBuilder.CreateTable(
                name: "payments",
                columns: table => new
                {
                    paymentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    orderId = table.Column<int>(type: "int", nullable: false),
                    paymentMethodId = table.Column<int>(type: "int", nullable: false),
                    paymentDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    paymentStatusId = table.Column<int>(type: "int", nullable: false),
                    transactionId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    rowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__payments__A0D9EFC6903F7ADB", x => x.paymentId);
                    table.ForeignKey(
                        name: "FK_Payments_PaymentMethod",
                        column: x => x.paymentMethodId,
                        principalTable: "paymentMethods",
                        principalColumn: "paymentMethodId");
                    table.ForeignKey(
                        name: "FK_Payments_SystemStatus",
                        column: x => x.paymentStatusId,
                        principalTable: "systemStatus",
                        principalColumn: "statusId");
                    table.ForeignKey(
                        name: "FK__payments__orderI__5EBF139D",
                        column: x => x.orderId,
                        principalTable: "orders",
                        principalColumn: "orderId");
                });

            migrationBuilder.CreateTable(
                name: "listingExchangeItems",
                columns: table => new
                {
                    exchangeItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    listingId = table.Column<int>(type: "int", nullable: false),
                    desiredDocumentId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListingExchangeItems", x => x.exchangeItemId);
                    table.ForeignKey(
                        name: "FK_ListingItems_Document",
                        column: x => x.desiredDocumentId,
                        principalTable: "document",
                        principalColumn: "documentId");
                    table.ForeignKey(
                        name: "FK_ListingItems_Listing",
                        column: x => x.listingId,
                        principalTable: "listings",
                        principalColumn: "listingId");
                });

            migrationBuilder.CreateTable(
                name: "listingPaymentMethods",
                columns: table => new
                {
                    listingId = table.Column<int>(type: "int", nullable: false),
                    paymentMethodId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_listingPaymentMethods", x => new { x.listingId, x.paymentMethodId });
                    table.ForeignKey(
                        name: "FK_ListingPaymentMethod_Listing",
                        column: x => x.listingId,
                        principalTable: "listings",
                        principalColumn: "listingId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListingPaymentMethod_PaymentMethod",
                        column: x => x.paymentMethodId,
                        principalTable: "paymentMethods",
                        principalColumn: "paymentMethodId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "orderDetails",
                columns: table => new
                {
                    orderDetailId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    orderId = table.Column<int>(type: "int", nullable: false),
                    documentId = table.Column<int>(type: "int", nullable: false),
                    listingId = table.Column<int>(type: "int", nullable: false),
                    quantity = table.Column<int>(type: "int", nullable: false),
                    priceAtOrderTime = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    amount = table.Column<decimal>(type: "decimal(29,2)", nullable: false, computedColumnSql: "([priceAtOrderTime]*[quantity])"),
                    rowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__orderDet__E4FEDE4AE6141E30", x => x.orderDetailId);
                    table.ForeignKey(
                        name: "FK_OrderDetails_Listing",
                        column: x => x.listingId,
                        principalTable: "listings",
                        principalColumn: "listingId");
                    table.ForeignKey(
                        name: "FK__orderDeta__docum__59063A47",
                        column: x => x.documentId,
                        principalTable: "document",
                        principalColumn: "documentId");
                    table.ForeignKey(
                        name: "FK__orderDeta__order__5812160E",
                        column: x => x.orderId,
                        principalTable: "orders",
                        principalColumn: "orderId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "paymentMethods",
                columns: new[] { "paymentMethodId", "isEnabled", "name", "updatedAt" },
                values: new object[,]
                {
                    { 1, true, "COD", null },
                    { 2, true, "BankTransfer", null },
                    { 3, true, "OnlineGateway", null }
                });

            migrationBuilder.InsertData(
                table: "systemStatus",
                columns: new[] { "statusId", "statusCode", "description", "domain", "statusName", "sortOrder" },
                values: new object[,]
                {
                    { 1, "InStock", null, "Document", "In Stock", 1 },
                    { 2, "Listed", null, "Document", "Listed", 2 },
                    { 3, "PendingSale", null, "Document", "Pending Sale", 3 },
                    { 4, "Sold", null, "Document", "Sold", 4 },
                    { 5, "Cancelled", null, "Document", "Cancelled", 5 },
                    { 6, "Pending", null, "Listing", "Pending", 1 },
                    { 7, "Active", null, "Listing", "Active", 2 },
                    { 8, "Rejected", null, "Listing", "Rejected", 3 },
                    { 9, "PendingSellerConfirmation", null, "Order", "Pending Seller Confirmation", 1 },
                    { 10, "ConfirmedBySeller", null, "Order", "Confirmed By Seller", 2 },
                    { 11, "AwaitingOfflinePayment", null, "Order", "Awaiting Offline Payment", 3 },
                    { 12, "PaymentConfirmed", null, "Order", "Payment Confirmed", 4 },
                    { 13, "Shipped", null, "Order", "Shipped", 5 },
                    { 14, "Delivered", null, "Order", "Delivered", 6 },
                    { 15, "Completed", null, "Order", "Completed", 7 },
                    { 16, "CancelledByBuyer", null, "Order", "Cancelled By Buyer", 8 },
                    { 17, "CancelledBySeller", null, "Order", "Cancelled By Seller", 9 },
                    { 18, "RejectedBySeller", null, "Order", "Rejected By Seller", 10 },
                    { 19, "Succeeded", null, "Payment", "Succeeded", 1 },
                    { 20, "Failed", null, "Payment", "Failed", 2 },
                    { 21, "Pending", null, "Payment", "Pending", 3 },
                    { 22, "Reserved", null, "Listing", "Reserved", 4 },
                    { 23, "Sold", null, "Listing", "Sold", 5 },
                    { 24, "PendingShipment", null, "Order", "Pending Shipment", 5 }
                });

            migrationBuilder.CreateIndex(
                name: "UQ__categori__37077ABD5AD55994",
                table: "categories",
                column: "categoryName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_document_categoryId",
                table: "document",
                column: "categoryId");

            migrationBuilder.CreateIndex(
                name: "IX_document_statusId",
                table: "document",
                column: "statusId");

            migrationBuilder.CreateIndex(
                name: "IX_document_userId",
                table: "document",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_listingExchangeItems_desiredDocumentId",
                table: "listingExchangeItems",
                column: "desiredDocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_listingExchangeItems_listingId",
                table: "listingExchangeItems",
                column: "listingId");

            migrationBuilder.CreateIndex(
                name: "IX_listingPaymentMethods_paymentMethodId",
                table: "listingPaymentMethods",
                column: "paymentMethodId");

            migrationBuilder.CreateIndex(
                name: "IX_Listings_CreatedAt",
                table: "listings",
                column: "createdAt");

            migrationBuilder.CreateIndex(
                name: "IX_listings_documentId",
                table: "listings",
                column: "documentId");

            migrationBuilder.CreateIndex(
                name: "IX_Listings_IsDeleted",
                table: "listings",
                column: "isDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Listings_ListingStatusId",
                table: "listings",
                column: "statusId");

            migrationBuilder.CreateIndex(
                name: "IX_listings_ownerId_statusId",
                table: "listings",
                columns: new[] { "ownerId", "statusId" });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CreatedAt",
                table: "Notifications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_IsRead",
                table: "Notifications",
                columns: new[] { "UserId", "IsRead" });

            migrationBuilder.CreateIndex(
                name: "IX_orderDetails_documentId",
                table: "orderDetails",
                column: "documentId");

            migrationBuilder.CreateIndex(
                name: "IX_orderDetails_listingId",
                table: "orderDetails",
                column: "listingId");

            migrationBuilder.CreateIndex(
                name: "IX_orderDetails_orderId",
                table: "orderDetails",
                column: "orderId");

            migrationBuilder.CreateIndex(
                name: "IX_orders_buyerId_statusId",
                table: "orders",
                columns: new[] { "buyerId", "statusId" });

            migrationBuilder.CreateIndex(
                name: "IX_orders_orderDate",
                table: "orders",
                column: "orderDate");

            migrationBuilder.CreateIndex(
                name: "IX_orders_paymentMethodId",
                table: "orders",
                column: "paymentMethodId");

            migrationBuilder.CreateIndex(
                name: "IX_orders_sellerId_statusId",
                table: "orders",
                columns: new[] { "sellerId", "statusId" });

            migrationBuilder.CreateIndex(
                name: "IX_orders_statusId",
                table: "orders",
                column: "statusId");

            migrationBuilder.CreateIndex(
                name: "IX_paymentMethods_name",
                table: "paymentMethods",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_payments_paymentMethodId",
                table: "payments",
                column: "paymentMethodId");

            migrationBuilder.CreateIndex(
                name: "IX_payments_paymentStatusId",
                table: "payments",
                column: "paymentStatusId");

            migrationBuilder.CreateIndex(
                name: "UQ__payments__0809335CA88D5F23",
                table: "payments",
                column: "orderId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_reviews_documentId",
                table: "reviews",
                column: "documentId");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_userId",
                table: "reviews",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "UQ__roles__B1947861244D93DE",
                table: "roles",
                column: "roleName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ_SystemStatus_Domain_Code",
                table: "systemStatus",
                columns: new[] { "domain", "statusCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__userprof__CB9A1CFE701C0233",
                table: "userprofiles",
                column: "userId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_roleId",
                table: "users",
                column: "roleId");

            migrationBuilder.CreateIndex(
                name: "UQ__users__AB6E616450D264B5",
                table: "users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "listingExchangeItems");

            migrationBuilder.DropTable(
                name: "listingPaymentMethods");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "orderDetails");

            migrationBuilder.DropTable(
                name: "payments");

            migrationBuilder.DropTable(
                name: "reviews");

            migrationBuilder.DropTable(
                name: "userprofiles");

            migrationBuilder.DropTable(
                name: "listings");

            migrationBuilder.DropTable(
                name: "orders");

            migrationBuilder.DropTable(
                name: "document");

            migrationBuilder.DropTable(
                name: "paymentMethods");

            migrationBuilder.DropTable(
                name: "systemStatus");

            migrationBuilder.DropTable(
                name: "categories");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "roles");
        }
    }
}
