import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import GroupInfoRequest = CaiShen.GroupInfoRequest;
import UserGroupResponse = CaiShen.UserGroupResponse;
import GroupResponse = CaiShen.GroupResponse;
import ExpenseRequest = CaiShen.ExpenseRequest;
import ExpenseInfoResponse = CaiShen.ExpenseInfoResponse;
import ExpenseHistoryResponse = CaiShen.ExpenseHistoryResponse;
import SettlementPaymentRequest = CaiShen.SettlementPaymentRequest;
import GroupActivityResponse = CaiShen.GroupActivityResponse;

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

  updateExpense(id: number, data: ExpenseRequest) {
    return this.http.put<GroupResponse>(`${this.baseUrl}/group/expenses/${id}`, data);
  }

  deleteExpense(id: number) {
    return this.http.delete<GroupResponse>(`${this.baseUrl}/group/expenses/${id}`);
  }

  paySettlement(data: SettlementPaymentRequest) {
    return this.http.post<GroupResponse>(`${this.baseUrl}/group/settlements/pay`, data);
  }

  cancelSettlementPayment(paymentId: number) {
    return this.http.delete<GroupResponse>(`${this.baseUrl}/group/settlements/payments/${paymentId}`);
  }

  getExpenseInfoById(id: number) {
    return this.http.get<ExpenseInfoResponse>(`${this.baseUrl}/group/expenses/${id}`);
  }

  getGroupExpenseHistory(groupId: number) {
    return this.http.get<ExpenseHistoryResponse[]>(`${this.baseUrl}/group/${groupId}/expenses/history`);
  }

  getExpenseHistory(expenseId: number) {
    return this.http.get<ExpenseHistoryResponse[]>(`${this.baseUrl}/group/expenses/${expenseId}/history`);
  }

  getGroupActivity() {
    return this.http.get<GroupActivityResponse[]>(`${this.baseUrl}/group/activity`);
  }
}
