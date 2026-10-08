// Klaida su HTTP statuso kodu.
// Naudojimas kontroleriuose: throw new ApiError(404, 'Kategorija nerasta');
class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

module.exports = ApiError;