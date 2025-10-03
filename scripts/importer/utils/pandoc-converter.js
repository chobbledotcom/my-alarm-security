const { execSync } = require('child_process');

/**
 * Convert HTML file to markdown using pandoc
 * @param {string} htmlFile - Path to HTML file
 * @returns {string} Markdown content
 */
const convertToMarkdown = (htmlFile) => {
  try {
    const result = execSync(`pandoc -f html -t markdown "${htmlFile}" --wrap=none`, {
      encoding: 'utf8'
    });
    return result;
  } catch (error) {
    console.error(`Error converting ${htmlFile}:`, error.message);
    return '';
  }
};

module.exports = {
  convertToMarkdown
};