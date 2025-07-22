using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TASINMAZ.Migrations
{
    public partial class AddUserFullNameToLog : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserFullName",
                table: "Logs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "KoordinatBilgileri",
                table: "Logs",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserFullName",
                table: "Logs");

            migrationBuilder.DropColumn(
                name: "KoordinatBilgileri",
                table: "Logs");
        }
    }
}