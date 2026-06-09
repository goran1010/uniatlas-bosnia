function sendSuccess(res, { status = 200, data = null, message = null } = {}) {
  return res.status(status).json({ data, message });
}

function sendError(res, { status = 400, message = "Request failed." } = {}) {
  return res.status(status).json({
    error: {
      message,
    },
  });
}

export { sendSuccess, sendError };
