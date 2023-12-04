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

describe('Checklist array test', () => {
  it('', async () => {
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

    const filePath =
      './WATCHER-test-files/WATCHER/Asset_a-VPN_TRUNCATED-V2R5.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )

    expect(review.checklists).to.be.an('array')
    expect(review.checklists.length).to.equal(1)
    expect(review.checklists[0].benchmarkId).to.equal('VPN_TRUNCATED')
    expect(review.checklists[0].revisionStr).to.equal('V2R5')
  })

  it('Checklist array test multistig', async () => {
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

    const filePath = './WATCHER-test-files/WATCHER/Asset_b-multi-stig.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )

    console.log(JSON.stringify(review, null, 2))

    const expectedChecklists = [
      {
        benchmarkId: 'RHEL_8_TRUNCATED',
        revisionStr: 'V1R12'
      },
      {
        benchmarkId: 'RHEL_9_TRUNCATED',
        revisionStr: 'V1R1'
      },
      {
        benchmarkId: 'VPN_TRUNCATED',
        revisionStr: 'V2R5'
      }
    ]

    expect(review.checklists).to.be.an('array')
    expect(review.checklists.length).to.equal(expectedChecklists.length)

    for (const [index, expected] of expectedChecklists.entries()) {
      expect(review.checklists[index].benchmarkId).to.equal(
        expected.benchmarkId
      )
      expect(review.checklists[index].revisionStr).to.equal(
        expected.revisionStr
      )
    }
  })
})