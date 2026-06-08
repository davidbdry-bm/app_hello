export class BoondManager {
  private baseURL: string = process.env.BOOND_API_URL ?? '';

  setBaseURL(url: string): void { this.baseURL = url; }

  async callApiOAuth(api: string, accessToken: string): Promise<Record<string, any> | null> {
    try {
      const res = await fetch(`${this.baseURL}/${api}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type':  'application/json',
          'Accept':        'application/json',
        },
      });

      console.log(`callApiOAuth [${api}] status:`, res.status);

      if (res.status === 200) return res.json() as Promise<Record<string, any>>;

      return null;
    } catch (e) {
      console.error('callApiOAuth exception:', e);
      return null;
    }
  }
}