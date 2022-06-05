
import { Injectable } from "@angular/core";
import { HttpRequest, 
  HttpResponse, 
  HttpHandler, 
  HttpEvent, 
  HttpInterceptor, 
  HTTP_INTERCEPTORS, 
  HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MockApiInterceptor implements HttpInterceptor {

  // mock api requests path
  private _mockApiPath ="http://localhost:3000/reservations";

  constructor(private http: HttpClient) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.handleRequests(request, next);
  }

  // intercept the /api route calls and use the mock api
  handleRequests(req: HttpRequest<any>, next: HttpHandler): any {
    const { url, method } = req;
    // intercept the route calls and use the mock api
    if (url.endsWith("/api/reservations") && method === "GET") {
      const newReq = req.clone({ url: this._mockApiPath });
      return next.handle(newReq).pipe(delay(300));
    }

    if (url.endsWith("/api/reservations") && method === "POST") {
      const { body } = req.clone();   
      // just to demonstrate some data manipulation
      // assign a new uuid to every reservation
      body.id = uuidv4();
      // this request will hit the server and will add id from within the interceptor
      const newReq = req.clone({ url: this._mockApiPath });
      return next.handle(newReq).pipe(delay(300));
      // end server request
      
      // this will return the body with added id property
      // and will not hit the server
      // return of(new HttpResponse({ status: 200, body })).pipe(delay(300));
    }
    // if there is not any matches return default request.
    return next.handle(req);
  }
}

export let reservationsInterceptor = {
  provide: HTTP_INTERCEPTORS,
  useClass: MockApiInterceptor,
  multi: true,
};