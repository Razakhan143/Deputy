export class DeputySearchProvider {
  private apiKey: string;
  private trialToken?: string;
  public quotaExhausted: boolean = false;
  private static readonly REQUEST_TIMEOUT_MS = 10_000;

  constructor(apiKey: string, trialToken?: string) {
    this.apiKey = apiKey;
    this.trialToken = trialToken;
  }

  public async search(query: string): Promise<Array<{ title: string; url: string; snippet: string }>> {
    const safeQuery = String(query || '').trim();
    if (!safeQuery) return [];

    this.quotaExhausted = false;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey === '__trial__' && this.trialToken) {
      headers['x-trial-token'] = this.trialToken;
    } else {
      headers['x-deputy-key'] = this.apiKey;
    }

    try {
      const response = await fetch('https://api.deputy.software/v1/search', {
        method: 'POST',
        signal: AbortSignal.timeout(DeputySearchProvider.REQUEST_TIMEOUT_MS),
        headers,
        body: JSON.stringify({ query: safeQuery, max_results: 5 }),
      });

      if (response.status === 429) {
        this.quotaExhausted = true;
        return [];
      }

      if (!response.ok) {
        return [];
      }

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      const results = Array.isArray(data?.results) ? data.results : [];
      return results.map((r: any) => ({
        title: String(r?.title ?? 'Untitled'),
        url: String(r?.url ?? ''),
        snippet: String(r?.content ?? r?.snippet ?? '').slice(0, 1200),
      }));
    } catch {
      return [];
    }
  }
}
