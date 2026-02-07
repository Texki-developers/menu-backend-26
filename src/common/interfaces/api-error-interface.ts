export interface ApiErrorResponse {
    success: false;
    message: string | string[];
    error: {
      code: number;
      details?: any;
    };
    meta: {
      timestamp: string;
      path: string;
    };
  }
  