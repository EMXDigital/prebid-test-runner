const fs = require('fs')

try {
  const data = fs.readFileSync('./integration_test_logs', 'utf8');
  console.log(data)
} catch (err) {
  console.error(err)
}
