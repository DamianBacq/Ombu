using Npgsql;
using Ombu.Datos;
using Ombu.Entidades;

namespace Ombu.Negocio
{
    public class TurnoNegocio
    {
        public const int DiasParaReservar = 21;
        public const decimal PorcentajeSena = 0.3m;

        private readonly TurnoDatos turnoDatos = new TurnoDatos();
        private readonly TratamientoDatos tratamientoDatos = new TratamientoDatos();
        private readonly ProfesionalDatos profesionalDatos = new ProfesionalDatos();
        private readonly HorarioAtencionDatos horarioDatos = new HorarioAtencionDatos();
        private readonly ClienteDatos clienteDatos = new ClienteDatos();
        private readonly PagoDatos pagoDatos = new PagoDatos();

        public List<Profesional> ListarProfesionales()
        {
            return profesionalDatos.Listar();
        }

        // Números de los días que atiende el estudio (0 = domingo, igual que getDay() de JavaScript)
        public List<int> ListarDias()
        {
            return horarioDatos.Listar().Select(h => h.DiaSemana).Distinct().ToList();
        }

        public List<HorarioAtencion> ListarHorarios()
        {
            return horarioDatos.Listar();
        }

        // Turnos de una hora entre la apertura y el cierre, con los profesionales libres en cada uno
        public List<Horario> Disponibilidad(DateTime dia, int tratamientoId)
        {
            Tratamiento tratamiento = tratamientoDatos.ObtenerPorId(tratamientoId);
            if (tratamiento == null) throw new Exception("El tratamiento no existe.");

            DateTime ahora = Ajustes.Ahora();
            turnoDatos.VencerPendientes(ahora);

            List<Profesional> profesionales = profesionalDatos.Listar().Where(p => p.Tipo == tratamiento.Tipo).ToList();
            List<(int ProfesionalId, DateTime FechaHora)> ocupados = turnoDatos.ListarOcupados(dia);
            List<Horario> horarios = new List<Horario>();

            foreach (HorarioAtencion franja in horarioDatos.Listar().Where(h => h.DiaSemana == (int)dia.DayOfWeek))
            {
                for (TimeSpan hora = franja.HoraDesde; hora < franja.HoraHasta; hora = hora.Add(TimeSpan.FromHours(1)))
                {
                    DateTime fechaHora = dia.Date.Add(hora);
                    if (fechaHora <= ahora.AddHours(1)) continue;

                    Horario horario = new Horario { Hora = hora.ToString(@"hh\:mm") };
                    foreach (Profesional profesional in profesionales)
                    {
                        if (!ocupados.Any(o => o.ProfesionalId == profesional.Id && o.FechaHora == fechaHora))
                        {
                            horario.Profesionales.Add(profesional.Id);
                        }
                    }
                    if (horario.Profesionales.Count > 0) horarios.Add(horario);
                }
            }
            return horarios;
        }

        // Recibe el turno con el cliente, el id del tratamiento y del profesional (0 = el primero libre)
        public Turno Reservar(Turno turno)
        {
            if (turno.Cliente == null || string.IsNullOrWhiteSpace(turno.Cliente.Nombre) || string.IsNullOrWhiteSpace(turno.Cliente.Apellido)
                || string.IsNullOrWhiteSpace(turno.Cliente.Telefono) || string.IsNullOrWhiteSpace(turno.Cliente.Email) || !turno.Cliente.Email.Contains('@'))
            {
                throw new Exception("Completá nombre, apellido, teléfono y un mail válido.");
            }

            Tratamiento tratamiento = tratamientoDatos.ObtenerPorId(turno.Tratamiento.Id);
            if (tratamiento == null || !tratamiento.Activo) throw new Exception("El tratamiento no está disponible.");

            DateTime ahora = Ajustes.Ahora();
            if (turno.FechaHora.Date > ahora.Date.AddDays(DiasParaReservar)) throw new Exception("Se puede reservar hasta " + DiasParaReservar + " días antes.");

            Horario horario = Disponibilidad(turno.FechaHora.Date, tratamiento.Id).FirstOrDefault(h => h.Hora == turno.FechaHora.ToString("HH:mm"));
            if (horario == null) throw new Exception("Ese horario ya no está disponible. Elegí otro.");

            int profesionalId = turno.Profesional == null ? 0 : turno.Profesional.Id;
            if (profesionalId == 0) profesionalId = horario.Profesionales[0];
            if (!horario.Profesionales.Contains(profesionalId)) throw new Exception("Ese profesional ya no tiene libre ese horario. Elegí otro.");

            turno.Tratamiento = tratamiento;
            turno.Profesional = new Profesional { Id = profesionalId };
            turno.Precio = tratamiento.Precio;
            turno.Sena = Math.Round(tratamiento.Precio * PorcentajeSena / 100) * 100;
            turno.Estado = EstadoTurno.PendientePago;
            turno.Codigo = Guid.NewGuid();
            turno.FechaCreacion = ahora;

            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlTransaction transaccion = conexion.BeginTransaction();
            try
            {
                int clienteId = clienteDatos.Guardar(turno.Cliente, conexion, transaccion);
                turno.Id = turnoDatos.Insertar(turno, clienteId, conexion, transaccion);
                transaccion.Commit();
            }
            catch (PostgresException ex) when (ex.SqlState == "23505")
            {
                throw new Exception("Alguien acaba de reservar ese horario. Elegí otro.");
            }
            return turno;
        }

        public Turno ObtenerPorCodigo(Guid codigo)
        {
            turnoDatos.VencerPendientes(Ajustes.Ahora());
            return turnoDatos.ObtenerPorCodigo(codigo);
        }

        // El cliente puede cancelar hasta 24 horas antes. La seña queda como crédito en el estudio.
        public bool SePuedeCancelar(Turno turno)
        {
            return (turno.Estado == EstadoTurno.PendientePago || turno.Estado == EstadoTurno.Confirmado)
                && turno.FechaHora > Ajustes.Ahora().AddHours(24);
        }

        public void CancelarPorCliente(Guid codigo)
        {
            Turno turno = ObtenerPorCodigo(codigo);
            if (turno == null) throw new Exception("No encontramos ese turno.");
            if (!SePuedeCancelar(turno)) throw new Exception("Este turno ya no se puede cancelar desde la web. Escribinos por WhatsApp.");
            turnoDatos.CambiarEstado(turno.Id, EstadoTurno.Cancelado);
        }

        public List<Turno> ListarSemana(DateTime desde)
        {
            turnoDatos.VencerPendientes(Ajustes.Ahora());
            return turnoDatos.ListarEntre(desde.Date, desde.Date.AddDays(7));
        }

        // Acciones del panel: Cobrar (registra el resto y completa), Ausente o Cancelar
        public void CambiarEstado(int id, string accion)
        {
            Turno turno = turnoDatos.ObtenerPorId(id);
            if (turno == null) throw new Exception("No encontramos ese turno.");
            if (turno.Estado == EstadoTurno.Cancelado || turno.Estado == EstadoTurno.Completado) throw new Exception("Ese turno ya está cerrado.");

            if (accion == "Cobrar")
            {
                decimal resto = turno.Precio - turno.TotalPagado;
                if (resto > 0) pagoDatos.InsertarAprobado(turno.Id, resto, Ajustes.Ahora());
                turnoDatos.CambiarEstado(id, EstadoTurno.Completado);
            }
            else if (accion == "Ausente") turnoDatos.CambiarEstado(id, EstadoTurno.Ausente);
            else if (accion == "Cancelar") turnoDatos.CambiarEstado(id, EstadoTurno.Cancelado);
            else throw new Exception("Acción no válida.");
        }
    }
}
