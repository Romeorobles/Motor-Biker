# Motor-Biker

Aplicación web para la gestión y venta de motocicletas: catálogo público, sistema de reservas y un panel administrativo completo, construida con ReactJS + Vite consumiendo una API REST desarrollada en NestJS.

## Integrantes

- Romeo Robles (Israel)
- _[completar con el resto del equipo]_

## Descripción funcional

Motor-Biker permite a cualquier visitante explorar un catálogo de motocicletas (búsqueda, detalle por unidad) sin necesidad de iniciar sesión. Los usuarios registrados pueden reservar motos y gestionar su cuenta. Los administradores cuentan con un panel privado con dashboard de métricas, gestión de motos, categorías, usuarios, ventas y reservas.

## Tecnologías Utilizadas

- ReactJS + TypeScript
- Vite
- Axios (con interceptor JWT)
- React Router DOM
- React Hook Form + Zod
- Recharts
- Bootstrap (estilos base) + CSS propio

## Instalación

```bash
git clone https://github.com/Romeorobles/Motor-Biker.git
cd Motor-Biker
npm install
```

### Variables de entorno

Crear un archivo `.env` en la raíz del proyecto (ver `.env.example`):

```
VITE_API_URL=http://localhost:3000
```

Para producción, esta variable debe apuntar a la URL pública del backend desplegado.

### Ejecutar el proyecto

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Uso

1. **Área pública**: catálogo de motos en `/`, detalle en `/motos/:id`, sin necesidad de iniciar sesión.
2. **Registro / Login**: en `/register` y `/login`. Al autenticarse correctamente el token JWT se guarda y la sesión persiste mientras sea válido.
3. **Reservar una moto**: desde el detalle de cualquier moto, con sesión iniciada.
4. **Panel Admin** (`/admin`, solo rol `ADMIN`): dashboard con métricas y gráficos, y gestión CRUD de Motos, Categorías, Usuarios, Ventas y Reservas.

## Despliegue

- **Frontend**: desplegado vía GitHub Actions (`.github/workflows/deploy.yml`) a un VPS Ubuntu + Nginx, con build automático en cada push a `main`.
- **Backend**: NestJS desplegado en el mismo VPS, gestionado con PM2 detrás de Nginx con HTTPS (Let's Encrypt).
- **Variables de entorno de producción**: `VITE_API_URL` se configura como secret de GitHub (`REACT_ENV`), inyectado en tiempo de build.

### URLs públicas

- Frontend: `https://motor-biker.uaeftt-ute.site`
- Backend (API): `https://motor-biker-api.uaeftt-ute.site`
- Documentación Swagger del backend: `https://motor-biker-api.uaeftt-ute.site/docs`
