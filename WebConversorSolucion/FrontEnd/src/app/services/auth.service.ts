import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {jwtDecode, JwtPayload} from 'jwt-decode';
import {environment} from "../environments/environment";
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
   // private apiUrl = 'http://localhost:25850/api/user';  // URL de la API backend

   private apiUrl = environment.apiUrl;  // API/User
  //private apiUrl=environment.apiUrl;
  private apiUrl2=environment.apiUrl2; // API/History

  private apiEmail=environment.apiUrl5; // API/Email


  // variable que indica si el usuario está logueado o no
  logged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.UserIsLogged());

   historySubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
   historyData$ = this.historySubject.asObservable(); // Exponemos el observable para que otros se suscriban

  photoSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  //  photoSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
   photoData$ = this.photoSubject.asObservable();
  constructor(private http: HttpClient) {
    this.logged.next(this.UserIsLogged());
  }

  UserIsLogged():boolean{
    this.isTokenExpired();
    return !!localStorage.getItem('accessToken');
  }

  //metodo para iniciar sesión
  login(email: string, password: string): Observable<any> {
    const body = { "email": email, "password": password };
    return this.http.post<any>(`${this.apiUrl}/Login`, body).pipe(
      tap((response) => {
        if (response && response.token) {
          this.storeToken(response.token);
          this.fetchUserData(); // Carga los datos del usuario actual
        }
      })
    );
  }
  fetchUserData() {
    this.getUserData().subscribe((data: any) => {
      this.photoSubject.next(data.img); // Actualiza la foto
    });
  }

  updateHistory(historyData: any[]) {
    this.historySubject.next(historyData); // Emite el nuevo estado del historial
  }
  fetchAndUpdateHistory(email: string) {
    this.viewHistory(email).subscribe((data) => {
      this.updateHistory(data); // Actualiza el BehaviorSubject
    });
  }


  // metodo para registrar un usuario nuevo
  signIn(name:string,
         lastName:string,
         email: string,
         password: string,
         fechaNacimiento:Date,
         img:string): Observable<any> {

    const body = { name,lastName,email,fechaNacimiento,password,img };
    return this.http.post(`${this.apiUrl}/SignIn`, body);
  }

  // getUserData(email:string):Observable<any>{
  getUserData():Observable<any>{

    return this.http.get(`${this.apiUrl}/GetUserData`);
  }

  changePicture(email:string,profileImg: string):Observable<any>{

    const body = {"Email": email, "Img":profileImg };

    return this.http.post(`${this.apiUrl}/ChangeProfile`, body);
  }

  viewHistory(email: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { email }; // Este es el formato correcto, un objeto JSON con la propiedad email
    console.log("El body");
    console.log(body);
    console.log(body.email.toString());
    return this.http.post(`${this.apiUrl2}/History`, JSON.stringify(email), { headers });
  }

  register(email: string, password: string, confirmPassword: string): Observable<any> {
    const body = { email, password, confirmPassword };
    return this.http.post(`${this.apiUrl}/SignIn`, body);
  }

  decodedToken:any;

  //Guarda el token en el localstorage
  storeToken(accesToken: string): void {
    localStorage.setItem('accessToken', accesToken);
    this.logged.next(true); // Publica que el usuario está logueado
  }

  get isLogged(): Observable<boolean> {
    return this.logged.asObservable();
  }

  //Borra el token del localstorage
  deleteToken(): void {
    localStorage.removeItem('accessToken');
    this.logged.next(false); // Publica que el usuario ha cerrado sesión
  }
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return true; // Si no hay token, consideramos que está expirado
    }

    try {
      const decodedToken: any = jwtDecode(token);
      const expirationDate = decodedToken.exp * 1000; // El valor de 'exp' está en segundos, así que multiplicamos por 1000 para pasarlo a milisegundos
      const currentTime = new Date().getTime(); // Obtenemos el tiempo actual en milisegundos

      // console.log("El tiempo actual es: ",currentTime);
      // console.log("La fecha de expiración es: ",expirationDate);

      if (currentTime > expirationDate) {
        this.deleteToken(); // Si el token ha expirado, lo borramos
        return true;
      } else {
        return false;
      }

    } catch (error) {
      console.error('Error al decodificar el token', error);
      return true;
    }
  }

  getUserToken():string{
    return <string>localStorage.getItem('email');
  }
  getUserImgToken():string{
    const decodedToken=this.decodeToken(this.getAccessToken());
    return <string>localStorage.getItem('img');
  }
  DeleteUsername(): void {
    localStorage.removeItem('username');
  }
  //Comprueba si hay un token almacenado en el localstorage. Y devuelve true si lo hay.


  decodeToken(token:string):any{
    try {
      return jwtDecode(token);
    } catch (Error) {
      return null;
    }

  }
  getAccessToken():string{
    return <string>localStorage.getItem('accessToken');
  }
  getUserEmail(): string {
    const token = this.getAccessToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.email || '';
    }
    return '';
  }

}

