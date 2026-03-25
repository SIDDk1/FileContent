  const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// === CONFIGURE THESE ===
const FILE_PATH = 'PATH_TO_YOUR_FILE.pptx'; // Change to your PPTX or XLSX file
const QUERY = 'test'; // Change to your search query
const API_URL = 'http://localhost:3000/api/search-pptx-xlsx';

async function main() {
  if (!fs.existsSync(FILE_PATH)) {
    console.error('File not found:', FILE_PATH);
    process.exit(1);
  }
  const form = new FormData();
  form.append('query', QUERY);
  form.append('files', fs.createReadStream(FILE_PATH), path.basename(FILE_PATH));

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });
    const data = await res.json();
    console.log('API response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

main(); 