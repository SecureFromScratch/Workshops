export default [
  {
    context: ['/health', '/api', '/bff', '/uploads'],
    target: 'http://localhost:7001',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  }
];
