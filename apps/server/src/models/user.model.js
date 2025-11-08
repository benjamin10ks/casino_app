export const UserStatus = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  BANNED: "banned",
};

export function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...sanitizedUser } = user;
  return sanitizedUser;
}

export function formatUserResponse(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    balance: parseFloat(user.balance),
    isGuest: user.is_guest,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}
