import { describe, expect, it } from 'vitest';
import { validateIndividualField, validateIndividualRegistration } from './playerRegistration';

const valid = {
  full_name: 'Ravi Kumar',
  date_of_birth: '2005-04-12',
  email: 'ravi@example.com',
  phone: '9876543210',
  state: 'Tamil Nadu',
  cityDistrict: 'Chennai',
  pincode: '600001',
  position: 'Batting',
  school_name: 'Anna University',
};

describe('individualRegistrationSchema', () => {
  it('accepts a complete, valid form', () => {
    expect(validateIndividualRegistration(valid)).toEqual({});
  });

  it('returns a required message for every empty field', () => {
    const empty = Object.fromEntries(Object.keys(valid).map((k) => [k, '']));
    const errors = validateIndividualRegistration(empty);
    expect(Object.keys(errors).sort()).toEqual(Object.keys(valid).sort());
    expect(errors.full_name).toBe('Full name is required');
    expect(errors.state).toBe('Please select your state');
  });

  it.each([
    ['email', 'ravi@', 'Enter a valid email address (e.g. name@example.com)'],
    ['phone', '98765', 'Contact number must be exactly 10 digits'],
    ['phone', '1234567890', 'Enter a valid Indian mobile number (starts with 6–9)'],
    ['pincode', '060001', 'PIN code must be 6 digits and cannot start with 0'],
    ['full_name', 'R2D2', 'Use letters only (spaces, . \' - allowed)'],
    ['date_of_birth', '2999-01-01', 'Date of birth cannot be in the future'],
  ] as const)('%s = %j -> %s', (field, value, message) => {
    expect(validateIndividualField(field, { ...valid, [field]: value })).toBe(message);
  });

  it('accepts names in Indian scripts', () => {
    expect(validateIndividualField('full_name', { ...valid, full_name: 'ரவி குமார்' })).toBe('');
    expect(validateIndividualField('full_name', { ...valid, full_name: 'रवि कुमार' })).toBe('');
  });
});
