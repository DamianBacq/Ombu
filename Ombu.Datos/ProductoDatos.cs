using Npgsql;
using Ombu.Entidades;

namespace Ombu.Datos
{
    public class ProductoDatos
    {
        private const string Select = @"SELECT p.id, p.categoria_id, c.nombre, p.nombre, p.slug, p.resumen, p.descripcion, p.modo_uso,
            p.tipo_piel, p.contenido, p.precio, p.precio_anterior, p.stock, p.imagen, p.destacado, p.activo
            FROM producto p JOIN categoria c ON c.id = p.categoria_id ";

        public List<Producto> Listar(bool soloActivos)
        {
            string sql = Select + (soloActivos ? "WHERE p.activo " : "") + "ORDER BY p.destacado DESC, p.id";
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(sql, conexion);
            return Leer(comando);
        }

        public Producto ObtenerPorSlug(string slug)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(Select + "WHERE p.slug = @slug AND p.activo", conexion);
            comando.Parameters.AddWithValue("slug", slug);
            return Leer(comando).FirstOrDefault();
        }

        public Producto ObtenerPorId(int id)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(Select + "WHERE p.id = @id", conexion);
            comando.Parameters.AddWithValue("id", id);
            return Leer(comando).FirstOrDefault();
        }

        public void Insertar(Producto producto)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(@"INSERT INTO producto (categoria_id, nombre, slug, resumen, descripcion, modo_uso,
                tipo_piel, contenido, precio, precio_anterior, stock, imagen, destacado, activo)
                VALUES (@categoria, @nombre, @slug, @resumen, @descripcion, @modoUso, @tipoPiel, @contenido, @precio, @precioAnterior,
                @stock, @imagen, @destacado, @activo)", conexion);
            CargarParametros(comando, producto);
            comando.ExecuteNonQuery();
        }

        public void Modificar(Producto producto)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(@"UPDATE producto SET categoria_id = @categoria, nombre = @nombre, slug = @slug,
                resumen = @resumen, descripcion = @descripcion, modo_uso = @modoUso, tipo_piel = @tipoPiel, contenido = @contenido,
                precio = @precio, precio_anterior = @precioAnterior, stock = @stock, imagen = @imagen, destacado = @destacado,
                activo = @activo WHERE id = @id", conexion);
            CargarParametros(comando, producto);
            comando.Parameters.AddWithValue("id", producto.Id);
            comando.ExecuteNonQuery();
        }

        // Descuenta stock solo si alcanza. Devuelve false si no había suficiente.
        public bool DescontarStock(int productoId, int cantidad, NpgsqlConnection conexion, NpgsqlTransaction transaccion)
        {
            using NpgsqlCommand comando = new NpgsqlCommand("UPDATE producto SET stock = stock - @cantidad WHERE id = @id AND stock >= @cantidad", conexion, transaccion);
            comando.Parameters.AddWithValue("id", productoId);
            comando.Parameters.AddWithValue("cantidad", cantidad);
            return comando.ExecuteNonQuery() == 1;
        }

        private void CargarParametros(NpgsqlCommand comando, Producto producto)
        {
            comando.Parameters.AddWithValue("categoria", producto.CategoriaId);
            comando.Parameters.AddWithValue("nombre", producto.Nombre);
            comando.Parameters.AddWithValue("slug", producto.Slug);
            comando.Parameters.AddWithValue("resumen", producto.Resumen);
            comando.Parameters.AddWithValue("descripcion", producto.Descripcion);
            comando.Parameters.AddWithValue("modoUso", producto.ModoUso);
            comando.Parameters.AddWithValue("tipoPiel", producto.TipoPiel);
            comando.Parameters.AddWithValue("contenido", producto.Contenido);
            comando.Parameters.AddWithValue("precio", producto.Precio);
            comando.Parameters.AddWithValue("precioAnterior", (object)producto.PrecioAnterior ?? DBNull.Value);
            comando.Parameters.AddWithValue("stock", producto.Stock);
            comando.Parameters.AddWithValue("imagen", producto.Imagen);
            comando.Parameters.AddWithValue("destacado", producto.Destacado);
            comando.Parameters.AddWithValue("activo", producto.Activo);
        }

        private List<Producto> Leer(NpgsqlCommand comando)
        {
            List<Producto> lista = new List<Producto>();
            using NpgsqlDataReader lector = comando.ExecuteReader();
            while (lector.Read())
            {
                lista.Add(new Producto
                {
                    Id = lector.GetInt32(0),
                    CategoriaId = lector.GetInt32(1),
                    Categoria = lector.GetString(2),
                    Nombre = lector.GetString(3),
                    Slug = lector.GetString(4),
                    Resumen = lector.GetString(5),
                    Descripcion = lector.GetString(6),
                    ModoUso = lector.GetString(7),
                    TipoPiel = lector.GetString(8),
                    Contenido = lector.GetString(9),
                    Precio = lector.GetDecimal(10),
                    PrecioAnterior = lector.IsDBNull(11) ? null : lector.GetDecimal(11),
                    Stock = lector.GetInt32(12),
                    Imagen = lector.GetString(13),
                    Destacado = lector.GetBoolean(14),
                    Activo = lector.GetBoolean(15)
                });
            }
            return lista;
        }
    }
}
