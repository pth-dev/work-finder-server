import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint
  implements ValidatorConstraintInterface
{
  validate(password: string, args: ValidationArguments) {
    if (!password) return false;

    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isSafeFilename', async: false })
export class IsSafeFilenameConstraint implements ValidatorConstraintInterface {
  validate(filename: string, args: ValidationArguments) {
    if (!filename) return false;

    // Prevent directory traversal and dangerous characters
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    const pathTraversal = /\.\./;

    return !dangerousChars.test(filename) && !pathTraversal.test(filename);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Filename contains invalid or potentially dangerous characters';
  }
}

export function IsSafeFilename(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSafeFilenameConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isSafeSearchTerm', async: false })
export class IsSafeSearchTermConstraint
  implements ValidatorConstraintInterface
{
  validate(searchTerm: string, args: ValidationArguments) {
    if (!searchTerm) return true; // Allow empty search

    // Prevent SQL injection patterns
    const sqlInjectionPatterns = [
      /('|\\')|(;|\\;)|(--)|(\s*(union|select|insert|update|delete|drop|create|alter|exec|execute)\s+)/i,
      /(script|javascript|vbscript|onload|onerror|onclick)/i,
    ];

    return !sqlInjectionPatterns.some((pattern) => pattern.test(searchTerm));
  }

  defaultMessage(args: ValidationArguments) {
    return 'Search term contains potentially dangerous characters';
  }
}

export function IsSafeSearchTerm(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSafeSearchTermConstraint,
    });
  };
}

// ✅ SECURITY: URL validation with whitelist
@ValidatorConstraint({ name: 'isSafeUrl', async: false })
export class IsSafeUrlConstraint implements ValidatorConstraintInterface {
  validate(url: string, args: ValidationArguments) {
    if (!url) return true; // Allow empty URL

    try {
      const parsedUrl = new URL(url);

      // Only allow HTTP and HTTPS protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return false;
      }

      // Prevent localhost and private IP ranges in production
      if (process.env.NODE_ENV === 'production') {
        const hostname = parsedUrl.hostname.toLowerCase();
        const privateIpPatterns = [
          /^localhost$/,
          /^127\./,
          /^10\./,
          /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
          /^192\.168\./,
          /^::1$/,
          /^fc00:/,
          /^fe80:/,
        ];

        if (privateIpPatterns.some((pattern) => pattern.test(hostname))) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return 'URL is not valid or contains restricted domains';
  }
}

export function IsSafeUrl(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSafeUrlConstraint,
    });
  };
}

// ✅ SECURITY: Phone number validation
@ValidatorConstraint({ name: 'isValidPhoneNumber', async: false })
export class IsValidPhoneNumberConstraint
  implements ValidatorConstraintInterface
{
  validate(phone: string, args: ValidationArguments) {
    if (!phone) return true; // Allow empty phone

    // International phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  defaultMessage(args: ValidationArguments) {
    return 'Phone number must be in valid international format';
  }
}

export function IsValidPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPhoneNumberConstraint,
    });
  };
}
