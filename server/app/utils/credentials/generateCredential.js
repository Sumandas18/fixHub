const generatecontactId = (length = 10) => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz0123456789@#$';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

module.exports = { generatecontactId };