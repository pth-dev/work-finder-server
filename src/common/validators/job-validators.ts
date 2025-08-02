import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

// XSS Prevention Validator
@ValidatorConstraint({ name: 'isNotXSS', async: false })
export class IsNotXSSConstraint implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (!text) return true;
    
    // Check for common XSS patterns
    const xssPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // onclick, onload, etc.
      /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
      /<embed[\s\S]*?>/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
    ];
    
    return !xssPatterns.some(pattern => pattern.test(text));
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} contains potentially malicious content`;
  }
}

export function IsNotXSS(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotXSSConstraint,
    });
  };
}

// SQL Injection Prevention Validator
@ValidatorConstraint({ name: 'isNotSQLInjection', async: false })
export class IsNotSQLInjectionConstraint implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (!text) return true;
    
    // Check for common SQL injection patterns
    const sqlInjectionPatterns = [
      /[';|*%<>{}[\]()]/gi,
      /((\3D)|(\%3D))/gi, // URL encoded =
      /((\2F)|(\%2F))/gi, // URL encoded /
      /(union.*select)/gi,
      /(select.*from)/gi,
      /(insert.*into)/gi,
      /(delete.*from)/gi,
      /(update.*set)/gi,
      /(drop.*table)/gi,
      /(alter.*table)/gi,
      /(exec.*)/gi,
      /(script.*)/gi,
    ];
    
    return !sqlInjectionPatterns.some(pattern => pattern.test(text));
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} contains potentially malicious SQL patterns`;
  }
}

export function IsNotSQLInjection(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotSQLInjectionConstraint,
    });
  };
}

// Professional Text Validator (for job titles, descriptions)
@ValidatorConstraint({ name: 'isProfessionalText', async: false })
export class IsProfessionalTextConstraint implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (!text) return true;
    
    // Check for inappropriate content patterns
    const inappropriatePatterns = [
      /\b(fuck|shit|damn|hell|ass|bitch|bastard)\b/gi,
      /\b(sex|porn|xxx|adult|escort)\b/gi,
      /\b(scam|fraud|pyramid|ponzi|mlm)\b/gi,
      /\b(urgent.*money|quick.*cash|easy.*money)\b/gi,
      /\b(100%.*guaranteed|no.*experience.*required.*high.*pay)\b/gi,
    ];
    
    return !inappropriatePatterns.some(pattern => pattern.test(text));
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} contains inappropriate content for professional context`;
  }
}

export function IsProfessionalText(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsProfessionalTextConstraint,
    });
  };
}

// URL Validator (enhanced)
@ValidatorConstraint({ name: 'isSecureURL', async: false })
export class IsSecureURLConstraint implements ValidatorConstraintInterface {
  validate(url: string, args: ValidationArguments) {
    if (!url) return true;
    
    try {
      const urlObj = new URL(url);
      
      // Only allow secure protocols
      const allowedProtocols = ['https:', 'http:'];
      if (!allowedProtocols.includes(urlObj.protocol)) {
        return false;
      }
      
      // Prevent localhost and private IP addresses in production
      const hostname = urlObj.hostname.toLowerCase();
      const privateIpPatterns = [
        /^localhost$/,
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        /^::1$/,
        /^fe80:/,
      ];
      
      // In production, you might want to block private IPs
      // return !privateIpPatterns.some(pattern => pattern.test(hostname));
      
      return true;
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid and secure URL`;
  }
}

export function IsSecureURL(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSecureURLConstraint,
    });
  };
}

// File upload validators
export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const,
} as const;

type AllowedMimeType = typeof FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES[number] | typeof FILE_UPLOAD_LIMITS.ALLOWED_DOCUMENT_TYPES[number];

export function validateFileUpload(file: Express.Multer.File, type: 'image' | 'document') {
  const errors: string[] = [];
  
  // Check file size
  if (file.size > FILE_UPLOAD_LIMITS.MAX_FILE_SIZE) {
    errors.push(`File size must be less than ${FILE_UPLOAD_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
  
  // Check file type
  const allowedTypes = type === 'image' 
    ? FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES 
    : FILE_UPLOAD_LIMITS.ALLOWED_DOCUMENT_TYPES;
  
  if (!(allowedTypes as readonly string[]).includes(file.mimetype)) {
    errors.push(`File type ${file.mimetype} is not allowed`);
  }
  
  // Check for malicious file extensions
  const maliciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.vbs', '.js', '.jar'];
  const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  
  if (maliciousExtensions.includes(fileExtension)) {
    errors.push('File extension is not allowed');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}