using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TASINMAZ.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUserFullNameFromTasinmazAndLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserFullName",
                table: "Tasinmazlar");

            migrationBuilder.DropColumn(
                name: "UserFullName",
                table: "Logs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserFullName",
                table: "Tasinmazlar",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserFullName",
                table: "Logs",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
