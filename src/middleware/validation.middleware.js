const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    // Safely handle cases where error.errors might be undefined
    const errors = error.errors?.map(err => ({
      field: err.path.join("."),
      message: err.message,
    })) || [{ message: error.message }];

    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }
};
export default validate;
