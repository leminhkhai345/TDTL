using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ExchangeDocument.Migrations
{
    /// <inheritdoc />
    public partial class SplitStatusToDocumentStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "status",
                table: "document");

            migrationBuilder.AddColumn<int>(
                name: "statusId",
                table: "document",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateTable(
                name: "documentStatus",
                columns: table => new
                {
                    documentStatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    statusCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    statusName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentStatus", x => x.documentStatusId);
                });

            migrationBuilder.InsertData(
                table: "documentStatus",
                columns: new[] { "documentStatusId", "statusCode", "statusName" },
                values: new object[,]
                {
                    { 1, "InStock", "In Stock" },
                    { 2, "Listed", "Listed" },
                    { 3, "PendingSale", "Pending Sale" },
                    { 4, "Sold", "Sold" },
                    { 5, "Cancelled", "Cancelled" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_document_statusId",
                table: "document",
                column: "statusId");

            migrationBuilder.AddForeignKey(
                name: "FK_Document_DocumentStatus",
                table: "document",
                column: "statusId",
                principalTable: "documentStatus",
                principalColumn: "documentStatusId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Document_DocumentStatus",
                table: "document");

            migrationBuilder.DropTable(
                name: "documentStatus");

            migrationBuilder.DropIndex(
                name: "IX_document_statusId",
                table: "document");

            migrationBuilder.DropColumn(
                name: "statusId",
                table: "document");

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "document",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "InStock");
        }
    }
}
