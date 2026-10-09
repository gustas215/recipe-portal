const ApiError = require('../utils/ApiError');

// Atsako į klausimą "ar tavo rolė tinka?". Naudoti tik po authenticate.
// Pavyzdys: router.post('/', authenticate, authorize('admin'), controller.create)
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Neturite teisių atlikti šio veiksmo');
    }
    next();
  };
}

module.exports = authorize;