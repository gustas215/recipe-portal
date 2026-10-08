const ApiError = require('../utils/ApiError');

// Patikrina užklausos kūną pagal zod schemą. Netinkami laukai -> 422.
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ApiError(422, 'Neteisingi duomenys', details));
    }

    // Toliau kontroleris gauna jau išvalytus duomenis (nežinomi laukai pašalinti)
    req.body = result.data;
    next();
  };
}

module.exports = validate;