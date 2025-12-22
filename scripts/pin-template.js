const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO = 'chobbledotcom/chobble-template';
const BRANCH = 'main';
const WORKFLOW_FILE = '.github/workflows/build-and-deploy.yml';

const root = path.resolve(__dirname, '..');
const workflowPath = path.join(root, WORKFLOW_FILE);

function fetchLatestSha() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO}/commits/${BRANCH}`,
      headers: { 'User-Agent': 'node' }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.sha) {
            resolve(json.sha);
          } else {
            reject(new Error('Failed to fetch latest commit SHA'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log(`Fetching latest commit SHA for ${REPO}...`);
  
  const latestSha = await fetchLatestSha();
  console.log(`Latest commit: ${latestSha}`);

  const content = fs.readFileSync(workflowPath, 'utf8');
  const updated = content.replace(/ref: .*/g, `ref: ${latestSha}`);
  
  fs.writeFileSync(workflowPath, updated);
  console.log(`Updated ${WORKFLOW_FILE} to pin chobble-template at ${latestSha}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
