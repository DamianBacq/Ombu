namespace Ombu.Entidades
{
    public enum EstadoTurno { PendientePago, Confirmado, Cancelado, Completado, Ausente }

    public enum EstadoPedido { PendientePago, Pagado, Preparando, Enviado, Entregado, Cancelado }

    public enum TipoEntrega { Retiro, Envio }

    public enum EstadoPago { Pendiente, Aprobado, Rechazado }
}
