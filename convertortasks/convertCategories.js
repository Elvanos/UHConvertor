const fs = require('fs-extra')
const csvFilePath = './files-input/Kategorie.csv'
const csv = require('csvtojson')
const slugify = require('../helpers/slugify.js')
const { Parser } = require('json2csv')

csv({ delimiter: ';' })
  .fromFile(csvFilePath)
  .then((jsonObj) => {
    processJSON(jsonObj)
  })

const processJSON = (jsonInput) => {
  // Murder existing file if we have one
  if (fs.existsSync('./files-output/_categories_raw.json')) {
    fs.removeSync('./files-output/_categories_raw.json')
  }

  fs.writeFileSync('./files-output/_categories.json', JSON.stringify(jsonInput))

  const exportJSON = []

  for (let index = 0; index < jsonInput.length; index++) {
    let inputElement = jsonInput[index]

    let outputElement = {
      id: inputElement.id + 100,
      active: (inputElement.show === '1'),
      name: inputElement.name,
      parentCat: (inputElement.parent_id === 'NULL_VALUE') ? 'Home' : inputElement.parent_id + 100,
      rootCat: 0,
      description: inputElement.description,
      metaTitle: 'Meta title-' + inputElement.name,
      metaKeywords: 'Meta keywords-' + inputElement.meta_keywords,
      metaDescription: 'Meta description-' + inputElement.meta_description,
      urlRewrite: inputElement.link
    }

    exportJSON.push(outputElement)
  }
  const json2csvParser = new Parser({ exportJSON, delimiter: ';' })

  // Murder existing file if we have one
  if (fs.existsSync('./files-output/categories.csv')) {
    fs.removeSync('./files-output/categories.csv')
  }

  const csv = json2csvParser.parse(exportJSON)
  fs.writeFileSync('./files-output/categories.csv', csv)
}
