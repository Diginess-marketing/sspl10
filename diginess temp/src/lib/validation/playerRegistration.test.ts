import { describe, expect, it } from 'vitest';
import { ageOn, isMinor, validateIndividualField, validateIndividualRegistration } from './playerRegistration';

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

describe('parent consent for players under 18', () => {
  it('works out age on a given day', () => {
    expect(ageOn('2008-10-10', '2026-10-09')).toBe(17);
    expect(ageOn('2008-10-09', '2026-10-09')).toBe(18);
    expect(isMinor('1995-01-01')).toBe(false);
  });

  it('asks for parent details only when the player is a minor', () => {
    expect(validateIndividualRegistration({ ...valid, date_of_birth: '1995-01-01' })).toEqual({});
    const errors = validateIndividualRegistration({ ...valid, date_of_birth: '2012-05-05' });
    expect(Object.keys(errors).sort()).toEqual(['parent_consent', 'parent_name', 'parent_phone']);
  });

  it('accepts a minor with a parent name, valid mobile and consent', () => {
    const minor = { ...valid, date_of_birth: '2012-05-05', parent_name: 'Kumar S', parent_phone: '9876500000', parent_consent: true };
    expect(validateIndividualRegistration(minor)).toEqual({});
    expect(validateIndividualRegistration({ ...minor, parent_phone: '12345' }).parent_phone).toMatch(/valid/);
  });
});
