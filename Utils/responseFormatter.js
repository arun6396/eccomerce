// /Utils/responseFormatter.js

const responseFormatter = (data = {}, code = 200, message = null, token = null) => {
  return {
    session: {
      token: token,
      validity: token ? 3600 : 0,
      specialMessage: null,
    },
    data: data,
    status: {
      code: code,
      status: code >= 400 ? "Error" : "Success",
      message: message || (code === 200 ? "Request successful" : "An error occurred"),
    },
  };
};

module.exports = responseFormatter;
