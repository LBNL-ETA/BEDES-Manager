import { AuthService } from "./auth.service";

export function authLoggedInFactory(authService: AuthService) {
    return () => authService.checkLoginStatusPromise();
  }
