const http = require('http');

const server = http.createServer((req, res) => {
  res.end('KT or T1 MSI go go!!');
});

server.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
