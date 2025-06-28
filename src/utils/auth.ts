export function setSession(user: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
}

export function getSession() {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
}

export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
}
