import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrivateMessageService {

  constructor(
    private http: HttpClient
  ) {}

  //Store Private Message
  storePrivateMessage(userid:any, chatterid:any){
    
  }
  //Retrieve Private Message
  retrievePrivateMessage(userid:any, chatterid:any){
    
  }
}
