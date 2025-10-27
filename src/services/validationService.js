// Data Validation and Sanitization Service
// Handles comprehensive data validation, sanitization, and transformation

class DataValidator {
  constructor() {
    this.validationRules = {
      // User data validation
      user: {
        email: { type: 'email', required: true, maxLength: 255 },
        password: {
          type: 'password',
          required: true,
          minLength: 8,
          custom: this.validatePasswordStrength,
          customMessage: 'Password must contain uppercase, lowercase, number, and special character'
        },
        firstName: { type: 'name', required: true, maxLength: 50 },
        lastName: { type: 'name', required: true, maxLength: 50 },
        phone: { type: 'phone', required: false, maxLength: 20 },
        role: {
          type: 'string',
          required: true,
          pattern: /^(admin|teacher|staff|student)$/,
          customMessage: 'Role must be one of: admin, teacher, staff, student'
        }
      },

      // Student data validation
      student: {
        studentId: { type: 'studentId', required: true, maxLength: 20 },
        firstName: { type: 'name', required: true, maxLength: 50 },
        lastName: { type: 'name', required: true, maxLength: 50 },
        email: { type: 'email', required: true, maxLength: 255 },
        phone: { type: 'phone', required: false, maxLength: 20 },
        dateOfBirth: {
          type: 'string',
          required: true,
          pattern: /^\d{4}-\d{2}-\d{2}$/,
          custom: this.validateAge,
          customMessage: 'Student must be between 13 and 25 years old'
        },
        program: { type: 'string', required: true, maxLength: 100 },
        level: {
          type: 'string',
          required: true,
          pattern: /^(L3|L4|L5)$/,
          customMessage: 'Level must be L3, L4, or L5'
        }
      },

      // Post data validation
      post: {
        title: { type: 'string', required: true, minLength: 5, maxLength: 200 },
        content: { type: 'string', required: true, minLength: 10, maxLength: 5000 },
        type: {
          type: 'string',
          required: true,
          pattern: /^(text|image|video)$/,
          customMessage: 'Type must be text, image, or video'
        },
        visible: { type: 'boolean', required: false }
      },

      // Comment validation
      comment: {
        text: { type: 'string', required: true, minLength: 1, maxLength: 1000 },
        author: { type: 'string', required: true, maxLength: 100 },
        postId: { type: 'string', required: true }
      },

      // Application validation
      application: {
        fullName: { type: 'name', required: true, maxLength: 100 },
        email: { type: 'email', required: true, maxLength: 255 },
        phone: { type: 'phone', required: true, maxLength: 20 },
        program: { type: 'string', required: true, maxLength: 100 },
        level: {
          type: 'string',
          required: true,
          pattern: /^(L3|L4|L5)$/,
          customMessage: 'Level must be L3, L4, or L5'
        },
        educationLevel: { type: 'string', required: false, maxLength: 100 }
      }
    };

    this.sanitizationRules = {
      text: {
        maxLength: 1000,
        stripHtml: false,
        preventSql: true,
        preventXss: true
      },
      html: {
        maxLength: 5000,
        allowedTags: ['p', 'br', 'strong', 'em', 'a'],
        preventSql: true,
        preventXss: true
      },
      filename: {
        maxLength: 100,
        allowedChars: /^[a-zA-Z0-9._-]+$/
      }
    };
  }

  // Validate password strength
  validatePasswordStrength(password) {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);

    return hasLower && hasUpper && hasNumber && hasSpecial;
  }

  // Validate age from date of birth
  validateAge(dateString) {
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    return age >= 13 && age <= 25;
  }

  // Validate data against schema
  validate(data, schemaName) {
    const schema = this.validationRules[schemaName];
    if (!schema) {
      return { isValid: false, errors: { schema: 'Invalid validation schema' } };
    }

    const errors = {};
    let isValid = true;

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      // Required field validation
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        isValid = false;
        continue;
      }

      // Skip validation if field is empty and not required
      if (!value && !rules.required) {
        continue;
      }

      // Type validation
      if (rules.type && !this.validateType(value, rules.type)) {
        errors[field] = this.getTypeErrorMessage(field, rules.type);
        isValid = false;
        continue;
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = rules.customMessage || `${field} format is invalid`;
        isValid = false;
        continue;
      }

      // Length validation
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters`;
        isValid = false;
        continue;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = `${field} must be no more than ${rules.maxLength} characters`;
        isValid = false;
        continue;
      }

      // Custom validation
      if (rules.custom && !rules.custom(value)) {
        errors[field] = rules.customMessage || `${field} is invalid`;
        isValid = false;
        continue;
      }
    }

    return { isValid, errors };
  }

  // Validate data type
  validateType(value, type) {
    switch (type) {
      case 'email':
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
      case 'phone':
        return /^\+?[\d\s\-\(\)]+$/.test(value);
      case 'password':
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
      case 'name':
        return /^[a-zA-Z\s]{2,50}$/.test(value);
      case 'studentId':
        return /^[A-Z0-9]{6,12}$/.test(value);
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null;
      case 'date':
        return !isNaN(Date.parse(value));
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      default:
        return true;
    }
  }

  // Get type error message
  getTypeErrorMessage(field, type) {
    const messages = {
      email: 'Please enter a valid email address',
      phone: 'Please enter a valid phone number',
      password: 'Password must contain uppercase, lowercase, number, and special character',
      name: 'Name can only contain letters and spaces',
      studentId: 'Student ID must contain only letters and numbers',
      string: 'Must be a text value',
      number: 'Must be a number',
      boolean: 'Must be true or false',
      array: 'Must be a list of items',
      object: 'Must be an object',
      date: 'Must be a valid date',
      url: 'Must be a valid URL'
    };

    return messages[type] || `${field} is invalid`;
  }

  // Sanitize data
  sanitize(data, type = 'text') {
    if (typeof data !== 'string') {
      data = String(data);
    }

    const rules = this.sanitizationRules[type] || this.sanitizationRules.text;

    let sanitized = data;

    // Length limit
    if (rules.maxLength && sanitized.length > rules.maxLength) {
      sanitized = sanitized.substring(0, rules.maxLength);
    }

    // HTML sanitization
    if (rules.stripHtml) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    } else if (rules.allowedTags) {
      const allowedPattern = new RegExp(`<(?!/?(${rules.allowedTags.join('|')})\\b)[^>]*>`, 'gi');
      sanitized = sanitized.replace(allowedPattern, '');
    }

    // Security sanitization
    if (rules.preventSql) {
      sanitized = sanitized.replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '');
    }

    if (rules.preventXss) {
      sanitized = sanitized.replace(/(\bjavascript:|vbscript:|on\w+\s*=)/gi, '');
    }

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
  }

  // Sanitize object data
  sanitizeObject(data, schema) {
    const sanitized = {};

    for (const [field, value] of Object.entries(data)) {
      if (schema[field]) {
        const rules = schema[field];
        let sanitizedValue = value;

        // Type conversion
        if (rules.type === 'number' && typeof value === 'string') {
          sanitizedValue = parseFloat(value) || 0;
        } else if (rules.type === 'boolean' && typeof value === 'string') {
          sanitizedValue = value.toLowerCase() === 'true';
        } else if (rules.type === 'array' && typeof value === 'string') {
          sanitizedValue = value.split(',').map(item => item.trim());
        }

        // Sanitization
        if (typeof sanitizedValue === 'string') {
          sanitizedValue = this.sanitize(sanitizedValue, rules.sanitizeType || 'text');
        }

        sanitized[field] = sanitizedValue;
      } else {
        // Unknown field - sanitize as text
        sanitized[field] = typeof value === 'string' ? this.sanitize(value) : value;
      }
    }

    return sanitized;
  }

  // Validate and sanitize form data
  validateAndSanitize(data, schemaName) {
    const schema = this.validationRules[schemaName];
    if (!schema) {
      return {
        isValid: false,
        errors: { schema: 'Invalid validation schema' },
        data: null
      };
    }

    // First validate
    const validation = this.validate(data, schemaName);
    if (!validation.isValid) {
      return {
        isValid: false,
        errors: validation.errors,
        data: null
      };
    }

    // Then sanitize
    const sanitizedData = this.sanitizeObject(data, schema);

    return {
      isValid: true,
      errors: {},
      data: sanitizedData
    };
  }

  // Batch validation for multiple items
  validateBatch(items, schemaName) {
    const results = {
      valid: [],
      invalid: [],
      errors: []
    };

    items.forEach((item, index) => {
      const validation = this.validateAndSanitize(item, schemaName);

      if (validation.isValid) {
        results.valid.push({ index, data: validation.data });
      } else {
        results.invalid.push({ index, errors: validation.errors });
        results.errors.push({ index, errors: validation.errors });
      }
    });

    return results;
  }

  // File validation
  validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
      allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'],
      required = true
    } = options;

    const errors = [];

    if (required && !file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }

    if (file) {
      // Size validation
      if (file.size > maxSize) {
        errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      }

      // Type validation
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File type ${file.type} is not allowed`);
      }

      // Extension validation
      const extension = file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        errors.push(`File extension .${extension} is not allowed`);
      }

      // Filename validation
      if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
        errors.push('Filename contains invalid characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Image validation
  validateImage(file, options = {}) {
    const baseValidation = this.validateFile(file, {
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      ...options
    });

    if (!baseValidation.isValid) {
      return baseValidation;
    }

    const errors = [...baseValidation.errors];

    // Image dimension validation
    if (options.minWidth || options.minHeight) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (options.minWidth && img.width < options.minWidth) {
            errors.push(`Image width must be at least ${options.minWidth}px`);
          }
          if (options.minHeight && img.height < options.minHeight) {
            errors.push(`Image height must be at least ${options.minHeight}px`);
          }

          resolve({
            isValid: errors.length === 0,
            errors,
            dimensions: { width: img.width, height: img.height }
          });
        };
        img.onerror = () => {
          errors.push('Invalid image file');
          resolve({ isValid: false, errors });
        };
        img.src = URL.createObjectURL(file);
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate URL
  validateUrl(url) {
    try {
      new URL(url);
      return { isValid: true, url };
    } catch {
      return { isValid: false, errors: ['Invalid URL format'] };
    }
  }

  // Validate date range
  validateDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { isValid: false, errors: ['Invalid date format'] };
    }

    if (start >= end) {
      return { isValid: false, errors: ['Start date must be before end date'] };
    }

    return { isValid: true };
  }

  // Validate number range
  validateNumberRange(value, min, max) {
    const num = parseFloat(value);

    if (isNaN(num)) {
      return { isValid: false, errors: ['Must be a valid number'] };
    }

    if (min !== undefined && num < min) {
      return { isValid: false, errors: [`Must be at least ${min}`] };
    }

    if (max !== undefined && num > max) {
      return { isValid: false, errors: [`Must be no more than ${max}`] };
    }

    return { isValid: true, value: num };
  }

  // Validate array data
  validateArray(items, itemSchema) {
    if (!Array.isArray(items)) {
      return { isValid: false, errors: ['Must be an array'] };
    }

    const errors = [];
    const validItems = [];

    items.forEach((item, index) => {
      const validation = this.validateAndSanitize(item, itemSchema);
      if (validation.isValid) {
        validItems.push(validation.data);
      } else {
        errors.push({ index, errors: validation.errors });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      validItems,
      totalItems: items.length,
      validCount: validItems.length,
      invalidCount: errors.length
    };
  }

  // Transform data (normalize, format, etc.)
  transform(data, transformations) {
    const transformed = { ...data };

    for (const [field, transform] of Object.entries(transformations)) {
      if (transformed[field] !== undefined) {
        switch (transform.type) {
          case 'lowercase':
            transformed[field] = String(transformed[field]).toLowerCase();
            break;
          case 'uppercase':
            transformed[field] = String(transformed[field]).toUpperCase();
            break;
          case 'trim':
            transformed[field] = String(transformed[field]).trim();
            break;
          case 'date':
            transformed[field] = new Date(transformed[field]).toISOString();
            break;
          case 'number':
            transformed[field] = parseFloat(transformed[field]) || 0;
            break;
          case 'boolean':
            transformed[field] = Boolean(transformed[field]);
            break;
          case 'json':
            try {
              transformed[field] = JSON.parse(transformed[field]);
            } catch {
              // Invalid JSON, leave as is
            }
            break;
          case 'custom':
            if (transform.function) {
              transformed[field] = transform.function(transformed[field]);
            }
            break;
        }
      }
    }

    return transformed;
  }

  // Create validation schema dynamically
  createSchema(fields) {
    const schema = {};

    fields.forEach(field => {
      schema[field.name] = {
        type: field.type || 'string',
        required: field.required || false,
        minLength: field.minLength,
        maxLength: field.maxLength,
        pattern: field.pattern,
        custom: field.custom,
        customMessage: field.customMessage,
        sanitizeType: field.sanitizeType || 'text'
      };
    });

    return schema;
  }

  // Validate form with multiple steps
  validateMultiStep(data, steps) {
    const results = {};
    let allValid = true;

    steps.forEach(step => {
      const stepData = {};
      step.fields.forEach(field => {
        stepData[field] = data[field];
      });

      const validation = this.validateAndSanitize(stepData, step.schema);
      results[step.name] = validation;

      if (!validation.isValid) {
        allValid = false;
      }
    });

    return {
      isValid: allValid,
      results,
      data: allValid ? this.sanitizeObject(data, this.validationRules[steps[0].schema]) : null
    };
  }

  // Export validation rules for frontend
  getValidationRules(schemaName) {
    return this.validationRules[schemaName];
  }

  // Generate validation summary
  getValidationSummary(validationResults) {
    const summary = {
      total: 0,
      valid: 0,
      invalid: 0,
      errors: []
    };

    if (Array.isArray(validationResults)) {
      validationResults.forEach(result => {
        summary.total++;
        if (result.isValid) {
          summary.valid++;
        } else {
          summary.invalid++;
          summary.errors.push(result.errors);
        }
      });
    } else {
      summary.total = 1;
      if (validationResults.isValid) {
        summary.valid = 1;
      } else {
        summary.invalid = 1;
        summary.errors.push(validationResults.errors);
      }
    }

    summary.successRate = summary.total > 0 ? (summary.valid / summary.total) * 100 : 0;

    return summary;
  }
}

// React hook for form validation
export const useValidation = (initialData = {}, schemaName) => {
  const [data, setData] = React.useState(initialData);
  const [errors, setErrors] = React.useState({});
  const [isValid, setIsValid] = React.useState(true);
  const [touched, setTouched] = React.useState({});

  const validate = React.useCallback((fieldName = null) => {
    const dataToValidate = fieldName ? { [fieldName]: data[fieldName] } : data;
    const schema = fieldName ?
      { [fieldName]: dataValidator.validationRules[schemaName]?.[fieldName] } :
      dataValidator.validationRules[schemaName];

    if (!schema) {
      setErrors({});
      setIsValid(true);
      return;
    }

    // Create validation schema for current data
    const validationSchema = {};
    Object.keys(dataToValidate).forEach(key => {
      if (schema[key]) {
        validationSchema[key] = schema[key];
      }
    });

    const validation = dataValidator.validate(dataToValidate, schemaName);
    setErrors(validation.errors);
    setIsValid(validation.isValid);
  }, [data, schemaName]);

  const setFieldValue = React.useCallback((field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const setFieldTouched = React.useCallback((field, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const reset = React.useCallback(() => {
    setData(initialData);
    setErrors({});
    setTouched({});
    setIsValid(true);
  }, [initialData]);

  React.useEffect(() => {
    validate();
  }, [validate]);

  return {
    data,
    errors,
    isValid,
    touched,
    setFieldValue,
    setFieldTouched,
    validate,
    reset
  };
};

// Create singleton instance
export const dataValidator = new DataValidator();

export default dataValidator;
