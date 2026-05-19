/* tslint:disable */
/* eslint-disable */

declare namespace CaiShen {

    interface AccountActivationRequest {
        email: string;
    }

    interface ErrorResponse {
        code: string[];
        date: Date;
        message: string;
        status: HttpStatus;
    }

    interface ExpenseHistoryChangeResponse {
        afterValue: string;
        beforeValue: string;
        field: string;
    }

    interface ExpenseHistoryResponse {
        action: ExpenseHistoryAction;
        actorId: number;
        actorName: string;
        amount: number | null;
        changes: ExpenseHistoryChangeResponse[];
        createdAt: Date;
        expenseId: number | null;
        expenseTitle: string | null;
        groupId: number;
        id: number;
    }

    interface ExpenseInfoResponse {
        amount: number;
        expenseDate: Date;
        id: number;
        participantDTOList: ParticipantDTO[];
        payerName: string;
        title: string;
    }

    interface ExpenseRequest {
        amount: number;
        expenseDate: Date;
        groupId: number;
        participant: string;
        payerId: number;
        title: string;
    }

    interface ExpenseResponse {
        amount: number;
        expenseDate: Date;
        id: number;
        participant: string;
        payerName: string;
        title: string;
    }

    interface GroupInfoRequest {
        members: number[];
        title: string;
    }

    interface GroupMemberResponse {
        expenseDelta: number;
        id: number;
        name: string;
    }

    interface GroupResponse {
        expenseList: ExpenseResponse[];
        id: number;
        memberList: GroupMemberResponse[];
        settlementList: SettlementResponse[];
        title: string;
        uuid: string;
    }

    interface HelloWorldDTO {
        hello: string;
    }

    interface LoginRequest {
        email: string;
        password: string;
    }

    interface LoginResponse {
        refreshToken: string;
        token: string;
    }

    interface ParticipantDTO {
        amount: number;
        username: string;
    }

    interface PasswordResetConfirmRequest {
        password: string;
        token: string;
    }

    interface PasswordResetRequest {
        email: string;
    }

    interface ProfileInfoResponse {
        id: number;
        name: string;
        userGroups: UserGroupResponse[];
    }

    interface PushPublicKeyResponse {
        enabled: boolean;
        publicKey: string;
    }

    interface PushSubscriptionRequest {
        auth: string;
        endpoint: string;
        p256dh: string;
    }

    interface PushUnsubscribeRequest {
        endpoint: string;
    }

    interface RegisterRequest {
        email: string;
        password: string;
        username: string;
    }

    interface SettlementPaymentRequest {
        amount: number;
        groupId: number;
        receiverId: number;
    }

    interface SettlementResponse {
        amount: number;
        creditorId: number;
        creditorName: string;
        debtorId: number;
        debtorName: string;
    }

    interface UserGroupResponse {
        id: number;
        title: string;
    }

    type ExpenseHistoryAction = "CREATED" | "UPDATED" | "DELETED" | "MEMBER_JOINED" | "SETTLEMENT_PAID";

    /**
     * Values:
     * - `CONTINUE`
     * - `SWITCHING_PROTOCOLS`
     * - `PROCESSING` - @deprecated since 7.0
     * - `EARLY_HINTS`
     * - `OK`
     * - `CREATED`
     * - `ACCEPTED`
     * - `NON_AUTHORITATIVE_INFORMATION`
     * - `NO_CONTENT`
     * - `RESET_CONTENT`
     * - `PARTIAL_CONTENT`
     * - `MULTI_STATUS`
     * - `ALREADY_REPORTED`
     * - `IM_USED`
     * - `MULTIPLE_CHOICES`
     * - `MOVED_PERMANENTLY`
     * - `FOUND`
     * - `SEE_OTHER`
     * - `NOT_MODIFIED`
     * - `TEMPORARY_REDIRECT`
     * - `PERMANENT_REDIRECT`
     * - `BAD_REQUEST`
     * - `UNAUTHORIZED`
     * - `PAYMENT_REQUIRED`
     * - `FORBIDDEN`
     * - `NOT_FOUND`
     * - `METHOD_NOT_ALLOWED`
     * - `NOT_ACCEPTABLE`
     * - `PROXY_AUTHENTICATION_REQUIRED`
     * - `REQUEST_TIMEOUT`
     * - `CONFLICT`
     * - `GONE`
     * - `LENGTH_REQUIRED`
     * - `PRECONDITION_FAILED`
     * - `CONTENT_TOO_LARGE`
     * - `PAYLOAD_TOO_LARGE` - @deprecated since 7.0
     * - `URI_TOO_LONG`
     * - `UNSUPPORTED_MEDIA_TYPE`
     * - `REQUESTED_RANGE_NOT_SATISFIABLE`
     * - `EXPECTATION_FAILED`
     * - `I_AM_A_TEAPOT` - @deprecated since 7.0
     * - `MISDIRECTED_REQUEST`
     * - `UNPROCESSABLE_CONTENT`
     * - `UNPROCESSABLE_ENTITY` - @deprecated since 7.0
     * - `LOCKED`
     * - `FAILED_DEPENDENCY`
     * - `TOO_EARLY`
     * - `UPGRADE_REQUIRED`
     * - `PRECONDITION_REQUIRED`
     * - `TOO_MANY_REQUESTS`
     * - `REQUEST_HEADER_FIELDS_TOO_LARGE`
     * - `UNAVAILABLE_FOR_LEGAL_REASONS`
     * - `INTERNAL_SERVER_ERROR`
     * - `NOT_IMPLEMENTED`
     * - `BAD_GATEWAY`
     * - `SERVICE_UNAVAILABLE`
     * - `GATEWAY_TIMEOUT`
     * - `HTTP_VERSION_NOT_SUPPORTED`
     * - `VARIANT_ALSO_NEGOTIATES`
     * - `INSUFFICIENT_STORAGE`
     * - `LOOP_DETECTED`
     * - `BANDWIDTH_LIMIT_EXCEEDED` - @deprecated since 7.0
     * - `NOT_EXTENDED` - @deprecated since 7.0
     * - `NETWORK_AUTHENTICATION_REQUIRED`
     */
    type HttpStatus = "CONTINUE" | "SWITCHING_PROTOCOLS" | "PROCESSING" | "EARLY_HINTS" | "OK" | "CREATED" | "ACCEPTED" | "NON_AUTHORITATIVE_INFORMATION" | "NO_CONTENT" | "RESET_CONTENT" | "PARTIAL_CONTENT" | "MULTI_STATUS" | "ALREADY_REPORTED" | "IM_USED" | "MULTIPLE_CHOICES" | "MOVED_PERMANENTLY" | "FOUND" | "SEE_OTHER" | "NOT_MODIFIED" | "TEMPORARY_REDIRECT" | "PERMANENT_REDIRECT" | "BAD_REQUEST" | "UNAUTHORIZED" | "PAYMENT_REQUIRED" | "FORBIDDEN" | "NOT_FOUND" | "METHOD_NOT_ALLOWED" | "NOT_ACCEPTABLE" | "PROXY_AUTHENTICATION_REQUIRED" | "REQUEST_TIMEOUT" | "CONFLICT" | "GONE" | "LENGTH_REQUIRED" | "PRECONDITION_FAILED" | "CONTENT_TOO_LARGE" | "PAYLOAD_TOO_LARGE" | "URI_TOO_LONG" | "UNSUPPORTED_MEDIA_TYPE" | "REQUESTED_RANGE_NOT_SATISFIABLE" | "EXPECTATION_FAILED" | "I_AM_A_TEAPOT" | "MISDIRECTED_REQUEST" | "UNPROCESSABLE_CONTENT" | "UNPROCESSABLE_ENTITY" | "LOCKED" | "FAILED_DEPENDENCY" | "TOO_EARLY" | "UPGRADE_REQUIRED" | "PRECONDITION_REQUIRED" | "TOO_MANY_REQUESTS" | "REQUEST_HEADER_FIELDS_TOO_LARGE" | "UNAVAILABLE_FOR_LEGAL_REASONS" | "INTERNAL_SERVER_ERROR" | "NOT_IMPLEMENTED" | "BAD_GATEWAY" | "SERVICE_UNAVAILABLE" | "GATEWAY_TIMEOUT" | "HTTP_VERSION_NOT_SUPPORTED" | "VARIANT_ALSO_NEGOTIATES" | "INSUFFICIENT_STORAGE" | "LOOP_DETECTED" | "BANDWIDTH_LIMIT_EXCEEDED" | "NOT_EXTENDED" | "NETWORK_AUTHENTICATION_REQUIRED";

}
