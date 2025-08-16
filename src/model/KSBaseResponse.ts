/* eslint-disable camelcase */
export interface KSBaseResponse {
    [propName: string]: any;
    result: number;
    msg?: string;
    error_msg?: string;
    error_url?: string;
}
