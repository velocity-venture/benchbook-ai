import { describe, it, expect } from 'vitest';
import { classifyQueryComplexity } from '../lib/query-router';

describe('classifyQueryComplexity', () => {
  // Existing categories (sanity checks)
  it('routes sentencing queries to Sonnet', () => {
    expect(classifyQueryComplexity('What are the sentencing guidelines for Class A misdemeanors?')).toBe('complex');
  });

  it('routes juvenile queries to Sonnet', () => {
    expect(classifyQueryComplexity('What are the juvenile detention criteria?')).toBe('complex');
  });

  it('routes DCS queries to Sonnet', () => {
    expect(classifyQueryComplexity('What does DCS require for removal?')).toBe('complex');
  });

  // NEW: Custody
  it('routes custody queries to Sonnet', () => {
    expect(classifyQueryComplexity('How is custody determined in Tennessee?')).toBe('complex');
    expect(classifyQueryComplexity('What factors apply to custodial arrangements?')).toBe('complex');
    expect(classifyQueryComplexity('Parenting time modification')).toBe('complex');
    expect(classifyQueryComplexity('How do I modify a parenting plan?')).toBe('complex');
    expect(classifyQueryComplexity('Who is the residential parent?')).toBe('complex');
  });

  // NEW: Bail
  it('routes bail queries to Sonnet', () => {
    expect(classifyQueryComplexity('What is the bail schedule for assault?')).toBe('complex');
    expect(classifyQueryComplexity('Can I revoke bail in this case?')).toBe('complex');
    expect(classifyQueryComplexity('Bail hearing requirements')).toBe('complex');
  });

  // NEW: Contempt
  it('routes contempt queries to Sonnet', () => {
    expect(classifyQueryComplexity('What are the elements of contempt of court?')).toBe('complex');
    expect(classifyQueryComplexity('How do I handle willful contempt?')).toBe('complex');
    expect(classifyQueryComplexity('Civil contempt vs criminal contempt')).toBe('complex');
    expect(classifyQueryComplexity('Can I hold this party in contempt?')).toBe('complex');
  });

  // NEW: Mental health commitments
  it('routes mental health commitment queries to Sonnet', () => {
    expect(classifyQueryComplexity('What is the process for mental health commitment?')).toBe('complex');
    expect(classifyQueryComplexity('Judicial commitment procedures in Tennessee')).toBe('complex');
    expect(classifyQueryComplexity('What does Title 33 say about involuntary commitment?')).toBe('complex');
  });

  // Simple queries should still route to Haiku
  it('routes simple statute lookups to Haiku', () => {
    expect(classifyQueryComplexity('What is the statute for theft?')).toBe('simple');
    expect(classifyQueryComplexity('Define delinquent child')).toBe('simple');
  });
});
