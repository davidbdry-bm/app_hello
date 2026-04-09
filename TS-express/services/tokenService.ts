import { BoondManager } from '../server/boondmanager';

export class TokenService {
  private pendingRequests: Map<string, Promise<Record<string, any> | null>> = new Map();
  private bm = new BoondManager();

  async callApi(api: string, accessToken: string): Promise<Record<string, any> | null> {
    const key = `${api}:${accessToken}`;

    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const promise = this.bm
      .callApiOAuth(api, accessToken)
      .finally(() => this.pendingRequests.delete(key));

    this.pendingRequests.set(key, promise);
    return promise;
  }
}