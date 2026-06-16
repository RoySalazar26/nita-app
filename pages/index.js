import { useState, useEffect } from 'react';
import { MENU, MODIFICADORES, CONFIG } from '../lib/datos';
import { guardarPedido } from '../lib/supabase';
import Head from 'next/head';

export default function Home() {
  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
  });
  const [tipo, setTipo] = useState('Para llevar');
  const [paso, setPaso] = useState('menu'); // menu, carrito, cliente, confirmar
  const [cargando, setCargando] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(p => p.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(p => 
        p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1, opciones: [] }]);
    }
  };

  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter(p => p.id !== id));
  };

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad <= 0) {
      quitarDelCarrito(id);
    } else {
      setCarrito(carrito.map(p => 
        p.id === id ? { ...p, cantidad } : p
      ));
    }
  };

  const total = carrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);

  const confirmarPedido = async () => {
    if (!cliente.nombre.trim()) {
      alert('Por favor, escribe tu nombre');
      return;
    }
    if (!cliente.telefono.trim()) {
      alert('Por favor, escribe tu teléfono');
      return;
    }
    if (tipo === 'A domicilio' && !cliente.direccion.trim()) {
      alert('Por favor, escribe tu dirección');
      return;
    }
    if (carrito.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    setCargando(true);
    const { data, error } = await guardarPedido({
      clienteNombre: cliente.nombre,
      clienteTelefono: cliente.telefono,
      clienteDireccion: tipo === 'A domicilio' ? cliente.direccion : '',
      tipo,
      items: carrito,
      total,
      metodoPago: 'Por confirmar',
    });

    if (error) {
      alert('Error al guardar el pedido: ' + error.message);
    } else {
      setPedidoConfirmado(data[0]);
      setPaso('confirmado');
    }
    setCargando(false);
  };

  return (
    <>
      <Head>
        <title>Nita Pedidos - {CONFIG.nombreNegocio}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
          .container { max-width: 1200px; margin: 0 auto; padding: 16px; }
          header { background: #d4a574; color: white; padding: 20px; text-align: center; margin-bottom: 24px; border-radius: 8px; }
          .pasos { display: flex; gap: 8px; margin-bottom: 24px; }
          .paso-btn { flex: 1; padding: 12px; text-align: center; border: none; border-radius: 6px; cursor: pointer; background: #e0e0e0; }
          .paso-btn.activo { background: #d4a574; color: white; font-weight: bold; }
          .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
          .producto { background: white; border-radius: 8px; padding: 16px; border: 1px solid #ddd; cursor: pointer; transition: all 0.2s; }
          .producto:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-4px); }
          .producto-precio { font-size: 18px; font-weight: bold; color: #d4a574; margin: 8px 0; }
          .producto-btn { width: 100%; padding: 10px; background: #d4a574; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
          .carrito-lista { background: white; padding: 20px; border-radius: 8px; margin-bottom: 24px; }
          .carrito-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; }
          .carrito-cantidad { display: flex; gap: 8px; align-items: center; }
          .carrito-cantidad input { width: 50px; padding: 4px; text-align: center; }
          .form-group { margin-bottom: 16px; }
          .form-group label { display: block; margin-bottom: 6px; font-weight: bold; }
          .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; }
          .tipo-pedido { display: flex; gap: 12px; margin-bottom: 16px; }
          .tipo-btn { flex: 1; padding: 12px; border: 2px solid #ddd; border-radius: 6px; cursor: pointer; background: white; }
          .tipo-btn.activo { border-color: #d4a574; background: #f5e6d3; font-weight: bold; }
          .total { font-size: 24px; font-weight: bold; color: #d4a574; margin: 20px 0; text-align: right; }
          .btn-confirmar { width: 100%; padding: 14px; background: #d4a574; color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; }
          .btn-confirmar:hover { background: #c49464; }
          .btn-confirmar:disabled { background: #ccc; cursor: not-allowed; }
          .confirmado { text-align: center; padding: 40px; background: white; border-radius: 8px; }
          .confirmado h2 { color: #4caf50; font-size: 28px; margin-bottom: 16px; }
          .confirmado p { font-size: 16px; color: #666; margin: 8px 0; }
          .confirmado .whatsapp { margin-top: 20px; }
          .confirmado .whatsapp a { display: inline-block; background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
        `}</style>
      </Head>

      <div className="container">
        <header>
          <h1>🍔 {CONFIG.nombreNegocio} - Pedir en línea</h1>
          <p>{CONFIG.direccion}</p>
        </header>

        {paso === 'menu' && (
          <>
            <h2 style={{ marginBottom: 16 }}>Elige tus productos</h2>
            <div className="menu-grid">
              {MENU.map(producto => (
                <div key={producto.id} className="producto">
                  {producto.imagen && (
                    <img src={producto.imagen} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }} />
                  )}
                  <h3>{producto.nombre}</h3>
                  <div className="producto-precio">${producto.precio.toLocaleString()}</div>
                  <button className="producto-btn" onClick={() => agregarAlCarrito(producto)}>
                    Agregar
                  </button>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <button 
                className="btn-confirmar" 
                disabled={carrito.length === 0}
                onClick={() => setPaso('carrito')}
              >
                Ver carrito ({carrito.length}) → ${total.toLocaleString()}
              </button>
            </div>
          </>
        )}

        {paso === 'carrito' && (
          <>
            <h2 style={{ marginBottom: 16 }}>Tu carrito</h2>
            {carrito.length === 0 ? (
              <p style={{ textAlign: 'center', padding: 40 }}>Tu carrito está vacío</p>
            ) : (
              <div className="carrito-lista">
                {carrito.map(item => (
                  <div key={item.id} className="carrito-item">
                    <div>
                      <strong>{item.nombre}</strong>
                      <div style={{ fontSize: 12, color: '#666' }}>${item.precio.toLocaleString()} c/u</div>
                    </div>
                    <div className="carrito-cantidad">
                      <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}>−</button>
                      <input type="number" value={item.cantidad} onChange={(e) => actualizarCantidad(item.id, parseInt(e.target.value) || 1)} />
                      <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}>+</button>
                      <button onClick={() => quitarDelCarrito(item.id)} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 4 }}>🗑</button>
                      <div style={{ minWidth: 80, textAlign: 'right', fontWeight: 'bold' }}>
                        ${(item.precio * item.cantidad).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="total">Total: ${total.toLocaleString()}</div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-confirmar" style={{ background: '#999' }} onClick={() => setPaso('menu')}>
                ← Seguir comprando
              </button>
              <button className="btn-confirmar" onClick={() => setPaso('cliente')}>
                Continuar → Datos de entrega
              </button>
            </div>
          </>
        )}

        {paso === 'cliente' && (
          <>
            <h2 style={{ marginBottom: 16 }}>Datos de tu pedido</h2>
            <div style={{ background: 'white', padding: 20, borderRadius: 8, maxWidth: 500, margin: '0 auto' }}>
              <div className="form-group">
                <label>¿Cómo deseas recibir tu pedido?</label>
                <div className="tipo-pedido">
                  {['Para llevar', 'A domicilio', 'En local'].map(t => (
                    <button
                      key={t}
                      className={`tipo-btn ${tipo === t ? 'activo' : ''}`}
                      onClick={() => setTipo(t)}
                    >
                      {t === 'Para llevar' && '🛍️'}
                      {t === 'A domicilio' && '🚗'}
                      {t === 'En local' && '🪑'}
                      {' '}{t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tu nombre *</label>
                <input
                  type="text"
                  value={cliente.nombre}
                  onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                  placeholder="Ej: Diego Salazar"
                />
              </div>

              <div className="form-group">
                <label>Tu teléfono (WhatsApp) *</label>
                <input
                  type="tel"
                  value={cliente.telefono}
                  onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                  placeholder="Ej: 3012345678"
                />
              </div>

              {tipo === 'A domicilio' && (
                <div className="form-group">
                  <label>Tu dirección *</label>
                  <input
                    type="text"
                    value={cliente.direccion}
                    onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
                    placeholder="Ej: Calle 30 #47-28"
                  />
                </div>
              )}

              <div className="total">Total: ${total.toLocaleString()}</div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-confirmar" style={{ background: '#999' }} onClick={() => setPaso('carrito')}>
                  ← Atrás
                </button>
                <button 
                  className="btn-confirmar" 
                  onClick={confirmarPedido}
                  disabled={cargando}
                >
                  {cargando ? 'Confirmando...' : 'Confirmar pedido ✓'}
                </button>
              </div>
            </div>
          </>
        )}

        {paso === 'confirmado' && pedidoConfirmado && (
          <div className="confirmado">
            <h2>✅ ¡Pedido confirmado!</h2>
            <p><strong>Número de pedido:</strong> #{pedidoConfirmado.id}</p>
            <p><strong>Cliente:</strong> {pedidoConfirmado.cliente_nombre}</p>
            <p><strong>Total:</strong> ${pedidoConfirmado.total.toLocaleString()}</p>
            <p style={{ fontSize: 14, color: '#999, marginTop: 20 }}>
              Recibirás una notificación por WhatsApp cuando el restaurante confirme tu pedido.
            </p>
            <div className="whatsapp">
              <a href={`https://wa.me/${CONFIG.telefonoWhatsApp}?text=Hola,%20quiero%20hacer%20un%20pedido`}>
                📱 Contactar por WhatsApp
              </a>
            </div>
            <button className="btn-confirmar" style={{ marginTop: 20 }} onClick={() => {
              setCarrito([]);
              setCliente({ nombre: '', telefono: '', direccion: '' });
              setTipo('Para llevar');
              setPaso('menu');
              setPedidoConfirmado(null);
            }}>
              Hacer otro pedido
            </button>
          </div>
        )}
      </div>
    </>
  );
}
