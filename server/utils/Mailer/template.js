
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const loadTemplate = (templateName, data) => {
  const filePath = path.join(__dirname, '..', 'Mailer', 'Templates', `${templateName}.hbs`);
  const source = fs.readFileSync(filePath, 'utf8');
  const compiledTemplate = handlebars.compile(source);
  return compiledTemplate(data);
};

module.exports = loadTemplate;
