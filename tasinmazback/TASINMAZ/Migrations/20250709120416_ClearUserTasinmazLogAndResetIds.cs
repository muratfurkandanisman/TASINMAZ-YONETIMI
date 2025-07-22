using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TASINMAZ.Migrations
{
    /// <inheritdoc />
    public partial class ClearUserTasinmazLogAndResetIds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Kayıtları sil
            migrationBuilder.Sql("DELETE FROM \"Logs\";");
            migrationBuilder.Sql("DELETE FROM \"Tasinmazlar\";");
            migrationBuilder.Sql("DELETE FROM \"Users\";");

            // Sequence'ları sıfırla (PostgreSQL için)
            migrationBuilder.Sql("ALTER SEQUENCE \"Logs_LogId_seq\" RESTART WITH 1;");
            migrationBuilder.Sql("ALTER SEQUENCE \"Tasinmazlar_TasinmazId_seq\" RESTART WITH 1;");
            migrationBuilder.Sql("ALTER SEQUENCE \"Users_UserId_seq\" RESTART WITH 1;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Bu işlemin geri alınabilir bir karşılığı yok, isterseniz seed ekleyebilirsiniz.
        }
    }
}
