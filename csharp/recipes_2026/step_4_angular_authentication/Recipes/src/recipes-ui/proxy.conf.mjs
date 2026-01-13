export default [
  {
    context: ['/health', '/api', '/bff'],
    target: 'http://localhost:7001',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  }
];
