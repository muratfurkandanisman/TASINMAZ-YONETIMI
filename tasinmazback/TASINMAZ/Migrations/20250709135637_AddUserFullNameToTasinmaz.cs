using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TASINMAZ.Migrations
{
    /// <inheritdoc />
    public partial class AddUserFullNameToTasinmaz : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserFullName",
                table: "Tasinmazlar",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserFullName",
                table: "Tasinmazlar");
        }
    }
}
