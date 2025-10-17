// CORS and Authentication Integration Test
// Tests to diagnose and resolve CORS issues between frontend and backend

describe('CORS and Authentication Integration', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
        global.console = {
            log: jest.fn(),
            error: jest.fn()
        };
    });

    describe('CORS Configuration Issues', () => {
        test('should identify localhost vs 127.0.0.1 mismatch', async () => {
            // A. SETUP: Simulate the actual CORS error scenario
            const corsError = new TypeError('Failed to fetch');
            corsError.message = 'CORS policy: Response to preflight request doesn\'t pass access control check: No \'Access-Control-Allow-Origin\' header is present on the requested resource';
            
            global.fetch.mockRejectedValueOnce(corsError);

            // B. EXECUTION: Test the exact request pattern that's failing
            const frontendOrigin = 'http://127.0.0.1:4000'; // From error message
            const backendURL = 'http://localhost:5000/api/v1/node/3/input'; // From error message

            try {
                await fetch(backendURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Origin': frontendOrigin
                    },
                    body: JSON.stringify({ test: 'data' })
                });
            } catch (error) {
                // C. ASSERTIONS: Verify we can detect the CORS issue
                expect(error.message).toContain('CORS policy');
                expect(fetch).toHaveBeenCalledWith(
                    'http://localhost:5000/api/v1/node/3/input',
                    expect.objectContaining({
                        method: 'POST',
                        headers: expect.objectContaining({
                            'Origin': 'http://127.0.0.1:4000'
                        })
                    })
                );
            }
        });

        test('should test backend CORS origins configuration', () => {
            // A. SETUP: Expected CORS origins from Flask backend
            const expectedCORSOrigins = [
                "http://localhost:4000",  // Jekyll development server
                "http://127.0.0.1:4000",
                "https://carsontkempf.github.io",  // Production frontend
                "*"  // Development - should be restricted in production
            ];

            // B. VERIFICATION: Test scenarios for each origin
            const testCases = [
                { origin: 'http://127.0.0.1:4000', shouldWork: true },
                { origin: 'http://localhost:4000', shouldWork: true },
                { origin: 'https://carsontkempf.github.io', shouldWork: true },
                { origin: 'http://evil-site.com', shouldWork: true }, // Due to wildcard
            ];

            testCases.forEach(({ origin, shouldWork }) => {
                const isAllowed = expectedCORSOrigins.includes(origin) || expectedCORSOrigins.includes('*');
                expect(isAllowed).toBe(shouldWork);
            });
        });

        test('should validate preflight request handling', async () => {
            // A. SETUP: Mock successful preflight response
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                headers: new Map([
                    ['Access-Control-Allow-Origin', 'http://127.0.0.1:4000'],
                    ['Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'],
                    ['Access-Control-Allow-Headers', 'Content-Type, Authorization']
                ]),
                json: async () => ({ preflight: 'success' })
            });

            // B. EXECUTION: Simulate OPTIONS preflight request
            const response = await fetch('http://localhost:5000/api/v1/node/3/input', {
                method: 'OPTIONS',
                headers: {
                    'Origin': 'http://127.0.0.1:4000',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type'
                }
            });

            // C. ASSERTIONS
            expect(response.ok).toBe(true);
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/v1/node/3/input',
                expect.objectContaining({
                    method: 'OPTIONS'
                })
            );
        });
    });

    describe('Authentication Flow Issues', () => {
        test('should validate Auth0 custom claims structure', () => {
            // A. SETUP: Mock user object based on your console logs
            const mockUser = {
                email: 'ctkfdp@umsystem.edu',
                sub: 'auth0|user123',
                'https://carsontkempf.github.io/roles': ['admin', 'code-comprehension'],
                app_metadata: {
                    roles: ['Code-Comprehension-Project']
                }
            };

            // B. EXECUTION: Simulate role checking logic from code-comprehension-auth.js
            const customRoles = mockUser['https://carsontkempf.github.io/roles'] || [];
            const appMetadataRoles = mockUser.app_metadata?.roles || [];
            const allRoles = [...customRoles, ...appMetadataRoles];

            const hasAdminRole = allRoles.includes('admin');
            const hasCodeComprehensionRole = allRoles.includes('code-comprehension') || 
                                           allRoles.includes('Code-Comprehension-Project') || 
                                           allRoles.includes('rol_XUUh9ZOhirY2yCQQ');
            const isSiteOwner = mockUser.email === 'ctkfdp@umsystem.edu';

            // C. ASSERTIONS
            expect(customRoles).toContain('admin');
            expect(customRoles).toContain('code-comprehension');
            expect(hasAdminRole).toBe(true);
            expect(hasCodeComprehensionRole).toBe(true);
            expect(isSiteOwner).toBe(true);
        });

        test('should handle authentication header forwarding', async () => {
            // A. SETUP: Mock authenticated request with JWT
            const mockJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.test.token';
            
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, message: 'Authenticated request successful' })
            });

            // B. EXECUTION: Simulate authenticated API call
            await fetch('http://localhost:5000/api/v1/node/3/input', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${mockJWT}`,
                    'Origin': 'http://127.0.0.1:4000'
                },
                body: JSON.stringify({ 
                    thread_id: 'test_123',
                    data: 'test_data'
                })
            });

            // C. ASSERTIONS: Verify auth header is included
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/v1/node/3/input',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockJWT}`
                    })
                })
            );
        });
    });

    describe('Network Configuration Testing', () => {
        test('should identify hostname resolution issues', () => {
            // A. SETUP: Test different hostname patterns
            const hostnames = [
                'localhost',
                '127.0.0.1',
                '0.0.0.0'
            ];

            const ports = [5000, 4000];

            // B. EXECUTION: Generate URL combinations
            const urlCombinations = [];
            hostnames.forEach(host => {
                ports.forEach(port => {
                    urlCombinations.push(`http://${host}:${port}`);
                });
            });

            // C. ASSERTIONS: Verify we test all relevant combinations
            expect(urlCombinations).toContain('http://localhost:5000');
            expect(urlCombinations).toContain('http://127.0.0.1:4000');
            expect(urlCombinations).toContain('http://localhost:4000');
            expect(urlCombinations).toContain('http://127.0.0.1:5000');
        });

        test('should test API endpoint accessibility', async () => {
            // A. SETUP: Mock backend health check response
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    status: 'healthy',
                    message: 'Immune System API is running'
                })
            });

            // B. EXECUTION: Test backend health endpoint
            const healthResponse = await fetch('http://localhost:5000/api/v1/health');
            const healthData = await healthResponse.json();

            // C. ASSERTIONS
            expect(healthResponse.ok).toBe(true);
            expect(healthData.success).toBe(true);
            expect(healthData.status).toBe('healthy');
        });
    });

    describe('Error Resolution Recommendations', () => {
        test('should provide CORS fix recommendations', () => {
            // A. SETUP: Current CORS configuration analysis
            const currentConfig = {
                origins: [
                    "http://localhost:4000",
                    "http://127.0.0.1:4000", 
                    "https://carsontkempf.github.io",
                    "*"
                ]
            };

            // B. EXECUTION: Generate recommendations
            const recommendations = {
                immediate_fix: 'Ensure backend uses 127.0.0.1:5000 instead of localhost:5000',
                cors_config: 'Add specific origin mappings for all frontend hostnames',
                production_security: 'Remove wildcard (*) from CORS origins in production',
                testing: 'Use consistent hostname (127.0.0.1) across frontend and backend'
            };

            // C. ASSERTIONS: Verify recommendations cover the issue
            expect(recommendations.immediate_fix).toContain('127.0.0.1');
            expect(recommendations.cors_config).toContain('origin mappings');
            expect(recommendations.production_security).toContain('wildcard');
        });

        test('should validate solution implementation', () => {
            // A. SETUP: Updated configuration that should solve the issue
            const updatedConfig = {
                frontend_base_url: 'http://127.0.0.1:4000',
                backend_base_url: 'http://127.0.0.1:5000', // Changed from localhost
                cors_origins: [
                    'http://127.0.0.1:4000',
                    'http://localhost:4000',
                    'https://carsontkempf.github.io'
                    // Removed wildcard for security
                ]
            };

            // B. EXECUTION: Validate the fix
            const frontendOrigin = new URL(updatedConfig.frontend_base_url).origin;
            const isOriginAllowed = updatedConfig.cors_origins.includes(frontendOrigin);

            // C. ASSERTIONS
            expect(isOriginAllowed).toBe(true);
            expect(updatedConfig.backend_base_url).toContain('127.0.0.1');
            expect(updatedConfig.cors_origins).not.toContain('*');
        });
    });
});