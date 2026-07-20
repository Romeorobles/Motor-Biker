function Contacto() {

  const enviarMensaje = () => {
    alert("Mensaje enviado");
  };

  return (
    <div className="container mt-4">

      <h2>Contacto</h2>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Nombre"
      />

      <input
        type="email"
        className="form-control mb-3"
        placeholder="Correo electrónico"
      />

      <textarea
        className="form-control mb-3"
        rows={4}
        placeholder="Escribe tu mensaje"
      ></textarea>

      <button
        className="btn btn-primary"
        onClick={enviarMensaje}
      >
        Enviar
      </button>

    </div>
  );
}

export default Contacto;