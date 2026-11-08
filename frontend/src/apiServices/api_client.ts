import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { getToken } from "./cookie";

export const NODE_BASE_URL = "http://localhost:8000/api/v1";
export const LARAVEL_BASE_URL = "http://localhost:8001/api";

const createInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
  });

  instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};

// Node.js backend instance (Auth, Orders, Health)
export const nodeAxiosInstance = createInstance(NODE_BASE_URL);

// Laravel backend instance (Products CRUD, Inventory)
export const laravelAxiosInstance = createInstance(LARAVEL_BASE_URL);

// Default backwards-compatible axiosInstance
export const axiosInstance = nodeAxiosInstance;

class ApiClient<TResponse, TRequest = unknown> {
  endpoint: string;
  private client: AxiosInstance;

  constructor(endpoint: string, explicitClient?: AxiosInstance) {
    this.endpoint = endpoint;
    if (explicitClient) {
      this.client = explicitClient;
    } else if (endpoint.startsWith("/products") || endpoint.startsWith("products")) {
      // Products are managed by Laravel service on port 8001
      this.client = laravelAxiosInstance;
    } else {
      // Auth, Orders, etc. are managed by Node.js service on port 8000
      this.client = nodeAxiosInstance;
    }
  }

  async getAll(config?: AxiosRequestConfig): Promise<TResponse> {
    const res = await this.client.get<TResponse>(this.endpoint, config);
    return res.data;
  }

  async get(id: string | number, config?: AxiosRequestConfig): Promise<TResponse> {
    const res = await this.client.get<TResponse>(`${this.endpoint}/${id}`, config);
    return res.data;
  }

  async post(data: TRequest, customPath?: string): Promise<TResponse> {
    const targetUrl = customPath ? `${this.endpoint}/${customPath}` : this.endpoint;
    const isFormData = data instanceof FormData;
    const res = await this.client.post<TResponse>(
      targetUrl,
      data,
      isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    );
    return res.data;
  }

  async update(id: string | number, data: Partial<TRequest>): Promise<TResponse> {
    const isFormData = data instanceof FormData;
    const targetUrl = id ? `${this.endpoint}/${id}` : this.endpoint;
    const res = await this.client.put<TResponse>(
      targetUrl,
      data,
      isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    );
    return res.data;
  }

  async put(data: Partial<TRequest>, customPath?: string): Promise<TResponse> {
    const targetUrl = customPath ? `${this.endpoint}/${customPath}` : this.endpoint;
    const isFormData = data instanceof FormData;
    const res = await this.client.put<TResponse>(
      targetUrl,
      data,
      isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    );
    return res.data;
  }

  async postAction(): Promise<TResponse> {
    const res = await this.client.post<TResponse>(this.endpoint);
    return res.data;
  }

  async delete(id: string | number): Promise<TResponse> {
    const res = await this.client.delete<TResponse>(`${this.endpoint}/${id}`);
    return res.data;
  }

  async patch(path: string | number, data: Partial<TRequest>): Promise<TResponse> {
    const res = await this.client.patch<TResponse>(`${this.endpoint}/${path}`, data);
    return res.data;
  }
}

export default ApiClient;
