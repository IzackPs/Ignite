import { describe, it, expect } from 'vitest';
import { fundamentalistService } from '../src/lib/services/fundamentalist.service';

describe('Fundamentalist Service', () => {
  it('deve buscar métricas fundamentalistas e gerar sugestões de checklist', async () => {
    const data = await fundamentalistService.getFundamentalistMetrics('WEGE3');
    expect(data).toBeDefined();
    expect(data.simbolo).toBe('WEGE3');
    expect(data.suggestedAnswers).toBeDefined();
  });
});
