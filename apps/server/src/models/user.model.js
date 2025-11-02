export const UserStatus = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  BANNED: "banned",
};

export function sanaitizeUser(user) {
  if (!user) return null;

  const { passwordHash, ...sanitizedUser } = user;
  return sanitizedUser;
}

export function formatUserResponse(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    balance: parseFloat(user.balance),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
