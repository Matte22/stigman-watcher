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

describe('Import Options, allowAccept for a review object in non multi-stig', () => {
  it('unreviewed: commented, unreviewedCommented: informational, has comments/detail', async () => {
    // will import commented unreviewed findings as informational
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/GoodStatistics.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )

    const expectedStats = {
      pass: 2,
      fail: 2,
      notapplicable: 2,
      notchecked: 0,
      notselected: 0,
      informational: 1,
      error: 0,
      fixed: 0,
      unknown: 0
    }

    expect(review.checklists[0].stats).to.deep.equal(expectedStats)
  })

  it('unreviewed: commented, unreviewedCommented: notchecked, has comments/detail', async () => {
     // will import commented unreviewed findings as notchecked
    const importOptions = {
      autoStatus: 'saved',
      unreviewed: 'commented',
      unreviewedCommented: 'notchecked',
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/GoodStatistics.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )

    const expectedStats = {
      pass: 2,
      fail: 2,
      notapplicable: 2,
      notchecked: 1,
      notselected: 0,
      informational: 0,
      error: 0,
      fixed: 0,
      unknown: 0
    }

    expect(review.checklists[0].stats).to.deep.equal(expectedStats)
  })

  it('unreviewed: always, unreviewedCommented: informational, has comments/detail', async () => {
    // will always import unreviewed findings and unreviewed with a commment/detail is informational
    const importOptions = {
      autoStatus: 'saved',
      unreviewed: 'always',
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/GoodStatistics.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )
    const expectedStats = {
      pass: 2,
      fail: 2,
      notapplicable: 2,
      notchecked: 1,
      notselected: 0,
      informational: 1,
      error: 0,
      fixed: 0,
      unknown: 0
    }

    expect(review.checklists[0].stats).to.deep.equal(expectedStats)
  })

  it('unreviewed: always, unreviewedCommented: notchecked, has comments/detail', async () => {
      // will always import unreviewed findings and unreviewed with a commment/detail is notchecked
    const importOptions = {
      autoStatus: 'saved',
      unreviewed: 'always',
      unreviewedCommented: 'notchecked',
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/GoodStatistics.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )
    const expectedStats = {
      pass: 2,
      fail: 2,
      notapplicable: 2,
      notchecked: 2,
      notselected: 0,
      informational: 0,
      error: 0,
      fixed: 0,
      unknown: 0
    }

    expect(review.checklists[0].stats).to.deep.equal(expectedStats)
  })

  it(' unreviewed: never, unreviewedCommented: informational, has comments/detail', async () => {
    // will never import unreviewed findings
    const importOptions = {
      autoStatus: 'saved',
      unreviewed: 'never',
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/GoodStatistics.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )

    const expectedStats = {
      pass: 2,
      fail: 2,
      notapplicable: 2,
      notchecked: 0,
      notselected: 0,
      informational: 0,
      error: 0,
      fixed: 0,
      unknown: 0
    }

    expect(review.checklists[0].stats).to.deep.equal(expectedStats)
  })

  it(' unreviewed: never, unreviewedCommented: notchecked', async () => {
    // will never import unreviewed findings
    const importOptions = {
      autoStatus: 'saved',
      unreviewed: 'never',
      unreviewedCommented: 'notchecked',
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/GoodStatistics.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )
    const expectedStats = {
      pass: 2,
      fail: 2,
      notapplicable: 2,
      notchecked: 0,
      notselected: 0,
      informational: 0,
      error: 0,
      fixed: 0,
      unknown: 0
    }

    expect(review.checklists[0].stats).to.deep.equal(expectedStats)
  })
})
