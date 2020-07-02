const fs = require('fs-extra')
const csvFilePath = './files-input/Produkty.csv'
const csvPictureListPath = './files-input/Obrazky produktu.csv'
const csv = require('csvtojson')
const slugify = require('../helpers/slugify.js')
const { Parser } = require('json2csv')
const striptags = require('striptags')

let pictureJSON

const convertPictures = () => {
  csv({ delimiter: ';' })
    .fromFile(csvPictureListPath)
    .then((jsonObj) => {
      pictureJSON = jsonObj
      convertProducts()
    })
}
const convertProducts = () => {
  csv({ delimiter: ';' })
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      processJSON(jsonObj)
    })
}

const buildPictureArray = (productID) => {
  let pictureArray = []
  pictureJSON.forEach(picture => {
    if (picture.product_id === productID) {
      const imageLink = 'http://www.sisocz.cz/images/products/' + productID + '/' + picture.id + '-Original.jpg'
      pictureArray.push(imageLink)
    }
  })

  pictureArray = pictureArray.join(',')

  return pictureArray
}

const processJSON = (jsonInput) => {
  // Murder existing file if we have one
  if (fs.existsSync('./files-output/_products_raw.json')) {
    fs.removeSync('./files-output/_products_raw.json')
  }

  fs.writeFileSync('./files-output/_products.json', JSON.stringify(jsonInput))

  const exportJSON = []

  for (let index = 0; index < jsonInput.length; index++) {
    let inputElement = jsonInput[index]

    let photoURLs = buildPictureArray(inputElement.id)

    let shortDescription = striptags(inputElement.short_description)
    shortDescription = (shortDescription.length > 400) ? shortDescription.substr(0, 397) + '...' : shortDescription

    let categories = (cats) => {
      if (cats === 'NULL_VALUE') { return null }
      cats = cats.split(',').map(c => c + 100).join(',')
      return cats
    }

    const element = {
      id: inputElement.id + 400,
      active: (inputElement.show === '1'),
      name: inputElement.name,
      category: categories(inputElement.categories),
      priceNoVAT: inputElement.base_price,
      taxRules: 1,
      priceWholesale: null,
      onSale: inputElement.sale,
      discount: 0,
      discountPerecent: 0,
      discountFrom: '2000-01-01',
      discountTo: '2000-01-02',
      reference: 'RP-demo' + inputElement.id,
      suplierReference: 'RP-demo' + inputElement.id,
      suplier: (inputElement.supplier_id === 'NULL_VALUE') ? null : inputElement.supplier_idc,
      manufacturer: (inputElement.producer_id === 'NULL_VALUE') ? null : inputElement.producer_id,
      EAN13: null,
      UPC: null,
      ecoTax: 0,
      width: 0,
      height: 0,
      depth: 0,
      weight: 0,
      deliveryDayCount: 7,
      deliveryDayCountNoWarehous: 14,
      quantity: (inputElement.stocked_items === 'NULL_VALUE') ? null : parseInt(inputElement.stocked_items),
      minimalQuantity: parseInt(inputElement.minimal_count),
      lowStockLevel: 0,
      sendEmailIfLow: 0,
      visibility: 'both',
      additionalShippingCost: null,
      unity: null,
      unitPrice: null,
      shortDescription: shortDescription,
      description: inputElement.main_description,
      tags: inputElement.meta_keywords,
      metaTitle: 'Meta title-' + inputElement.name,
      metaKeywords: 'Meta keywords-' + inputElement.meta_keywords,
      metaDescription: 'Meta description-' + inputElement.short_description,
      urlRewrite: inputElement.link,
      textInStock: 'Dostupné',
      textBackOrderAllowed: 'Momentálně nedostupné. Možná objednávka',
      availableForOrder: 1,
      productAvailableDate: '2000-01-01',
      productCreationDate: '2000-01-01',
      showPrice: 1,
      imageLinks: photoURLs,
      imageAltTexts: null,
      deleteImages: 0,
      feature: null,
      onlyOnline: 0,
      condition: 'new',
      customizeable: 0,
      uploadableFiles: 0,
      textFields: 0,
      actionIfOutOfStock: null,
      virtualProduct: 0,
      fileURL: null,
      amountOfAllowedDownloads: null,
      expieryDate: null,
      shopID: 0,
      advancedStockManagement: 0,
      dependsOnStock: 0,
      warehouse: 0,
      accesories: null

    }

    if (element.active) {
      exportJSON.push(element)
    }
  }
  const json2csvParser = new Parser({ exportJSON, delimiter: ';' })

  // Murder existing file if we have one
  if (fs.existsSync('./files-output/products.csv')) {
    fs.removeSync('./files-output/products.csv')
  }

  const csv = json2csvParser.parse(exportJSON)
  fs.writeFileSync('./files-output/products.csv', csv)
}
convertPictures()
