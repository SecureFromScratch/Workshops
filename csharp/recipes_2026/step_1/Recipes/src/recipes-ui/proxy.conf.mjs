export default [
  {
    context: ['/health', '/api'],
    target: 'http://localhost:7001',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  }
];
