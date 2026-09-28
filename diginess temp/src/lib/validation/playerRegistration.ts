import * as yup from 'yup';

const localTodayYMD = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Individual / student registration form. Messages are shown under each field. */
export const individualRegistrationSchema = yup.object({
  full_name: yup
    .string()
    .trim()
    .required('Full name is required')
    .min(3, 'Full name must be at least 3 characters')
    .max(60, 'Full name must be at most 60 characters')
    .matches(/^\p{L}[\p{L}\p{M} .'-]*$/u, 'Use letters only (spaces, . \' - allowed)'),
  date_of_birth: yup
    .string()
    .required('Date of birth is required')
    .test('valid-date', 'Enter a valid date', (v) => !v || !Number.isNaN(new Date(v).getTime()))
    // Compare YYYY-MM-DD strings in local time; new Date('YYYY-MM-DD') would be UTC midnight
    .test('not-future', 'Date of birth cannot be in the future', (v) => !v || v <= localTodayYMD()),
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .email('Enter a valid email address (e.g. name@example.com)'),
  phone: yup
    .string()
    .required('Contact number is required')
    .matches(/^\d{10}$/, 'Contact number must be exactly 10 digits')
    .matches(/^[6-9]/, 'Enter a valid Indian mobile number (starts with 6–9)'),
  state: yup.string().required('Please select your state'),
  cityDistrict: yup.string().required('Please select your city / district'),
  pincode: yup
    .string()
    .required('PIN code is required')
    .matches(/^[1-9]\d{5}$/, 'PIN code must be 6 digits and cannot start with 0'),
  position: yup.string().required('Please select your player type'),
  school_name: yup
    .string()
    .trim()
    .required('School / college name is required')
    .min(3, 'School / college name must be at least 3 characters'),
});

export type IndividualRegistrationField = keyof yup.InferType<typeof individualRegistrationSchema>;

export const INDIVIDUAL_REGISTRATION_FIELDS = Object.keys(
  individualRegistrationSchema.fields,
) as IndividualRegistrationField[];

/** Validates every field and returns { field: message } for the ones that fail. */
export function validateIndividualRegistration(values: Record<string, unknown>): Record<string, string> {
  try {
    individualRegistrationSchema.validateSync(values, { abortEarly: false });
    return {};
  } catch (err) {
    const errors: Record<string, string> = {};
    if (err instanceof yup.ValidationError) {
      for (const e of err.inner) {
        if (e.path && !errors[e.path]) errors[e.path] = e.message;
      }
    }
    return errors;
  }
}

/** Validates one field against the whole form; returns its message, or '' when valid. */
export function validateIndividualField(field: IndividualRegistrationField, values: Record<string, unknown>): string {
  try {
    individualRegistrationSchema.validateSyncAt(field, values);
    return '';
  } catch (err) {
    return err instanceof yup.ValidationError ? err.message : '';
  }
}
