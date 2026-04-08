
function generateEmployeeId() {
  return 'EMP-' + Date.now().toString().slice(-6);
}

function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz0123456789@#$';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

module.exports = { generateEmployeeId, generatePassword };