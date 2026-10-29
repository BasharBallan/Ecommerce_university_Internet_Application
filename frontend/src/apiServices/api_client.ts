import axios, { type AxiosRequestConfig } from "axios";
import { getToken } from "./cookie";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

class ApiClient<TResponse, TRequest = unknown> {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll(config?: AxiosRequestConfig): Promise<TResponse> {
    const res = await axiosInstance.get<TResponse>(
      this.endpoint,
      config
    );
    return res.data;
  }

  async get(
    id: string | number,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    const res = await axiosInstance.get<TResponse>(
      `${this.endpoint}/${id}`,
      config
    );
    return res.data;
  }

  async post(data: TRequest, customPath?: string): Promise<TResponse> {
    const targetUrl = customPath ? `${this.endpoint}/${customPath}` : this.endpoint;
    const isFormData = data instanceof FormData;
    const res = await axiosInstance.post<TResponse>(
      targetUrl,
      data,
      isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    );
    return res.data;
  }

  async update(
    id: string | number,
    data: Partial<TRequest>
  ): Promise<TResponse> {
    const isFormData = data instanceof FormData;
    const res = await axiosInstance.put<TResponse>(
      `${this.endpoint}/${id}`,
      data,
      isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    );
    return res.data;
  }

  async postAction(): Promise<TResponse> {
    const res = await axiosInstance.post<TResponse>(
      this.endpoint
    );
    return res.data;
  }

  async delete(id: string | number): Promise<TResponse> {
    const res = await axiosInstance.delete<TResponse>(
      `${this.endpoint}/${id}`
    );
    return res.data;
  }

  async patch(
    path: string | number,
    data: Partial<TRequest>
  ): Promise<TResponse> {
    const res = await axiosInstance.patch<TResponse>(
      `${this.endpoint}/${path}`,
      data
    );
    return res.data;
  }
}

export default ApiClient;
