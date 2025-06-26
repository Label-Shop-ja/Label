import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  email: Yup.string().email('Correo inválido').required('El correo es obligatorio'),
  password: Yup.string().required('La contraseña es obligatoria'),
});

export const registerSchema = Yup.object().shape({
  fullName: Yup.string().required('El nombre es obligatorio'),
  email: Yup.string().email('Correo inválido').required('El correo es obligatorio'),
  password: Yup.string().min(6, 'Mínimo 6 caracteres').required('La contraseña es obligatoria'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
});