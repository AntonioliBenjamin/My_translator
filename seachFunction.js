const db = require('./export')


function search(uuid, originalText) {
    const translations = db.get(uuid);
    if (translations) {
      const found = translations.find(
        (element) => element.originalText === originalText
      );
      if (found) {
        return found;
      }
    }
  }

module.exports = search;