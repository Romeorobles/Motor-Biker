import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile, updateUserProfile } from '../services/userService';
import Toast, { type ToastData } from '../components/Toast';
import { UserIcon, MailIcon, IdIcon } from '../components/icons';
import './Auth.css';

// Schema validation using Zod
const profileSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().min(1, 'El apellido es obligatorio'),
  email: z.string().email('Ingresá un correo electrónico válido'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
    },
  });

  useEffect(() => {
    if (!user) return;
    let active = true;

    setLoading(true);
    fetchUserProfile(user.id)
      .then((profile) => {
        if (active) {
          setValue('nombre', profile.nombre || '');
          setValue('apellido', profile.apellido || '');
          setValue('email', profile.email || '');
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error(err);
          setToast({ message: 'Error al cargar los datos del perfil.', type: 'error' });
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user, setValue]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;

    setUpdating(true);
    try {
      await updateUserProfile(user.id, data);
      setToast({ message: '¡Perfil actualizado con éxito!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({
        message: err instanceof Error ? err.message : 'Error al actualizar el perfil.',
        type: 'error',
      });
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3 text-muted">Cargando datos de tu perfil...</p>
      </div>
    );
  }

  return (
    <div className="auth-wrapper justify-content-center align-items-center">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="auth-panel py-5">
        <form className="auth-card" onSubmit={handleSubmit(onSubmit)} noValidate style={{ maxWidth: '440px' }}>
          <h1>Mi Perfil</h1>
          <p className="auth-subtitle">Editá tus datos personales</p>

          {/* Nombre Field */}
          <div className={`auth-field ${errors.nombre ? 'invalid' : ''}`}>
            <label htmlFor="nombre">Nombre</label>
            <div className="auth-input-wrap">
              <IdIcon className="auth-input-icon" />
              <input
                id="nombre"
                type="text"
                {...register('nombre')}
              />
            </div>
            {errors.nombre && <span className="auth-field-error">{errors.nombre.message}</span>}
          </div>

          {/* Apellido Field */}
          <div className={`auth-field ${errors.apellido ? 'invalid' : ''}`}>
            <label htmlFor="apellido">Apellido</label>
            <div className="auth-input-wrap">
              <IdIcon className="auth-input-icon" />
              <input
                id="apellido"
                type="text"
                {...register('apellido')}
              />
            </div>
            {errors.apellido && <span className="auth-field-error">{errors.apellido.message}</span>}
          </div>

          {/* Email Field */}
          <div className={`auth-field ${errors.email ? 'invalid' : ''}`}>
            <label htmlFor="email">Email</label>
            <div className="auth-input-wrap">
              <MailIcon className="auth-input-icon" />
              <input
                id="email"
                type="email"
                {...register('email')}
              />
            </div>
            {errors.email && <span className="auth-field-error">{errors.email.message}</span>}
          </div>

          {/* Role (Read-only for info) */}
          <div className="auth-field">
            <label>Rol de Usuario</label>
            <div className="auth-input-wrap">
              <UserIcon className="auth-input-icon" />
              <input
                type="text"
                value={user?.role || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit mt-4" disabled={updating}>
            {updating ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
