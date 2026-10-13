import { configuredCorsOrigins, isAllowedCorsOrigin } from './cors.js';

describe('CORS', () => {
  it.each([
    'http://localhost:4200',
    'http://127.0.0.1:4201',
    'https://localhost:4300',
    'http://[::1]:4200',
  ])('permite origem local de desenvolvimento: %s', (origin) => {
    expect(isAllowedCorsOrigin(origin, new Set())).toBe(true);
  });

  it('permite chamadas sem Origin, como proxy e health check', () => {
    expect(isAllowedCorsOrigin(undefined, new Set())).toBe(true);
  });

  it('permite somente origens externas configuradas explicitamente', () => {
    const origins = configuredCorsOrigins(
      'https://app.example.com, https://preview.example.com/',
    );

    expect(isAllowedCorsOrigin('https://app.example.com', origins)).toBe(true);
    expect(isAllowedCorsOrigin('https://preview.example.com/', origins)).toBe(
      true,
    );
    expect(isAllowedCorsOrigin('https://malicious.example.com', origins)).toBe(
      false,
    );
  });
});
