using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ExchangeDocument.Migrations
{
    /// <inheritdoc />
    public partial class AddSellerResponseToReview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__reviews__documen__4D94879B",
                table: "reviews");

            migrationBuilder.DropForeignKey(
                name: "FK__reviews__userId__4E88ABD4",
                table: "reviews");

            migrationBuilder.DropPrimaryKey(
                name: "PK__reviews__2ECD6E0429623377",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "content",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "rating",
                table: "reviews");

            migrationBuilder.RenameColumn(
                name: "userId",
                table: "reviews",
                newName: "reviewerId");

            migrationBuilder.RenameColumn(
                name: "documentId",
                table: "reviews",
                newName: "reviewedDocumentId");

            migrationBuilder.RenameIndex(
                name: "IX_reviews_userId",
                table: "reviews",
                newName: "IX_reviews_reviewerId");

            migrationBuilder.RenameIndex(
                name: "IX_reviews_documentId",
                table: "reviews",
                newName: "IX_reviews_reviewedDocumentId");

            migrationBuilder.AlterColumn<DateTime>(
                name: "reviewDate",
                table: "reviews",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "(sysutcdatetime())",
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AddColumn<bool>(
                name: "isDeleted",
                table: "reviews",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "isEdited",
                table: "reviews",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "isSellerResponseEdited",
                table: "reviews",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "itemComment",
                table: "reviews",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "itemRating",
                table: "reviews",
                type: "tinyint",
                nullable: false,
                defaultValue: (byte)0);

            migrationBuilder.AddColumn<DateTime>(
                name: "lastEditedDate",
                table: "reviews",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "orderId",
                table: "reviews",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "reviewedListingId",
                table: "reviews",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "reviewedSellerId",
                table: "reviews",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<byte[]>(
                name: "rowVersion",
                table: "reviews",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<string>(
                name: "sellerComment",
                table: "reviews",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "sellerRating",
                table: "reviews",
                type: "tinyint",
                nullable: false,
                defaultValue: (byte)0);

            migrationBuilder.AddColumn<string>(
                name: "sellerResponse",
                table: "reviews",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "sellerResponseDate",
                table: "reviews",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_reviews",
                table: "reviews",
                column: "reviewId");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_orderId",
                table: "reviews",
                column: "orderId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_reviews_reviewedListingId",
                table: "reviews",
                column: "reviewedListingId");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_reviewedSellerId",
                table: "reviews",
                column: "reviewedSellerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Document",
                table: "reviews",
                column: "reviewedDocumentId",
                principalTable: "document",
                principalColumn: "documentId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Listing",
                table: "reviews",
                column: "reviewedListingId",
                principalTable: "listings",
                principalColumn: "listingId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Order",
                table: "reviews",
                column: "orderId",
                principalTable: "orders",
                principalColumn: "orderId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_ReviewedSeller",
                table: "reviews",
                column: "reviewedSellerId",
                principalTable: "users",
                principalColumn: "userId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Reviewer",
                table: "reviews",
                column: "reviewerId",
                principalTable: "users",
                principalColumn: "userId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Document",
                table: "reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Listing",
                table: "reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Order",
                table: "reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_ReviewedSeller",
                table: "reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Reviewer",
                table: "reviews");

            migrationBuilder.DropPrimaryKey(
                name: "PK_reviews",
                table: "reviews");

            migrationBuilder.DropIndex(
                name: "IX_reviews_orderId",
                table: "reviews");

            migrationBuilder.DropIndex(
                name: "IX_reviews_reviewedListingId",
                table: "reviews");

            migrationBuilder.DropIndex(
                name: "IX_reviews_reviewedSellerId",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "isDeleted",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "isEdited",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "isSellerResponseEdited",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "itemComment",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "itemRating",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "lastEditedDate",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "orderId",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "reviewedListingId",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "reviewedSellerId",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "rowVersion",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "sellerComment",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "sellerRating",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "sellerResponse",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "sellerResponseDate",
                table: "reviews");

            migrationBuilder.RenameColumn(
                name: "reviewerId",
                table: "reviews",
                newName: "userId");

            migrationBuilder.RenameColumn(
                name: "reviewedDocumentId",
                table: "reviews",
                newName: "documentId");

            migrationBuilder.RenameIndex(
                name: "IX_reviews_reviewerId",
                table: "reviews",
                newName: "IX_reviews_userId");

            migrationBuilder.RenameIndex(
                name: "IX_reviews_reviewedDocumentId",
                table: "reviews",
                newName: "IX_reviews_documentId");

            migrationBuilder.AlterColumn<DateTime>(
                name: "reviewDate",
                table: "reviews",
                type: "datetime",
                nullable: false,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "(sysutcdatetime())");

            migrationBuilder.AddColumn<string>(
                name: "content",
                table: "reviews",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "rating",
                table: "reviews",
                type: "int",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK__reviews__2ECD6E0429623377",
                table: "reviews",
                column: "reviewId");

            migrationBuilder.AddForeignKey(
                name: "FK__reviews__documen__4D94879B",
                table: "reviews",
                column: "documentId",
                principalTable: "document",
                principalColumn: "documentId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK__reviews__userId__4E88ABD4",
                table: "reviews",
                column: "userId",
                principalTable: "users",
                principalColumn: "userId");
        }
    }
}
