import { useState } from "react";

function MotoDetalle() {
  const [comentario, setComentario] = useState("");

  const comentarios = [
    {
      id: 1,
      usuario: "Juan",
      contenido: "Excelente moto, muy cómoda para viajar.",
    },
    {
      id: 2,
      usuario: "María",
      contenido: "Me gustó mucho el diseño.",
    },
  ];

  const enviarComentario = () => {
    if (comentario.trim() === "") {
      alert("Escribe un comentario");
      return;
    }

    alert("Comentario enviado");
    setComentario("");
  };

  return (
    <div className="container mt-4">
      <h2>Detalle de la Moto</h2>

      <div className="card mb-4">
        <div className="card-body">
          <h3>Honda CB125F</h3>

          <p>
            Una motocicleta ideal para la ciudad, económica y fácil de manejar.
          </p>

          <p>
            <strong>Marca:</strong> Honda
          </p>

          <p>
            <strong>Motor:</strong> Gasolina
          </p>

          <p>
            <strong>Precio:</strong> $2490
          </p>
        </div>
      </div>

      <h4>Comentarios</h4>

      {comentarios.map((item) => (
        <div key={item.id} className="card mb-2">
          <div className="card-body">
            <strong>{item.usuario}</strong>
            <p>{item.contenido}</p>
          </div>
        </div>
      ))}

      <textarea
        className="form-control mt-3"
        rows={3}
        placeholder="Escribe un comentario..."
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      ></textarea>

      <button
        className="btn btn-primary mt-3"
        onClick={enviarComentario}
      >
        Comentar
      </button>

      <button
        className="btn btn-secondary mt-3"
        onClick={() => window.history.back()}
        >
    Volver
    </button>

    </div>
  );
}

export default MotoDetalle;