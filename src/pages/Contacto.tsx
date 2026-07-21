import { useState } from "react";

function Contacto() {

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");

  const enviarMensaje = async () => {

    if(nombre==="" || email==="" || mensaje===""){
      alert("Completa todos los campos");
      return;
    }

    const respuesta = await fetch("http://localhost:3000/mensajes",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        nombre,
        email,
        mensaje
      })

    });

    if(respuesta.ok){

      alert("Mensaje enviado");

      setNombre("");
      setEmail("");
      setMensaje("");

    }else{

      alert("No se pudo enviar el mensaje");

    }

  };

  return (
    <div className="container mt-4">

      <h2>Contacto</h2>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Nombre"
        value={nombre}
        onChange={(e)=>setNombre(e.target.value)}
      />

      <input
        type="email"
        className="form-control mb-3"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />

      <textarea
        className="form-control mb-3"
        rows={4}
        placeholder="Escribe tu mensaje"
        value={mensaje}
        onChange={(e)=>setMensaje(e.target.value)}
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