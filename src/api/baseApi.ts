import axios, { AxiosInstance } from "axios";

export class BaseApi {
  protected axios: AxiosInstance;

  constructor(baseUrl: string) {
    this.axios = axios.create({
      baseURL: baseUrl, timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

}  