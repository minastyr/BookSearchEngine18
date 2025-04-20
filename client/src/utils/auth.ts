//import decode from 'jwt-decode';
import { jwtDecode } from "jwt-decode";

class AuthService {
  // Get token from localStorage
  getToken() {
    return localStorage.getItem('id_token');
  }

  // Decode token and check if expired
  isTokenExpired(token: string) {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      return true;
    }
  }

  // Check if user is logged in
  loggedIn() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  // Save token to localStorage
  login(idToken: string) {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/');
  }

  // Remove token from localStorage
  logout() {
    localStorage.removeItem('id_token');
    window.location.assign('/');
  }
}

export default new AuthService();
