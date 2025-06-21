const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('Testing Character Generator API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await makeRequest('GET', '/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response: ${JSON.stringify(health.data)}\n`);

    // Test creating a new character
    console.log('2. Testing character creation...');
    const createResponse = await makeRequest('POST', '/api/characters');
    console.log(`   Status: ${createResponse.status}`);
    if (createResponse.status === 201) {
      console.log(`   Character created: ${createResponse.data.name}`);
    } else {
      console.log(`   Error: ${JSON.stringify(createResponse.data)}`);
    }
    console.log('');

    // Test getting a random character
    console.log('3. Testing random character retrieval...');
    const randomResponse = await makeRequest('GET', '/api/characters/random');
    console.log(`   Status: ${randomResponse.status}`);
    if (randomResponse.status === 200) {
      console.log(`   Random character: ${randomResponse.data.name}`);
    } else {
      console.log(`   Error: ${JSON.stringify(randomResponse.data)}`);
    }

  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

// Check if server is running
makeRequest('GET', '/health')
  .then(() => {
    testAPI();
  })
  .catch(() => {
    console.log('Server is not running. Please start the server first with: npm run dev');
  }); 