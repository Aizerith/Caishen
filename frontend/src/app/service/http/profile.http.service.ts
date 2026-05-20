import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import ProfileInfoResponse = CaiShen.ProfileInfoResponse;
import UserGroupResponse = CaiShen.UserGroupResponse;

@Injectable({
  providedIn: 'root',
})
export class ProfileHttpService {
  baseUrl: string = environment.API_URL;

  constructor(private http: HttpClient) {}

  public getProfileInfo() {
    return this.http.get<ProfileInfoResponse>(`${this.baseUrl}/profile`);
  }

  public joinGroup(uuid: String) {
    return this.http.post<UserGroupResponse>(`${this.baseUrl}/group/join/${uuid}`, {});
  }
}
