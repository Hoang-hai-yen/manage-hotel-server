const otpMap = new Map();

module.exports = {
  set(email, data) {
    otpMap.set(email, data);
  },
  get(email) {
    return otpMap.get(email);
  },
  delete(email) {
    otpMap.delete(email);
  }
};
