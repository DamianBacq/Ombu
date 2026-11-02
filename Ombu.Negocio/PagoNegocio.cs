using MercadoPago.Client.Payment;
using MercadoPago.Client.Preference;
using MercadoPago.Config;
using MercadoPago.Resource.Payment;
using MercadoPago.Resource.Preference;
using Npgsql;
using Ombu.Datos;
using Ombu.Entidades;

namespace Ombu.Negocio
{
    public class PagoNegocio
    {
        private readonly PagoDatos pagoDatos = new PagoDatos();
        private readonly TurnoDatos turnoDatos = new TurnoDatos();
        private readonly PedidoDatos pedidoDatos = new PedidoDatos();

        // Crea el pago de la seña de un turno y devuelve la URL para pagar
        public async Task<string> PagarTurno(Guid codigo)
        {
            turnoDatos.VencerPendientes(Ajustes.Ahora());
            Turno turno = turnoDatos.ObtenerPorCodigo(codigo);
            if (turno == null) throw new Exception("No encontramos ese turno.");
            if (turno.Estado != EstadoTurno.PendientePago) throw new Exception("Este turno ya no está esperando el pago.");

            int pagoId = pagoDatos.Insertar(new Pago { TurnoId = turno.Id, Monto = turno.Sena, Estado = EstadoPago.Pendiente, Fecha = Ajustes.Ahora() });
            return await CrearPreferencia(pagoId, "Seña: " + turno.Tratamiento.Nombre, turno.Sena, turno.Cliente.Email);
        }

        // Crea el pago de un pedido de la tienda y devuelve la URL para pagar
        public async Task<string> PagarPedido(Guid codigo)
        {
            pedidoDatos.VencerPendientes(Ajustes.Ahora());
            Pedido pedido = pedidoDatos.ObtenerPorCodigo(codigo);
            if (pedido == null) throw new Exception("No encontramos ese pedido.");
            if (pedido.Estado != EstadoPedido.PendientePago) throw new Exception("Este pedido ya no está esperando el pago.");

            int pagoId = pagoDatos.Insertar(new Pago { PedidoId = pedido.Id, Monto = pedido.Total, Estado = EstadoPago.Pendiente, Fecha = Ajustes.Ahora() });
            return await CrearPreferencia(pagoId, "Pedido Ombú (" + pedido.Items.Sum(i => i.Cantidad) + " productos)", pedido.Total, pedido.Cliente.Email);
        }

        private async Task<string> CrearPreferencia(int pagoId, string titulo, decimal monto, string email)
        {
            if (Ajustes.ModoDemo)
            {
                return "/pago/demo?pago=" + pagoId;
            }

            MercadoPagoConfig.AccessToken = Ajustes.MercadoPagoToken;
            PreferenceRequest pedido = new PreferenceRequest
            {
                Items = new List<PreferenceItemRequest>
                {
                    new PreferenceItemRequest { Title = titulo, Quantity = 1, CurrencyId = "ARS", UnitPrice = monto }
                },
                Payer = new PreferencePayerRequest { Email = email },
                BackUrls = new PreferenceBackUrlsRequest
                {
                    Success = Ajustes.UrlBase + "/pago/resultado",
                    Failure = Ajustes.UrlBase + "/pago/resultado",
                    Pending = Ajustes.UrlBase + "/pago/resultado"
                },
                AutoReturn = "approved",
                ExternalReference = pagoId.ToString(),
                NotificationUrl = string.IsNullOrWhiteSpace(Ajustes.UrlNotificacion) ? null : Ajustes.UrlNotificacion
            };
            Preference preferencia = await new PreferenceClient().CreateAsync(pedido);
            return preferencia.InitPoint;
        }

        // Al volver de Mercado Pago o por el webhook. Siempre se consulta el pago real a Mercado Pago.
        public async Task<ResultadoPago> Verificar(long paymentId)
        {
            MercadoPagoConfig.AccessToken = Ajustes.MercadoPagoToken;
            Payment pago = await new PaymentClient().GetAsync(paymentId);
            int pagoId = int.Parse(pago.ExternalReference);

            if (pago.Status == "approved") Confirmar(pagoId, pago.Id.ToString());
            else if (pago.Status == "rejected" || pago.Status == "cancelled") pagoDatos.Rechazar(pagoId);

            return Resultado(pagoId);
        }

        // Solo en modo demo: simula que el cliente pagó o canceló
        public ResultadoPago ResolverDemo(int pagoId, bool aprobado)
        {
            if (!Ajustes.ModoDemo) throw new Exception("Los pagos simulados solo funcionan en modo demo.");
            if (aprobado) Confirmar(pagoId, "demo-" + pagoId);
            else pagoDatos.Rechazar(pagoId);
            return Resultado(pagoId);
        }

        public ResultadoPago Resultado(int pagoId)
        {
            Pago pago = pagoDatos.ObtenerPorId(pagoId);
            if (pago == null) throw new Exception("No encontramos ese pago.");
            ResultadoPago resultado = new ResultadoPago { Estado = pago.Estado.ToString() };
            if (pago.TurnoId != null)
            {
                resultado.Tipo = "turno";
                resultado.Codigo = turnoDatos.ObtenerPorId(pago.TurnoId.Value).Codigo;
            }
            else
            {
                resultado.Tipo = "pedido";
                resultado.Codigo = pedidoDatos.ObtenerPorId(pago.PedidoId.Value).Codigo;
            }
            return resultado;
        }

        // Aprueba el pago (una sola vez) y confirma el turno o el pedido.
        // Si el turno o el pedido se había vencido, se reactiva solo si el horario o el stock siguen libres.
        private void Confirmar(int pagoId, string mpPagoId)
        {
            Pago pago = pagoDatos.ObtenerPorId(pagoId);
            if (pago == null) return;

            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlTransaction transaccion = conexion.BeginTransaction();
            if (!pagoDatos.Aprobar(pagoId, mpPagoId, conexion, transaccion)) return;
            transaccion.Save("pago");

            try
            {
                if (pago.TurnoId != null)
                {
                    using NpgsqlCommand comando = new NpgsqlCommand("UPDATE turno SET estado = 'Confirmado' WHERE id = @id AND estado IN ('PendientePago', 'Cancelado')", conexion, transaccion);
                    comando.Parameters.AddWithValue("id", pago.TurnoId.Value);
                    comando.ExecuteNonQuery();
                }
                else
                {
                    Pedido pedido = pedidoDatos.ObtenerPorId(pago.PedidoId.Value);
                    if (pedido.Estado == EstadoPedido.Cancelado)
                    {
                        foreach (PedidoItem item in pedido.Items)
                        {
                            if (!new ProductoDatos().DescontarStock(item.ProductoId, item.Cantidad, conexion, transaccion)) throw new Exception("Sin stock");
                        }
                    }
                    if (pedido.Estado == EstadoPedido.PendientePago || pedido.Estado == EstadoPedido.Cancelado)
                    {
                        pedidoDatos.CambiarEstado(pedido.Id, EstadoPedido.Pagado, conexion, transaccion);
                    }
                }
            }
            catch (Exception)
            {
                // El pago queda aprobado pero el turno o pedido no se pudo reactivar: hay que devolverlo desde Mercado Pago
                transaccion.Rollback("pago");
                Console.WriteLine("Pago " + pagoId + " aprobado para un turno o pedido vencido sin lugar: revisar y devolver.");
            }
            transaccion.Commit();
        }
    }
}
