const chai = require('chai')
const expect = chai.expect
const ReviewParser = require('../lib/ReviewParser')
const { XMLParser } = require('fast-xml-parser')
const fs = require('fs').promises
const he = require('he')
const valueProcessor = function (
  tagName,
  tagValue,
  jPath,
  hasAttributes,
  isLeafNode
) {
  he.decode(tagValue)
}

// Create a helper function to read the file and generate the review object
async function generateReviewObject (
  filePath,
  importOptions,
  fieldSettings,
  allowAccept
) {
  const data = await fs.readFile(filePath, 'utf8')
  return ReviewParser.reviewsFromCkl({
    data,
    importOptions,
    fieldSettings,
    allowAccept,
    valueProcessor,
    XMLParser
  })
}
const parseOptions = {
  allowBooleanAttributes: false,
  attributeNamePrefix: '',
  cdataPropName: '__cdata', //default is 'false'
  ignoreAttributes: false,
  parseTagValue: false,
  parseAttributeValue: false,
  removeNSPrefix: true,
  trimValues: true,
  tagValueProcessor: valueProcessor,
  commentPropName: '__comment',
  isArray: (name, jpath, isLeafNode, isAttribute) => {
    return name === '__comment' || !isLeafNode
  }
}

describe('testing XML element errors', () => {
  it('XML with no "CHECKLIST, should throw "No CHECKLIST element"', async () => {
    const importOptions = {
      autoStatus: 'saved',
      unreviewed: 'commented',
      unreviewedCommented: 'informational',
      emptyDetail: 'replace',
      emptyComment: 'ignore',
      allowCustom: true
    }

    const fieldSettings = {
      detail: {
        enabled: 'always',
        required: 'always'
      },
      comment: {
        enabled: 'findings',
        required: 'findings'
      }
    }

    const allowAccept = true

    const filePath = './WATCHER-test-files/WATCHER/ckl/NoCHECKLISTelement.ckl'

    const data = await fs.readFile(filePath, 'utf8')

    expect(() =>
      ReviewParser.reviewsFromCkl({
        data,
        importOptions,
        fieldSettings,
        allowAccept,
        valueProcessor,
        XMLParser
      })
    ).to.throw('No CHECKLIST element')
  })
  it('XML with no "ASSET", should throw "No ASSET element"', async () => {
    const importOptions = {
      autoStatus: 'saved',
      unreviewed: 'commented',
      unreviewedCommented: 'informational',
      emptyDetail: 'replace',
      emptyComment: 'ignore',
      allowCustom: true
    }

    const fieldSettings = {
      detail: {
        enabled: 'always',
        required: 'always'
      },
      comment: {
        enabled: 'findings',
        required: 'findings'
      }
    }

    const allowAccept = true

    const filePath = './WATCHER-test-files/WATCHER/ckl/NoASSETelement.ckl'

    const data = await fs.readFile(filePath, 'utf8')

    expect(() =>
      ReviewParser.reviewsFromCkl({
        data,
        importOptions,
        fieldSettings,
        allowAccept,
        valueProcessor,
        XMLParser
      })
    ).to.throw('No ASSET element')
  })
  it('XML with no "STIGS", should throw "No STIGS element"', async () => {
    const importOptions = {
      autoStatus: 'saved',
      unreviewed: 'commented',
      unreviewedCommented: 'informational',
      emptyDetail: 'replace',
      emptyComment: 'ignore',
      allowCustom: true
    }

    const fieldSettings = {
      detail: {
        enabled: 'always',
        required: 'always'
      },
      comment: {
        enabled: 'findings',
        required: 'findings'
      }
    }

    const allowAccept = true

    const filePath = './WATCHER-test-files/WATCHER/ckl/NoSTIGSelement.ckl'

    const data = await fs.readFile(filePath, 'utf8')

    expect(() =>
      ReviewParser.reviewsFromCkl({
        data,
        importOptions,
        fieldSettings,
        allowAccept,
        valueProcessor,
        XMLParser
      })
    ).to.throw('No STIGS element')
  })
  it('XML with no "host_name in ASSET", should throw "No host_name in ASSET"', async () => {
    const importOptions = {
      autoStatus: 'saved',
      unreviewed: 'commented',
      unreviewedCommented: 'informational',
      emptyDetail: 'replace',
      emptyComment: 'ignore',
      allowCustom: true
    }

    const fieldSettings = {
      detail: {
        enabled: 'always',
        required: 'always'
      },
      comment: {
        enabled: 'findings',
        required: 'findings'
      }
    }

    const allowAccept = true

    const filePath = './WATCHER-test-files/WATCHER/ckl/noHost_NameElement.ckl'

    const data = await fs.readFile(filePath, 'utf8')

    expect(() =>
      ReviewParser.reviewsFromCkl({
        data,
        importOptions,
        fieldSettings,
        allowAccept,
        valueProcessor,
        XMLParser
      })
    ).to.throw('No host_name in ASSET')
  })
  it('XML with no "SI_DATA for SID_NAME = stigId", should throw "STIG_INFO element has no SI_DATA for SID_NAME == stigId"', async () => {
    const importOptions = {
      autoStatus: 'saved',
      unreviewed: 'commented',
      unreviewedCommented: 'informational',
      emptyDetail: 'replace',
      emptyComment: 'ignore',
      allowCustom: true
    }

    const fieldSettings = {
      detail: {
        enabled: 'always',
        required: 'always'
      },
      comment: {
        enabled: 'findings',
        required: 'findings'
      }
    }

    const allowAccept = true

    const filePath = './WATCHER-test-files/WATCHER/ckl/NoSID_DATAforStigId.ckl'

    const data = await fs.readFile(filePath, 'utf8')

    expect(() =>
      ReviewParser.reviewsFromCkl({
        data,
        importOptions,
        fieldSettings,
        allowAccept,
        valueProcessor,
        XMLParser
      })
    ).to.throw('STIG_INFO element has no SI_DATA for SID_NAME == stigId')
  })
})
