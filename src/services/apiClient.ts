/**
 * Centralized API Client & Safe Request Helper
 * Guarantees safe parsing, informative errors, and prevents "Unexpected token 'T'" crashes.
 */
import { getApiEndpoint } from '../config/api';

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
  message?: string;
}

export interface ApiRequestOptions extends RequestInit {
  token?: string | null;
}

/**
 * Perform a safe API request with automatic header injection and safe JSON/text parsing.
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const fullUrl = getApiEndpoint(endpoint);
  const { token, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers || {});

  // Add JSON Content-Type if sending a body and not already specified
  if (
    fetchOptions.body &&
    typeof fetchOptions.body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject Bearer token if provided or from localStorage
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else if (!headers.has('Authorization')) {
    try {
      const storedToken = localStorage.getItem('TUITION_AUTH_TOKEN_V2');
      if (storedToken) {
        headers.set('Authorization', `Bearer ${storedToken}`);
      }
    } catch {
      // Ignore localStorage access restrictions
    }
  }

  try {
    const res = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    const rawText = await res.text();

    let parsedJson: any = null;
    let isJson = false;

    // Check if response looks like JSON
    if (
      contentType.includes('application/json') ||
      rawText.trim().startsWith('{') ||
      rawText.trim().startsWith('[')
    ) {
      try {
        parsedJson = JSON.parse(rawText);
        isJson = true;
      } catch {
        isJson = false;
      }
    }

    if (!res.ok) {
      let errorMessage = 'Yêu cầu không thành công.';

      if (isJson && parsedJson) {
        errorMessage = parsedJson.error || parsedJson.message || errorMessage;
      } else if (res.status === 404) {
        errorMessage =
          'Không thể kết nối đến máy chủ API (404 Not Found). Vui lòng kiểm tra máy chủ API hoặc cấu hình triển khai.';
      } else if (res.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn hoặc chưa được xác thực.';
      } else if (res.status === 403) {
        errorMessage = parsedJson?.error || 'Bạn không có quyền thực hiện thao tác này.';
      } else if (res.status === 429) {
        errorMessage = parsedJson?.error || 'Bạn thao tác quá nhanh. Vui lòng đợi trong giây lát.';
      } else if (res.status >= 500) {
        errorMessage = `Máy chủ gặp sự cố (Mã lỗi ${res.status}). Vui lòng thử lại sau.`;
      } else if (rawText && rawText.length < 150 && !rawText.includes('<html')) {
        errorMessage = rawText.trim();
      }

      if (import.meta.env.DEV) {
        console.warn(`[API ${res.status}] ${fullUrl}:`, errorMessage);
      }

      return {
        ok: false,
        status: res.status,
        data: parsedJson,
        error: errorMessage,
        message: parsedJson?.message,
      };
    }

    return {
      ok: true,
      status: res.status,
      data: isJson ? parsedJson : (rawText as any),
      message: parsedJson?.message,
    };
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.error(`[API Network Error] ${fullUrl}:`, err);
    }
    return {
      ok: false,
      status: 0,
      data: null,
      error:
        'Không thể kết nối đến máy chủ. Vui lòng kiểm tra máy chủ API hoặc cấu hình triển khai.',
    };
  }
}
