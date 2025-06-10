using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ExchangeDocument.Migrations
{
    /// <inheritdoc />
    public partial class ReviewRefactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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
                name: "IX_reviews_reviewedDocumentId",
                table: "reviews");

            migrationBuilder.DropIndex(
                name: "IX_reviews_reviewedListingId",
                table: "reviews");

            migrationBuilder.DropIndex(
                name: "IX_reviews_reviewedSellerId",
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
                name: "reviewedDocumentId",
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
                name: "reviewedSellerId",
                table: "reviews",
                newName: "reviewType");

            migrationBuilder.RenameColumn(
                name: "reviewedListingId",
                table: "reviews",
                newName: "rating");

            migrationBuilder.AddColumn<string>(
                name: "comment",
                table: "reviews",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_review",
                table: "reviews",
                column: "reviewId");

            migrationBuilder.CreateTable(
                name: "review_evidences",
                columns: table => new
                {
                    reviewEvidenceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    reviewId = table.Column<int>(type: "int", nullable: false),
                    fileUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    fileType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    uploadedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(sysutcdatetime())"),
                    isDeleted = table.Column<bool>(type: "bit", nullable: false),
                    rowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_review_evidences", x => x.reviewEvidenceId);
                    table.ForeignKey(
                        name: "FK_ReviewEvidences_Review",
                        column: x => x.reviewId,
                        principalTable: "reviews",
                        principalColumn: "reviewId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_review_evidences_reviewId",
                table: "review_evidences",
                column: "reviewId");

            migrationBuilder.AddForeignKey(
                name: "FK_Review_Order",
                table: "reviews",
                column: "orderId",
                principalTable: "orders",
                principalColumn: "orderId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Review_User",
                table: "reviews",
                column: "reviewerId",
                principalTable: "users",
                principalColumn: "userId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Review_Order",
                table: "reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Review_User",
                table: "reviews");

            migrationBuilder.DropTable(
                name: "review_evidences");

            migrationBuilder.DropPrimaryKey(
                name: "PK_review",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "comment",
                table: "reviews");

            migrationBuilder.RenameColumn(
                name: "reviewType",
                table: "reviews",
                newName: "reviewedSellerId");

            migrationBuilder.RenameColumn(
                name: "rating",
                table: "reviews",
                newName: "reviewedListingId");

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

            migrationBuilder.AddColumn<int>(
                name: "reviewedDocumentId",
                table: "reviews",
                type: "int",
                nullable: false,
                defaultValue: 0);

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
                name: "IX_reviews_reviewedDocumentId",
                table: "reviews",
                column: "reviewedDocumentId");

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
    }
}
