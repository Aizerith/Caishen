import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import GroupInfoRequest = CaiShen.GroupInfoRequest;

@Injectable({
  providedIn: 'root',
})
export class TestHttpService {
  baseUrl: string = environment.API_URL;

  constructor(private http: HttpClient) {}

  getHello() {
    return this.http.get<string>(`${this.baseUrl}/test/hello`, { responseType: 'text' as 'json' });
  }

  addGroup() {
    const data: GroupInfoRequest = {
      title: 'groupe de teste',
      members: [1],
    };
    return this.http.post<void>(`${this.baseUrl}/group/new`, data);
  }
}
