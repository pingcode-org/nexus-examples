import { api } from '@pc-nexus/bridge';

export interface NamedItem {
  id: string;
  name: string;
}

interface ListResponse {
  values?: Array<{ id?: string; name?: string }>;
}

export async function listNamed(path: string): Promise<NamedItem[]> {
  const query = new URLSearchParams({
    page_size: '100',
    page_index: '0',
  });
  const response = await api.invoke(`${path}?${query.toString()}`);
  if (!response.ok) {
    return [];
  }
  const body = (await response.json()) as ListResponse;
  const values = Array.isArray(body.values) ? body.values : [];
  return values
    .filter((value): value is { id: string; name?: string } => typeof value?.id === 'string')
    .map((value) => ({
      id: value.id,
      name: typeof value.name === 'string' && value.name ? value.name : value.id,
    }));
}
