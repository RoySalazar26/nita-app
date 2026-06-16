import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para crear tabla de pedidos (ejecutar una sola vez)
export async function crearTablas() {
  const { error } = await supabase.rpc('crear_tablas_pedidos');
  if (error) console.error('Error creando tablas:', error);
}

// Guardar pedido
export async function guardarPedido(pedido) {
  const { data, error } = await supabase
    .from('pedidos')
    .insert([{
      cliente_nombre: pedido.clienteNombre,
      cliente_telefono: pedido.clienteTelefono,
      cliente_direccion: pedido.clienteDireccion || '',
      tipo: pedido.tipo, // 'Para llevar', 'A domicilio', 'En local'
      items: pedido.items,
      total: pedido.total,
      notas: pedido.notas || '',
      estado: 'Pendiente', // Pendiente, Aceptado, Listo
      metodo_pago: pedido.metodoPago || 'No especificado',
      fecha_creado: new Date().toISOString(),
    }])
    .select();

  return { data, error };
}

// Obtener pedidos (para admin)
export async function obtenerPedidos() {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('fecha_creado', { ascending: false });

  return { data, error };
}

// Actualizar estado del pedido
export async function actualizarEstadoPedido(id, estado) {
  const { data, error } = await supabase
    .from('pedidos')
    .update({ estado })
    .eq('id', id)
    .select();

  return { data, error };
}

// Escuchar cambios en tiempo real (para admin)
export function escucharPedidos(callback) {
  const subscription = supabase
    .from('pedidos')
    .on('*', payload => {
      callback(payload);
    })
    .subscribe();

  return subscription;
}
