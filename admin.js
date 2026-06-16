import { useState, useEffect } from 'react';
import { obtenerPedidos, actualizarEstadoPedido, escucharPedidos } from '../lib/supabase';
import Head from 'next/head';

export default function Admin() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('Pendiente');
  const [pin, setPin] = useState('');
  const [autenticado, setAutenticado] = useState(false);

  const PIN_CORRECTO = '881226'; // El PIN del admin del POS

  useEffect(() => {
    if (!autenticado) return;

    const cargarPedidos = async () => {
      const { data, error } = await obtenerPedidos();
      if (error) {
        console.error('Error:', error);
      } else {
        setPedidos(data || []);
      }
      setCargando(false);
    };

    cargarPedidos();

    // Escuchar cambios en tiempo real
    const subscription = escucharPedidos((payload) => {
      if (payload.eventType === 'INSERT') {
        setPedidos(prev => [payload.new, ...prev]);
        // Reproducir sonido de notificación
        new Audio('/notification.mp3').play().catch(() => {});
      } else if (payload.eventType === 'UPDATE') {
        setPedidos(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [autenticado]);

  const cambiarEstado = async (id, nuevoEstado) => {
    const { error } = await actualizarEstadoPedido(id, nuevoEstado);
    if (!error) {
      setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
    }
  };

  const handleLogin = () => {
    if (pin === PIN_CORRECTO) {
      setAutenticado(true);
      setPin('');
    } else {
      alert('PIN incorrecto');
      setPin('');
    }
  };

  if (!autenticado) {
    return (
      <>
        <Head>
          <title>Admin - Nita Pedidos</title>
        </Head>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #d4a574 0%, #8b6f47 100%)',
          fontFamily: 'sans-serif',
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            textAlign: 'center',
            minWidth: '300px',
          }}>
            <h1 style={{ color: '#d4a574', marginBottom: 24 }}>🍔 Dashboard Admin</h1>
            <p style={{ color: '#666', marginBottom: 20 }}>Ingresa tu PIN para ver los pedidos</p>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Escribe tu PIN"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '18px',
                letterSpacing: '3px',
                textAlign: 'center',
                marginBottom: '20px',
                border: '1px solid #ddd',
                borderRadius: '6px',
              }}
            />
            <button
              onClick={handleLogin}
              style={{
                width: '100%',
                padding: '12px',
                background: '#d4a574',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Entrar
            </button>
          </div>
        </div>
      </>
    );
  }

  const pedidosFiltrados = pedidos.filter(p => p.estado === filtro);

  return (
    <>
      <Head>
        <title>Admin - Nita Pedidos</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
          .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
          header { background: #d4a574; color: white; padding: 20px; border-radius: 8px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
          header h1 { font-size: 24px; }
          .logout { background: #ff6b6b; border: none; color: white; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; }
          .filtros { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
          .filtro-btn { padding: 10px 20px; border: 2px solid #ddd; background: white; border-radius: 6px; cursor: pointer; font-weight: bold; }
          .filtro-btn.activo { background: #d4a574; color: white; border-color: #d4a574; }
          .pedidos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px; }
          .pedido-card { background: white; border-radius: 8px; padding: 20px; border-left: 4px solid #ddd; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .pedido-card.pendiente { border-left-color: #ff9800; }
          .pedido-card.aceptado { border-left-color: #4caf50; }
          .pedido-card.listo { border-left-color: #2196f3; }
          .pedido-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; }
          .pedido-numero { font-size: 18px; font-weight: bold; color: #333; }
          .pedido-estado { display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .estado-pendiente { background: #fff3cd; color: #856404; }
          .estado-aceptado { background: #d4edda; color: #155724; }
          .estado-listo { background: #d1ecf1; color: #0c5460; }
          .pedido-cliente { margin: 12px 0; font-size: 14px; }
          .pedido-cliente strong { color: #333; }
          .pedido-items { background: #f9f9f9; padding: 12px; border-radius: 6px; margin: 12px 0; font-size: 13px; }
          .pedido-total { font-size: 20px; font-weight: bold; color: #d4a574; margin: 12px 0; }
          .acciones { display: flex; gap: 8px; margin-top: 16px; }
          .btn-estado { flex: 1; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 12px; }
          .btn-aceptar { background: #4caf50; color: white; }
          .btn-listo { background: #2196f3; color: white; }
          .no-pedidos { text-align: center; padding: 40px; color: #999; }
        `}</style>
      </Head>

      <div className="container">
        <header>
          <h1>📱 Pedidos en línea - Nita</h1>
          <button className="logout" onClick={() => setAutenticado(false)}>
            Salir
          </button>
        </header>

        <div className="filtros">
          {['Pendiente', 'Aceptado', 'Listo'].map(estado => (
            <button
              key={estado}
              className={`filtro-btn ${filtro === estado ? 'activo' : ''}`}
              onClick={() => setFiltro(estado)}
            >
              {estado === 'Pendiente' && '⏳'}
              {estado === 'Aceptado' && '✅'}
              {estado === 'Listo' && '🎉'}
              {' '}{estado} ({pedidos.filter(p => p.estado === estado).length})
            </button>
          ))}
        </div>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Cargando pedidos...</div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="no-pedidos">
            <h3>No hay pedidos en "{filtro}"</h3>
            <p>Los nuevos pedidos aparecerán aquí en tiempo real.</p>
          </div>
        ) : (
          <div className="pedidos-grid">
            {pedidosFiltrados.map(pedido => (
              <div key={pedido.id} className={`pedido-card ${pedido.estado.toLowerCase()}`}>
                <div className="pedido-header">
                  <div className="pedido-numero">#{pedido.id}</div>
                  <div className={`pedido-estado estado-${pedido.estado.toLowerCase()}`}>
                    {pedido.estado}
                  </div>
                </div>

                <div className="pedido-cliente">
                  <strong>👤 {pedido.cliente_nombre}</strong><br />
                  📱 {pedido.cliente_telefono}
                </div>

                {pedido.cliente_direccion && (
                  <div className="pedido-cliente">
                    📍 {pedido.cliente_direccion}
                  </div>
                )}

                <div className="pedido-cliente">
                  {pedido.tipo === 'Para llevar' && '🛍️ Para llevar'}
                  {pedido.tipo === 'A domicilio' && '🚗 A domicilio'}
                  {pedido.tipo === 'En local' && '🪑 En local'}
                </div>

                <div className="pedido-items">
                  {pedido.items.map((item, i) => (
                    <div key={i}>
                      {item.cantidad}x {item.nombre}
                    </div>
                  ))}
                </div>

                <div className="pedido-total">
                  ${pedido.total.toLocaleString()}
                </div>

                <div className="acciones">
                  {pedido.estado === 'Pendiente' && (
                    <button
                      className="btn-estado btn-aceptar"
                      onClick={() => cambiarEstado(pedido.id, 'Aceptado')}
                    >
                      ✅ Aceptar
                    </button>
                  )}
                  {pedido.estado === 'Aceptado' && (
                    <button
                      className="btn-estado btn-listo"
                      onClick={() => cambiarEstado(pedido.id, 'Listo')}
                    >
                      🎉 Listo
                    </button>
                  )}
                </div>

                <div style={{ fontSize: 12, color: '#999', marginTop: 12 }}>
                  {new Date(pedido.fecha_creado).toLocaleString('es-CO')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
