import {
  ValidationArguments,
  Validator,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'MatchPassword', async: false })
export class MatchPassword implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    if (password !== (args.object as any)[args.constraints[0]]) {
      return false;
    }
    return true;
  }

  defaultMessage(): string {
    return 'La contraseña y la confirmación de contraseña no coinciden';
  }
}
