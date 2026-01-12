export const environment = {
  production: false,
  // authStrategy: 'local' as 'local' | 'azure',;p0'=[]
  authStrategy: 'azure' as 'local' | 'azure',

  apiUrl: 'http://localhost:3000',
  wsUrl: 'http://localhost:3000',
  socketUrl: 'http://localhost:3000',

  msalConfig: {
    clientId: '4de24a49-50a9-463f-abdd-0e0a78f4b8db',
    tenantId: '311834f4-5f64-42d1-956a-590577219596',
    redirectUri: 'http://localhost:4200/',
    postLogoutRedirectUri: 'http://localhost:4200',
  },
};
