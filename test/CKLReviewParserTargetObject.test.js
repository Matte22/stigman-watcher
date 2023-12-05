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

describe('Test that an asset with the given fields are all parsed correctly', () => {
  it('Testing a target asset with with a cklRole and normal data', async () => {
    const importOptions = {
      autoStatus: 'submitted',
      unreviewed: 'commented',
      unreviewedCommented: 'informational',
      emptyDetail: 'imported',
      emptyComment: 'imported',
      allowCustom: true
    }

    const fieldSettings = {
      detail: {
        enabled: 'always', // not used
        required: 'always'
      },
      comment: {
        enabled: 'findings', // not used
        required: 'optional'
      }
    }
    const allowAccept = true

    const filePath = './WATCHER-test-files/WATCHER/ckl/TargetObjectBasic.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )

    const expectedTarget = {
      name: 'MyAsset',
      description: null,
      ip: '10.10.10.10',
      fqdn: 'MyAsset.hello.world',
      mac: '00:1A:2B:3C:4D:5E',
      noncomputing: true,
      metadata: {
        cklRole: 'MyRole'
      }
    }

    expect(review.target).to.deep.equal(expectedTarget)

  })

  it('testing a target asset with the minimum amount of fields', async () => {
    const importOptions = {
      autoStatus: 'submitted',
      unreviewed: 'commented',
      unreviewedCommented: 'informational',
      emptyDetail: 'imported',
      emptyComment: 'imported',
      allowCustom: true
    }

    const fieldSettings = {
      detail: {
        enabled: 'always', // not used
        required: 'always'
      },
      comment: {
        enabled: 'findings', // not used
        required: 'optional'
      }
    }
    const allowAccept = true

    const filePath = './WATCHER-test-files/WATCHER/ckl/TargetObjectMinimal.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )

    const expectedTarget = {
      name: 'MyAsset',
      description: null,
      ip: null,
      fqdn: null,
      mac: null,
      noncomputing: false,
      metadata: {}
    }

    expect(review.target).to.deep.equal(expectedTarget)

  })

  it('testing a target asset with a complete set of metadata.', async () => {
    const importOptions = {
      autoStatus: 'submitted',
      unreviewed: 'commented',
      unreviewedCommented: 'informational',
      emptyDetail: 'imported',
      emptyComment: 'imported',
      allowCustom: true
    }

    const fieldSettings = {
      detail: {
        enabled: 'always', // not used
        required: 'always'
      },
      comment: {
        enabled: 'findings', // not used
        required: 'optional'
      }
    }
    const allowAccept = true

    const filePath = './WATCHER-test-files/WATCHER/ckl/TargetObjectMetaData.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )
    const expectedTarget = {
      name: 'MyAsset',
      description: null,
      ip: '10.10.10.10',
      fqdn: 'MyAsset.hello.world',
      mac: '00:1A:2B:3C:4D:5E',
      noncomputing: true,
      metadata: {
        cklHostName: 'MyAsset',
        cklRole: 'MyRole',
        cklTechArea: 'CyberSec',
        cklWebDbInstance: 'AssetWebDBInstance',
        cklWebDbSite: 'AssetDBSite',
        cklWebOrDatabase: 'true'
      }
    }
    expect(review.target).to.deep.equal(expectedTarget)
  })
})
