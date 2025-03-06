import Ajv from "ajv";
const ajv = new Ajv({ removeAdditional: "all", strict: false, allErrors: true });

ajv.addFormat("email", /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i);
ajv.addFormat("password", /^.{6,}$/);
ajv.addFormat("binary", /.*/);
ajv.addFormat("integer", /^\d+$/);
ajv.addFormat("boolean", /^(true|false)$/i);
ajv.addFormat("datetime", /^\d\d\d\d-\d\d?-\d\d? \d\d?:\d\d?:\d\d?$/);

interface ValidationResult {
    valid: boolean;
    errorText: string;
}

export function validate<T>(schema: object, data: T): ValidationResult {
    try {
        const validator = ajv.compile<T>(schema);
        const valid = validator(data);
        return {
            valid,
            errorText: ajv.errorsText(validator.errors)
        };
    } catch (err) {
        return {
            valid: false,
            errorText: err.message
        };
    }
}