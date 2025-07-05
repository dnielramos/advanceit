// Interfaces para tipar respuestas
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  details?: string;
  status?: number;
}
