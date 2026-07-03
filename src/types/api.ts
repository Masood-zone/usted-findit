export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiSuccessBody<TData> = {
  success: true;
  data: TData;
};

export type ApiResponseBody<TData> = ApiSuccessBody<TData> | ApiErrorBody;
