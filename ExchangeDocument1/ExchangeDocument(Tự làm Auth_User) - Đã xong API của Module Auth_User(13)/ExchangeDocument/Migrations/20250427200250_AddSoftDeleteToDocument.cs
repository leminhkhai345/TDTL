using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ExchangeDocument.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteToDocument : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "document",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "document",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "document");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "document");
        }
    }
}
