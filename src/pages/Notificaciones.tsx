function Notificaciones() {
  return (
    <div className="container mt-4">

      <h2>Notificaciones</h2>

      <div className="card mb-3">
        <div className="card-body">
          <h5>Reserva realizada</h5>
          <p>Tu reserva fue enviada correctamente.</p>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h5>Nueva motocicleta</h5>
          <p>Ya está disponible una nueva moto.</p>
        </div>
      </div>

    </div>
  );
}

export default Notificaciones;