using Npgsql;
using Ombu.Entidades;

namespace Ombu.Datos
{
    public class HorarioAtencionDatos
    {
        public List<HorarioAtencion> Listar()
        {
            List<HorarioAtencion> lista = new List<HorarioAtencion>();
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand("SELECT id, dia_semana, hora_desde, hora_hasta FROM horario_atencion ORDER BY dia_semana, hora_desde", conexion);
            using NpgsqlDataReader lector = comando.ExecuteReader();
            while (lector.Read())
            {
                lista.Add(new HorarioAtencion
                {
                    Id = lector.GetInt32(0),
                    DiaSemana = lector.GetInt32(1),
                    HoraDesde = lector.GetTimeSpan(2),
                    HoraHasta = lector.GetTimeSpan(3)
                });
            }
            return lista;
        }
    }
}
