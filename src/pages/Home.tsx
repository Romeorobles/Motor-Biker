import { useState } from 'react'
import honda from '../assets/motos/honda.jpg'
import yamaha from '../assets/motos/yamaha.jpg'
import suzuki from '../assets/motos/suzuki.jpg'
import superSoco from '../assets/motos/superSoco.jpg'

function Home() {
  const [buscar, setBuscar] = useState('')
  const [marca, setMarca] = useState('')
  const [categoria, setCategoria] = useState('')
  const [motor, setMotor] = useState('')

  const motos = [
    {
      id: 1,
      nombre: 'Honda CB125F',
      marca: 'Honda',
      categoria: 'Urbana',
      motor: 'Gasolina',
      precio: 2490,
      imagen: honda,
    },
    {
      id: 2,
      nombre: 'Yamaha MT-03',
      marca: 'Yamaha',
      categoria: 'Deportiva',
      motor: 'Gasolina',
      precio: 6490,
      imagen: yamaha,
    },
    {
      id: 3,
      nombre: 'Suzuki V-Strom 250',
      marca: 'Suzuki',
      categoria: 'Adventure',
      motor: 'Gasolina',
      precio: 5990,
      imagen: suzuki,
    },
    {
      id: 4,
      nombre: 'Super Soco TC',
      marca: 'Super Soco',
      categoria: 'Urbana',
      motor: 'Eléctrico',
      precio: 3990,
      imagen: superSoco,
    },
  ]

  const motosFiltradas = motos.filter((moto) => {
    return (
      moto.nombre.toLowerCase().includes(buscar.toLowerCase()) &&
      moto.marca.toLowerCase().includes(marca.toLowerCase()) &&
      moto.categoria.toLowerCase().includes(categoria.toLowerCase()) &&
      moto.motor.toLowerCase().includes(motor.toLowerCase())
    )
  })

  document.title = 'Catálogo de motos'

  return (
    <div className="container mt-4">
      <h1>Catálogo de motos</h1>

      <input
        type="text"
        className="form-control mb-4"
        placeholder="Buscar moto"
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
      />

      <input
        type="text"
        className="form-control mb-4"
        placeholder="Buscar por marca"
        value={marca}
        onChange={(e) => setMarca(e.target.value)}
      />

      <input
        type="text"
        className="form-control mb-4"
        placeholder="Buscar por categoría"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      />

      <input
        type="text"
        className="form-control mb-4"
        placeholder="Buscar por motor"
        value={motor}
        onChange={(e) => setMotor(e.target.value)}
      />

      <button
      className='btn btn-secondary mb-4'
      onClick={()=>{
        setBuscar('')
        setMarca('')
        setCategoria('')
        setMotor('')
      }}
      >
        Limpiar filtros
      </button>

      <div className="row">
        {motosFiltradas.map((moto) => (
          <div className="col-md-4 mb-3" key={moto.id}>
            <div className="card">
              <img
              src={moto.imagen} 
              className="card-img-top" 
              alt={moto.nombre}
              />
              <div className="card-body">
                <h2 className="card-title">{moto.nombre}</h2>

                <p>Marca: {moto.marca}</p>
                <p>Categoría: {moto.categoria}</p>
                <p>Motor: {moto.motor}</p>
                <p>Precio: ${moto.precio}</p>

                <button className="btn btn-primary">
                  Ver detalle
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home