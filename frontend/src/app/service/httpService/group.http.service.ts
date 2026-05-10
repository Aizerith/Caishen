import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import GroupInfoRequest = CaiShen.GroupInfoRequest;
import UserGroupResponse = CaiShen.UserGroupResponse;
import GroupResponse = CaiShen.GroupResponse;
import ExpenseRequest = CaiShen.ExpenseRequest;
import ExpenseInfoResponse = CaiShen.ExpenseInfoResponse;

@Injectable({
  providedIn: 'root',
})
export class GroupHttpService {
  baseUrl: string = environment.API_URL;

  constructor(private http: HttpClient) {}

  addGroup(data: GroupInfoRequest) {
    return this.http.post<UserGroupResponse>(`${this.baseUrl}/group/new`, data);
  }

  getGroupInfo(id: number) {
    return this.http.get<GroupResponse>(`${this.baseUrl}/group?id=${id}`);
  }

  addExpense(data: ExpenseRequest) {
    return this.http.post<GroupResponse>(`${this.baseUrl}/group/expenses`, data);
  }

  getExpenseInfoById(id: number) {
    return this.http.get<ExpenseInfoResponse>(`${this.baseUrl}/group/expenses/${id}`);
  }
}
