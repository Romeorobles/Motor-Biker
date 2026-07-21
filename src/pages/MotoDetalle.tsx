import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function MotoDetalle() {

  const { id } = useParams();

  const [moto,setMoto] = useState<any>(null);
  const [comentarios,setComentarios] = useState<any[]>([]);
  const [comentario,setComentario] = useState("");

  useEffect(()=>{
    obtenerMoto();
    obtenerComentarios();
  },[]);

  const obtenerMoto = async()=>{

    const res = await fetch(`http://localhost:3000/motos/${id}`);

    const data = await res.json();

    setMoto(data.data);

  }

  const obtenerComentarios = async()=>{

    const res = await fetch("http://localhost:3000/comentarios?page=1&limit=10");

    const data = await res.json();

    setComentarios(data.data.items);

  }

  const enviarComentario=()=>{

    alert("Falta conectar el login para obtener el userId");

    setComentario("");

  }

  if(!moto){

    return <h2>Cargando...</h2>

  }

  return(

<div className="container mt-4">

<h2>Detalle Moto</h2>

<div className="card mb-4">

<div className="card-body">

<h3>{moto.modelo}</h3>

<p><strong>Año:</strong> {moto.anio}</p>

<p><strong>Precio:</strong> ${moto.precio}</p>

<p><strong>Stock:</strong> {moto.stock}</p>

</div>

</div>

<h4>Comentarios</h4>

{

comentarios.map((item:any)=>(

<div className="card mb-2" key={item.id}>

<div className="card-body">

<p>{item.contenido}</p>

</div>

</div>

))

}

<textarea

className="form-control"

rows={3}

value={comentario}

onChange={(e)=>setComentario(e.target.value)}

/>

<button
  className="btn btn-primary mt-3 me-2"
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

  )

}

export default MotoDetalle;