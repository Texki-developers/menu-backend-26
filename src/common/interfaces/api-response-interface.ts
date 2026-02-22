export interface ApiResponse<T> {
    success: boolean;
    message?: string | string[];
    data: T;
    meta?: {
      timestamp: string;
      [key: string]: any;
    };
  }
  