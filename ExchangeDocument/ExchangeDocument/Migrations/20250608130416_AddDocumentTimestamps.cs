using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ExchangeDocument.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentTimestamps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "createdAt",
                table: "document",
                type: "datetime",
                nullable: false,
                defaultValueSql: "(getutcdate())");

            migrationBuilder.AddColumn<DateTime>(
                name: "updatedAt",
                table: "document",
                type: "datetime",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "createdAt",
                table: "document");

            migrationBuilder.DropColumn(
                name: "updatedAt",
                table: "document");
        }
    }
}
