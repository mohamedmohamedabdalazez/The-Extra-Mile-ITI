import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { nanoid } from 'nanoid';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl + 'chat/';
  private sessionIdKey = 'chat_session_id';

  getSessionId(): string {
    let id = localStorage.getItem(this.sessionIdKey);
    if (!id) {
      id = nanoid(16);
      localStorage.setItem(this.sessionIdKey, id);
    }
    return id;
  }

  ask(question: string) {
    const headers = new HttpHeaders({ 'X-Session-Id': this.getSessionId() });
    return this.http.post<{ answer: string }>(this.baseUrl + 'ask', { question }, { headers }).toPromise();
  }
}


