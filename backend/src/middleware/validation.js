const formatDetails = (details = []) =>
  details.map((detail) => ({
    message: detail.message,
    field: Array.isArray(detail.path) ? detail.path.join('.') : String(detail.path ?? ''),
    type: detail.type
  }));

const validate = (schema, property = 'body') => (req, res, next) => {
  const target = req[property];
  const { error, value } = schema.validate(target, { abortEarly: false, stripUnknown: true });

  if (error) {
    return res.status(400).json({
      message: 'Validation failed',
      details: formatDetails(error.details),
      hint: 'Please review the highlighted fields and try again.'
    });
  }

  req[property] = value;
  next();
};

module.exports = {
  validate
};
