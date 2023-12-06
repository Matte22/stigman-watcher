const chai = require('chai')
const expect = chai.expect
const ReviewParser = require('../lib/ReviewParser')
const { XMLParser } = require('fast-xml-parser')
const fs = require('fs').promises
const he = require('he')
const exp = require('constants')
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

describe('Object Value Testing Review Objects with Multi-Stig. ', () => {
  it('testing stats and review objects with default settings for object accuracy', async () => {
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/MultiStig-Simple.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )

    const expectedReviews = [
      {
        ruleId: 'SV-5_rule',
        result: 'pass',
        detail: 'There is no detail provided for the assessment',
        comment: 'xyz',
        resultEngine: null,
        status: 'saved'
      },
      {
        ruleId: 'SV-4_rule',
        result: 'fail',
        detail: 'There is no detail provided for the assessment',
        comment: 'xyz',
        resultEngine: null,
        status: 'saved'
      },
      {
        ruleId: 'SV-3_rule',
        result: 'notapplicable',
        detail: 'There is no detail provided for the assessment',
        comment: 'xyz',
        resultEngine: null,
        status: 'saved'
      },
      undefined,
      {
        ruleId: 'SV-1_rule',
        result: 'informational',
        detail: 'There is no detail provided for the assessment',
        comment: 'xyz',
        resultEngine: null,
        status: 'saved'
      }
    ]

    for (const [index, expected] of review.checklists.entries()) {
      expect(expected.reviews[0]).to.deep.equal(expectedReviews[index])
    }
  })

  it('testing stats and review objects autoStatus = null for accuracy', async () => {
    const importOptions = {
      autoStatus: 'null',
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/MultiStig-Simple.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )

    const expectedReviews = [
      {
        ruleId: 'SV-5_rule',
        result: 'pass',
        detail: 'There is no detail provided for the assessment',
        comment: 'xyz',
        resultEngine: null
      },
      {
        ruleId: 'SV-4_rule',
        result: 'fail',
        detail: 'There is no detail provided for the assessment',
        comment: 'xyz',
        resultEngine: null
      },
      {
        ruleId: 'SV-3_rule',
        result: 'notapplicable',
        detail: 'There is no detail provided for the assessment',
        comment: 'xyz',
        resultEngine: null
      },
      undefined,
      {
        ruleId: 'SV-1_rule',
        result: 'informational',
        detail: 'There is no detail provided for the assessment',
        comment: 'xyz',
        resultEngine: null
      }
    ]

    for (const [index, expected] of review.checklists.entries()) {
      expect(expected.reviews[0]).to.deep.equal(expectedReviews[index])
    }
  })

  it('testing stats and review objects autoStatus = submitted, testing object for accuracy', async () => {
    const importOptions = {
      autoStatus: 'submitted',
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/MultiStig-Simple.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )

    const expectedReviews = [
      {
        ruleId: 'SV-5_rule',
        result: 'pass',
        detail: 'There is no detail provided for the assessment',
        comment: 'xyz',
        resultEngine: null,
        status: 'submitted'
      },
      {
        ruleId: 'SV-4_rule',
        result: 'fail',
        detail: 'There is no detail provided for the assessment',
        comment: 'xyz',
        resultEngine: null,
        status: 'submitted'
      },
      {
        ruleId: 'SV-3_rule',
        result: 'notapplicable',
        detail: 'There is no detail provided for the assessment',
        comment: 'xyz',
        resultEngine: null,
        status: 'submitted'
      },
      undefined,
      {
        ruleId: 'SV-1_rule',
        result: 'informational',
        detail: 'There is no detail provided for the assessment',
        comment: 'xyz',
        resultEngine: null,
        status: 'saved'
      }
    ]

    for (const [index, expected] of review.checklists.entries()) {
      expect(expected.reviews[0]).to.deep.equal(expectedReviews[index])
    }
  })

  it("testing stats and review objects 'unreviewed = commented' testing that we only import unreviwred rules that contain a comment or detail   ", async () => {
    const importOptions = {
      autoStatus: 'saved',
      unreviewed: 'commented',
      unreviewedCommented: 'informational',
      emptyDetail: 'ignore',
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/MultiStig-Simple.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )

    const expectedReviews = [
      {
        ruleId: 'SV-5_rule',
        result: 'pass',
        detail: null,
        comment: 'xyz',
        resultEngine: null,
        status: 'saved'
      },
      {
        ruleId: 'SV-4_rule',
        result: 'fail',
        detail: null,
        comment: 'xyz',
        resultEngine: null,
        status: 'saved'
      },
      {
        ruleId: 'SV-3_rule',
        result: 'notapplicable',
        detail: null,
        comment: 'xyz',
        resultEngine: null,
        status: 'saved'
      },
      undefined,
      {
        ruleId: 'SV-1_rule',
        result: 'informational',
        detail: null,
        comment: 'xyz',
        resultEngine: null,
        status: 'saved'
      }
    ]

    for (const [index, expected] of review.checklists.entries()) {
      expect(expected.reviews[0]).to.deep.equal(expectedReviews[index])
    }
  })

  it(" testing stats and review objects'unreviewed = never' testing to never import an unreviewed item ", async () => {
    const importOptions = {
      autoStatus: 'saved',
      unreviewed: 'never',
      unreviewedCommented: 'informational',
      emptyDetail: 'ignore',
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/MultiStig-Simple.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )
    const expectedReviews = [
      {
        ruleId: 'SV-5_rule',
        result: 'pass',
        detail: null,
        comment: 'xyz',
        resultEngine: null,
        status: 'saved'
      },
      {
        ruleId: 'SV-4_rule',
        result: 'fail',
        detail: null,
        comment: 'xyz',
        resultEngine: null,
        status: 'saved'
      },
      {
        ruleId: 'SV-3_rule',
        result: 'notapplicable',
        detail: null,
        comment: 'xyz',
        resultEngine: null,
        status: 'saved'
      },
      undefined,
      undefined
    ]

    for (const [index, expected] of review.checklists.entries()) {
      expect(expected.reviews[0]).to.deep.equal(expectedReviews[index])
    }
  })

  it(" testing stats and review objects 'unreviewedComment = informational' testing that an unreviewed item with a comment has a result of informational", async () => {
    const importOptions = {
      autoStatus: 'saved',
      unreviewed: 'commented',
      unreviewedCommented: 'informational',
      emptyDetail: 'ignore',
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/MultiStig-Simple.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )

    const expectedReviews = [
      {
        ruleId: 'SV-5_rule',
        result: 'pass',
        detail: null,
        comment: 'xyz',
        resultEngine: null,
        status: 'saved'
      },
      {
        ruleId: 'SV-4_rule',
        result: 'fail',
        detail: null,
        comment: 'xyz',
        resultEngine: null,
        status: 'saved'
      },
      {
        ruleId: 'SV-3_rule',
        result: 'notapplicable',
        detail: null,
        comment: 'xyz',
        resultEngine: null,
        status: 'saved'
      },
      undefined,
      {
        ruleId: 'SV-1_rule',
        result: 'informational',
        detail: null,
        comment: 'xyz',
        resultEngine: null,
        status: 'saved'
      }
    ]

    for (const [index, expected] of review.checklists.entries()) {
      expect(expected.reviews[0]).to.deep.equal(expectedReviews[index])
    }
  })
})

describe('Object Value Testing Stats Objects with Multi-Stig. ', () => {
  it('testing stats and review objects with default settings for object accuracy', async () => {
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/MultiStig-Simple.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )

    const expectedStats = [
      {
        pass: 1,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 1,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 1,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 1,
        error: 0,
        fixed: 0,
        unknown: 0
      }
    ]

    for (const [index, expected] of review.checklists.entries()) {
      expect(expected.stats).to.deep.equal(expectedStats[index])
    }
  })

  it('testing stats and review objects autoStatus = null for accuracy', async () => {
    const importOptions = {
      autoStatus: 'null',
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/MultiStig-Simple.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )

    const expectedStats = [
      {
        pass: 1,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 1,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 1,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 1,
        error: 0,
        fixed: 0,
        unknown: 0
      }
    ]

    for (const [index, expected] of review.checklists.entries()) {
      expect(expected.stats).to.deep.equal(expectedStats[index])
    }
  })

  it('testing stats and review objects autoStatus = submitted, testing object for accuracy', async () => {
    const importOptions = {
      autoStatus: 'submitted',
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/MultiStig-Simple.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )

    const expectedStats = [
      {
        pass: 1,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 1,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 1,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 1,
        error: 0,
        fixed: 0,
        unknown: 0
      }
    ]

    for (const [index, expected] of review.checklists.entries()) {
      expect(expected.stats).to.deep.equal(expectedStats[index])
    }
  })

  it("testing stats and review objects 'unreviewed = commented' testing that we only import unreviwred rules that contain a comment or detail   ", async () => {
    const importOptions = {
      autoStatus: 'saved',
      unreviewed: 'commented',
      unreviewedCommented: 'informational',
      emptyDetail: 'ignore',
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/MultiStig-Simple.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )

    const expectedStats = [
      {
        pass: 1,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 1,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 1,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 1,
        error: 0,
        fixed: 0,
        unknown: 0
      }
    ]

    for (const [index, expected] of review.checklists.entries()) {
      expect(expected.stats).to.deep.equal(expectedStats[index])
    }
  })

  it(" testing stats and review objects'unreviewed = never' testing to never import an unreviewed item ", async () => {
    const importOptions = {
      autoStatus: 'saved',
      unreviewed: 'never',
      unreviewedCommented: 'informational',
      emptyDetail: 'ignore',
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/MultiStig-Simple.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )
    const expectedStats = [
      {
        pass: 1,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 1,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 1,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      }
    ]

    for (const [index, expected] of review.checklists.entries()) {
      expect(expected.stats).to.deep.equal(expectedStats[index])
    }
  })

  it(" testing stats and review objects 'unreviewedComment = informational' testing that an unreviewed item with a comment has a result of informational", async () => {
    const importOptions = {
      autoStatus: 'saved',
      unreviewed: 'commented',
      unreviewedCommented: 'informational',
      emptyDetail: 'ignore',
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

    const filePath = './WATCHER-test-files/WATCHER/ckl/MultiStig-Simple.ckl'

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    )

    const expectedStats = [
      {
        pass: 1,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 1,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 1,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 0,
        error: 0,
        fixed: 0,
        unknown: 0
      },
      {
        pass: 0,
        fail: 0,
        notapplicable: 0,
        notchecked: 0,
        notselected: 0,
        informational: 1,
        error: 0,
        fixed: 0,
        unknown: 0
      }
    ]

    for (const [index, expected] of review.checklists.entries()) {
      expect(expected.stats).to.deep.equal(expectedStats[index])
    }
  })
})
 