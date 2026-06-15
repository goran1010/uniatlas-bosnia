function sanitizeUser(user) {
  if (!user) {
    return user;
  }

  // eslint-disable-next-line no-unused-vars
  const { password, id, githubId, ...safeUser } = user;
  return safeUser;
}

function sanitizeUsers(users = []) {
  return users.map((user) => sanitizeUser(user));
}

export { sanitizeUser, sanitizeUsers };
