import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup.string().email('Correo inválido').required('El correo es obligatorio'),
  password: yup.string().required('La contraseña es obligatoria'),
});

export const registerSchema = yup.object().shape({
  fullName: yup.string().required('El nombre completo es obligatorio'),
  email: yup.string().email('Correo inválido').required('El correo es obligatorio'),
  password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
  terms: yup
      .boolean()
      .oneOf([true], 'Debes aceptar los términos y condiciones para registrarte.')
      .required(),
});