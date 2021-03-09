module.exports = (validate) => (data) => {
  const valid = validate(data);
  if (valid) {
    return valid;
  } else {
    return { valid, errors: validate.errors };
  }
};
