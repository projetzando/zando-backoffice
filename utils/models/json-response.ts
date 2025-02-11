interface BaseResponse {
    success: boolean;
    message: string;
}

interface ErrorMessage extends BaseResponse {
    errors: string | string[]
    error: string
}

export interface JsonResponseArray<T = unknown> extends BaseResponse {
    data: T;
}

export interface JsonResponseObject extends BaseResponse {
    data: {
        user: Auth;
        token: string;
    };
}

export interface JsonResponseError {
    data: ErrorMessage;
}