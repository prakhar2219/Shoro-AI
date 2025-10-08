import { body } from 'express-validator';

export const signupValidation = [
  body('email').isEmail().withMessage('Por favor ingresa un email válido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('name').notEmpty().withMessage('El nombre es requerido'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Por favor ingresa un email válido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
];
