import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsAdultDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsAdultDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) throw new Error('La fecha de nacimiento es obligatoria.');

          const birthDate = new Date(value);
          if (isNaN(birthDate.getTime()))
            throw new Error('Fecha inválida, formato esperado: YYYY-MM-DD'); // fecha inválida

          const today = new Date();

          // evitar años fuera de rango (1900–hoy)
          if (birthDate.getFullYear() < 1900 || birthDate > today)
            throw new Error('Año de nacimiento fuera de rango (1900–hoy).');

          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          const dayDiff = today.getDate() - birthDate.getDate();

          // verificar si ya cumplió la mayoría de edad este año
          const realAge =
            monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0) ? age : age - 1;

          return realAge >= 18;
        },
        defaultMessage(args: ValidationArguments) {
          return `La fecha de nacimiento debe ser válida y el usuario debe ser mayor de edad (≥18 años).`;
        },
      },
    });
  };
}
