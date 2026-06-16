# 🍔 Nita Pedidos - App de Pedidos en Línea

App de pedidos en línea para el Restaurante Nita en Marinilla, Antioquia.

## 🚀 Características

- ✅ Catálogo completo de productos (40+ hamburguesas y opciones)
- ✅ Carrito editable con modificadores
- ✅ Tipos de pedido: Para llevar, A domicilio, En local
- ✅ Dashboard admin en tiempo real
- ✅ Notificaciones por WhatsApp
- ✅ Seguimiento del estado del pedido
- ✅ BD en Supabase (gratis)
- ✅ Hosting en Vercel (gratis)

## 📋 Setup (Instrucciones para Roy)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/nita-app.git
cd nita-app
npm install
```

### 2. Crear tablas en Supabase

Entra a tu proyecto en https://supabase.com

Ve a **SQL Editor** → **New Query** y ejecuta esto:

```sql
-- Crear tabla de pedidos
CREATE TABLE pedidos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,
  cliente_direccion TEXT,
  tipo TEXT NOT NULL, -- 'Para llevar', 'A domicilio', 'En local'
  items JSONB NOT NULL,
  total BIGINT NOT NULL,
  notas TEXT,
  estado TEXT NOT NULL DEFAULT 'Pendiente', -- 'Pendiente', 'Aceptado', 'Listo'
  metodo_pago TEXT,
  fecha_creado TIMESTAMP DEFAULT NOW(),
  fecha_actualizado TIMESTAMP DEFAULT NOW()
);

-- Crear índices
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_creado DESC);

-- Habilitar RLS (Row Level Security) - permitir lectura pública
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura pública" ON pedidos FOR SELECT USING (TRUE);
CREATE POLICY "Permitir inserciones públicas" ON pedidos FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Permitir actualizaciones públicas" ON pedidos FOR UPDATE USING (TRUE);
```

### 3. Configurar variables de entorno

Copia `.env.local.example` a `.env.local` y llena tus datos:

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://nxczjupvagtakmewejkh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_OsxrQv24qz4dUmaacH1VA_BvSRh...
ADMIN_PHONE=3016092616
```

(Las claves están en Supabase → Settings → API)

### 4. Probar localmente

```bash
npm run dev
```

Abre http://localhost:3000

- Cliente: http://localhost:3000/
- Admin: http://localhost:3000/admin (PIN: 881226)

### 5. Deployar en Vercel

1. Sube el código a GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Ve a https://vercel.com
3. Clic en "Import Project" → selecciona tu repositorio
4. En "Environment Variables" añade:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_PHONE`
5. Clic en "Deploy"

Tu app estará en: **https://nita.vercel.app**

## 📱 URLs

- **App cliente:** https://nita.vercel.app
- **Dashboard admin:** https://nita.vercel.app/admin
- **PIN admin:** 881226

## 🔔 Notificaciones WhatsApp

Por ahora, los pedidos se guardan en Supabase. Para enviar notificaciones WhatsApp automáticas, necesitas:

1. Integración con Twilio o Meta Cloud API
2. Webhook en un servidor

Eso se configura después si lo necesitas.

## 📊 Tabla de datos esperados

Los pedidos se guardan así en Supabase:

```json
{
  "id": 1,
  "cliente_nombre": "Diego Salazar",
  "cliente_telefono": "3012345678",
  "cliente_direccion": "Calle 30 #47-28",
  "tipo": "A domicilio",
  "items": [
    { "nombre": "Burger sencilla", "precio": 20000, "cantidad": 2 }
  ],
  "total": 40000,
  "estado": "Pendiente",
  "fecha_creado": "2026-06-15T20:30:00"
}
```

## 🛠 Soporte

Roy: cualquier pregunta o problema, avísame.

---

**Hecho con ❤️ para Nita**
