// const chai = require('chai')
// const expect = chai.expect
// const ReviewParser = require('../lib/ReviewParser')
// const { XMLParser } = require('fast-xml-parser')
// const fs = require('fs').promises
// const he = require('he')
// const exp = require('constants')
// const valueProcessor = function (
//   tagName,
//   tagValue,
//   jPath,
//   hasAttributes,
//   isLeafNode
// ) {
//   he.decode(tagValue)
// }

// // Create a helper function to read the file and generate the review object
// async function generateReviewObject (
//   filePath,
//   importOptions,
//   fieldSettings,
//   allowAccept
// ) {
//   const data = await fs.readFile(filePath, 'utf8')
//   return ReviewParser.reviewsFromCkl({
//     data,
//     importOptions,
//     fieldSettings,
//     allowAccept,
//     valueProcessor,
//     XMLParser
//   })
// }
// const parseOptions = {
//   allowBooleanAttributes: false,
//   attributeNamePrefix: '',
//   cdataPropName: '__cdata', //default is 'false'
//   ignoreAttributes: false,
//   parseTagValue: false,
//   parseAttributeValue: false,
//   removeNSPrefix: true,
//   trimValues: true,
//   tagValueProcessor: valueProcessor,
//   commentPropName: '__comment',
//   isArray: (name, jpath, isLeafNode, isAttribute) => {
//     return name === '__comment' || !isLeafNode
//   }
// }
// async function getTotalVulnCount (filePath) {
//   const data = await fs.readFile(filePath, 'utf8')
//   const parser = new XMLParser(parseOptions)
//   const parsed = parser.parse(data)

//   let totalVulnCount = 0
//   for (const checklist of parsed.CHECKLIST) {
//     for (const stigs of checklist.STIGS) {
//       for (const stig of stigs.iSTIG) {
//         totalVulnCount += stig.VULN.length
//       }
//     }
//   }

//   return totalVulnCount
// }

// describe('Object Value Testing with statisitcs. ', () => {
//   it('testing default settings with single stig CKL for object accuracy', async () => {
//     const importOptions = {
//       autoStatus: 'saved',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'replace',
//       emptyComment: 'ignore',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'always',
//         required: 'always'
//       },
//       comment: {
//         enabled: 'findings',
//         required: 'findings'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/ckl/Single-Vuln-notReviewed-Commented-Detailed.ckl'

//     const review = await generateReviewObject(
//       filePath,
//       importOptions,
//       fieldSettings,
//       allowAccept
//     )

//     const expectedObject = {
//       target: {
//         name: 'Asset_aaaaaaaaaa',
//         description: null,
//         ip: null,
//         fqdn: null,
//         mac: null,
//         noncomputing: true,
//         metadata: {
//           cklRole: 'None'
//         }
//       },
//       checklists: [
//         {
//           benchmarkId: 'RHEL_9_TRUNCATED',
//           revisionStr: 'V1R1',
//           reviews: [
//             {
//               ruleId: 'SV-257777r925318_rule',
//               result: 'informational',
//               detail: 'yyyyyyyyyyyyyyyyyyyyyyyyy',
//               comment: 'zzzzzzzzzzzzzzzzzzzzzz',
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 0,
//             notapplicable: 0,
//             notchecked: 0,
//             notselected: 0,
//             informational: 1,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         }
//       ]
//     }
//     expect(review).to.deep.equal(expectedObject)
//   })

//   it('autoStatus = null  testing full object for accuracy', async () => {
//     const importOptions = {
//       autoStatus: 'null',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'replace',
//       emptyComment: 'ignore',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'always',
//         required: 'always'
//       },
//       comment: {
//         enabled: 'findings',
//         required: 'findings'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/ckl/Single-Vuln-notReviewed-Commented-Detailed.ckl'

//     const review = await generateReviewObject(
//       filePath,
//       importOptions,
//       fieldSettings,
//       allowAccept
//     )

//     const expectedObject = {
//       target: {
//         name: 'Asset_aaaaaaaaaa',
//         description: null,
//         ip: null,
//         fqdn: null,
//         mac: null,
//         noncomputing: true,
//         metadata: {
//           cklRole: 'None'
//         }
//       },
//       checklists: [
//         {
//           benchmarkId: 'RHEL_9_TRUNCATED',
//           revisionStr: 'V1R1',
//           reviews: [
//             {
//               ruleId: 'SV-257777r925318_rule',
//               result: 'informational',
//               detail: 'yyyyyyyyyyyyyyyyyyyyyyyyy',
//               comment: 'zzzzzzzzzzzzzzzzzzzzzz',
//               resultEngine: null
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 0,
//             notapplicable: 0,
//             notchecked: 0,
//             notselected: 0,
//             informational: 1,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         }
//       ]
//     }

//     expect(review).to.deep.equal(expectedObject)
//   })

//   it('autoStatus = submitted, testing object for accuracy', async () => {
//     const importOptions = {
//       autoStatus: 'submitted',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'replace',
//       emptyComment: 'ignore',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'always',
//         required: 'always'
//       },
//       comment: {
//         enabled: 'findings',
//         required: 'findings'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/ckl/Asset_a-VPN_TRUNCATED-V2R5.ckl'

//     const review = await generateReviewObject(
//       filePath,
//       importOptions,
//       fieldSettings,
//       allowAccept
//     )

//     const expectedObject = {
//       target: {
//         name: 'Asset_aaaaaaaaaa',
//         description: null,
//         ip: null,
//         fqdn: null,
//         mac: null,
//         noncomputing: true,
//         metadata: {
//           cklRole: 'None'
//         }
//       },
//       checklists: [
//         {
//           benchmarkId: 'VPN_TRUNCATED',
//           revisionStr: 'V2R5',
//           reviews: [
//             {
//               ruleId: 'SV-207184r695317_rule',
//               result: 'pass',
//               detail: 'xxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'submitted'
//             },
//             {
//               ruleId: 'SV-207185r608988_rule',
//               result: 'fail',
//               detail: 'yyyyyyyyyy',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207186r608988_rule',
//               result: 'notapplicable',
//               detail: 'xxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'submitted'
//             },
//             {
//               ruleId: 'SV-207187r608988_rule',
//               result: 'informational',
//               detail: 'xxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207188r608988_rule',
//               result: 'pass',
//               detail: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'submitted'
//             },
//             {
//               ruleId: 'SV-207189r608988_rule',
//               result: 'informational',
//               detail: 'xxxxxxxxxxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207190r803417_rule',
//               result: 'pass',
//               detail: 'xxxxxxxxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'submitted'
//             },
//             {
//               ruleId: 'SV-207191r803418_rule',
//               result: 'fail',
//               detail: 'yyyyyyyyyyyyyyyyyyyyyyyyy',
//               comment: 'zzzzzzzzzzzzzzzzzzzzzz',
//               resultEngine: null,
//               status: 'submitted'
//             }
//           ],
//           stats: {
//             pass: 3,
//             fail: 2,
//             notapplicable: 1,
//             notchecked: 0,
//             notselected: 0,
//             informational: 2,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         }
//       ]
//     }

//     expect(review).to.deep.equal(expectedObject)
//   })

//   it('autoStatus = submitted, testing object for accuracy', async () => {
//     const importOptions = {
//       autoStatus: 'submitted',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'replace',
//       emptyComment: 'ignore',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'always',
//         required: 'always'
//       },
//       comment: {
//         enabled: 'findings',
//         required: 'findings'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/ckl/Single-Vuln-notReviewed-Commented-Detailed.ckl'

//     const review = await generateReviewObject(
//       filePath,
//       importOptions,
//       fieldSettings,
//       allowAccept
//     )

//     const expectedObject = {
//       target: {
//         name: 'Asset_aaaaaaaaaa',
//         description: null,
//         ip: null,
//         fqdn: null,
//         mac: null,
//         noncomputing: true,
//         metadata: {
//           cklRole: 'None'
//         }
//       },
//       checklists: [
//         {
//           benchmarkId: 'RHEL_9_TRUNCATED',
//           revisionStr: 'V1R1',
//           reviews: [
//             {
//               ruleId: 'SV-257777r925318_rule',
//               result: 'informational',
//               detail: 'yyyyyyyyyyyyyyyyyyyyyyyyy',
//               comment: 'zzzzzzzzzzzzzzzzzzzzzz',
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 0,
//             notapplicable: 0,
//             notchecked: 0,
//             notselected: 0,
//             informational: 1,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         }
//       ]
//     }

//     expect(review).to.deep.equal(expectedObject)
//   })

//   it('(autoStatus = accepted allowAccept = true) for permissions to use accepted status, testing object accuracy', async () => {
//     const importOptions = {
//       autoStatus: 'accepted',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'replace',
//       emptyComment: 'ignore',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'always',
//         required: 'always'
//       },
//       comment: {
//         enabled: 'findings',
//         required: 'findings'
//       }
//     }

//     const allowAccept = true
//     const filePath =
//       './WATCHER-test-files/WATCHER/ckl/Asset_a-VPN_TRUNCATED-V2R5.ckl'

//     const review = await generateReviewObject(
//       filePath,
//       importOptions,
//       fieldSettings,
//       allowAccept
//     )

//     const expectedObject = {
//       target: {
//         name: 'Asset_aaaaaaaaaa',
//         description: null,
//         ip: null,
//         fqdn: null,
//         mac: null,
//         noncomputing: true,
//         metadata: {
//           cklRole: 'None'
//         }
//       },
//       checklists: [
//         {
//           benchmarkId: 'VPN_TRUNCATED',
//           revisionStr: 'V2R5',
//           reviews: [
//             {
//               ruleId: 'SV-207184r695317_rule',
//               result: 'pass',
//               detail: 'xxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'accepted'
//             },
//             {
//               ruleId: 'SV-207185r608988_rule',
//               result: 'fail',
//               detail: 'yyyyyyyyyy',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207186r608988_rule',
//               result: 'notapplicable',
//               detail: 'xxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'accepted'
//             },
//             {
//               ruleId: 'SV-207187r608988_rule',
//               result: 'informational',
//               detail: 'xxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207188r608988_rule',
//               result: 'pass',
//               detail: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'accepted'
//             },
//             {
//               ruleId: 'SV-207189r608988_rule',
//               result: 'informational',
//               detail: 'xxxxxxxxxxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207190r803417_rule',
//               result: 'pass',
//               detail: 'xxxxxxxxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'accepted'
//             },
//             {
//               ruleId: 'SV-207191r803418_rule',
//               result: 'fail',
//               detail: 'yyyyyyyyyyyyyyyyyyyyyyyyy',
//               comment: 'zzzzzzzzzzzzzzzzzzzzzz',
//               resultEngine: null,
//               status: 'accepted'
//             }
//           ],
//           stats: {
//             pass: 3,
//             fail: 2,
//             notapplicable: 1,
//             notchecked: 0,
//             notselected: 0,
//             informational: 2,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         }
//       ]
//     }

//     expect(review).to.deep.equal(expectedObject)
//   })

//   it('(autoStatus = accepted allowAccept = false) for permissions to use submitted status', async () => {
//     const importOptions = {
//       autoStatus: 'accepted',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'replace',
//       emptyComment: 'ignore',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'always',
//         required: 'always'
//       },
//       comment: {
//         enabled: 'findings',
//         required: 'findings'
//       }
//     }

//     const allowAccept = false
//     const filePath =
//       './WATCHER-test-files/WATCHER/ckl/Asset_a-VPN_TRUNCATED-V2R5.ckl'

//     const review = await generateReviewObject(
//       filePath,
//       importOptions,
//       fieldSettings,
//       allowAccept
//     )

//     const expectedObject = {
//       target: {
//         name: 'Asset_aaaaaaaaaa',
//         description: null,
//         ip: null,
//         fqdn: null,
//         mac: null,
//         noncomputing: true,
//         metadata: {
//           cklRole: 'None'
//         }
//       },
//       checklists: [
//         {
//           benchmarkId: 'VPN_TRUNCATED',
//           revisionStr: 'V2R5',
//           reviews: [
//             {
//               ruleId: 'SV-207184r695317_rule',
//               result: 'pass',
//               detail: 'xxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'submitted'
//             },
//             {
//               ruleId: 'SV-207185r608988_rule',
//               result: 'fail',
//               detail: 'yyyyyyyyyy',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207186r608988_rule',
//               result: 'notapplicable',
//               detail: 'xxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'submitted'
//             },
//             {
//               ruleId: 'SV-207187r608988_rule',
//               result: 'informational',
//               detail: 'xxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207188r608988_rule',
//               result: 'pass',
//               detail: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'submitted'
//             },
//             {
//               ruleId: 'SV-207189r608988_rule',
//               result: 'informational',
//               detail: 'xxxxxxxxxxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207190r803417_rule',
//               result: 'pass',
//               detail: 'xxxxxxxxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'submitted'
//             },
//             {
//               ruleId: 'SV-207191r803418_rule',
//               result: 'fail',
//               detail: 'yyyyyyyyyyyyyyyyyyyyyyyyy',
//               comment: 'zzzzzzzzzzzzzzzzzzzzzz',
//               resultEngine: null,
//               status: 'submitted'
//             }
//           ],
//           stats: {
//             pass: 3,
//             fail: 2,
//             notapplicable: 1,
//             notchecked: 0,
//             notselected: 0,
//             informational: 2,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         }
//       ]
//     }

//     expect(review).to.deep.equal(expectedObject)
//   })

//   it("'unreviewed = commented' testing that we only import unreviwred rules that contain a comment or detail   ", async () => {
//     const importOptions = {
//       autoStatus: 'saved',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'replace',
//       emptyComment: 'ignore',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'always',
//         required: 'always'
//       },
//       comment: {
//         enabled: 'findings',
//         required: 'findings'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/ckl/Single-Vuln-notReviewed-Commented-Detailed.ckl'

//     const review = await generateReviewObject(
//       filePath,
//       importOptions,
//       fieldSettings,
//       allowAccept
//     )

//     const expectedObject = {
//       target: {
//         name: 'Asset_aaaaaaaaaa',
//         description: null,
//         ip: null,
//         fqdn: null,
//         mac: null,
//         noncomputing: true,
//         metadata: {
//           cklRole: 'None'
//         }
//       },
//       checklists: [
//         {
//           benchmarkId: 'RHEL_9_TRUNCATED',
//           revisionStr: 'V1R1',
//           reviews: [
//             {
//               ruleId: 'SV-257777r925318_rule',
//               result: 'informational',
//               detail: 'yyyyyyyyyyyyyyyyyyyyyyyyy',
//               comment: 'zzzzzzzzzzzzzzzzzzzzzz',
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 0,
//             notapplicable: 0,
//             notchecked: 0,
//             notselected: 0,
//             informational: 1,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         }
//       ]
//     }

//     expect(review).to.deep.equal(expectedObject)
//   })

//   it("'unreviewed = commented' testing that we only import unreviwred rules that contain a comment or detail but giving a review without either", async () => {
//     const importOptions = {
//       autoStatus: 'saved',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'replace',
//       emptyComment: 'ignore',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'always',
//         required: 'always'
//       },
//       comment: {
//         enabled: 'findings',
//         required: 'findings'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/ckl/Single-Vuln-notReviewed-Empty-CommentDetail.ckl'

//     const review = await generateReviewObject(
//       filePath,
//       importOptions,
//       fieldSettings,
//       allowAccept
//     )

//     const expectedObject = {
//       target: {
//         name: 'Asset_aaaaaaaaaa',
//         description: null,
//         ip: null,
//         fqdn: null,
//         mac: null,
//         noncomputing: true,
//         metadata: {
//           cklRole: 'None'
//         }
//       },
//       checklists: [
//         {
//           benchmarkId: 'RHEL_9_TRUNCATED',
//           revisionStr: 'V1R1',
//           reviews: [],
//           stats: {
//             pass: 0,
//             fail: 0,
//             notapplicable: 0,
//             notchecked: 0,
//             notselected: 0,
//             informational: 0,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         }
//       ]
//     }

//     expect(review).to.deep.equal(expectedObject)
//   })

//   it("'unreviewed = always', testing that unreviewed alwasys are imported  ", async () => {
//     const importOptions = {
//       autoStatus: 'saved',
//       unreviewed: 'always',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'replace',
//       emptyComment: 'ignore',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'always',
//         required: 'always'
//       },
//       comment: {
//         enabled: 'findings',
//         required: 'findings'
//       }
//     }

//     const allowAccept = true

//     // const multipleFilePaths =
//     //   "./WATCHER-test-files/WATCHER/ckl/Asset_a-multi-stig.ckl";

//     const filePath =
//       './WATCHER-test-files/WATCHER/ckl/Asset_a-VPN_TRUNCATED-V2R5.ckl'

//     const totalReviewsPreProcessed = await getTotalVulnCount(filePath)

//     const review = await generateReviewObject(
//       filePath,
//       importOptions,
//       fieldSettings,
//       allowAccept
//     )

//     const expectedObject = {
//       target: {
//         name: 'Asset_aaaaaaaaaa',
//         description: null,
//         ip: null,
//         fqdn: null,
//         mac: null,
//         noncomputing: true,
//         metadata: {
//           cklRole: 'None'
//         }
//       },
//       checklists: [
//         {
//           benchmarkId: 'VPN_TRUNCATED',
//           revisionStr: 'V2R5',
//           reviews: [
//             {
//               ruleId: 'SV-207184r695317_rule',
//               result: 'pass',
//               detail: 'xxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207185r608988_rule',
//               result: 'fail',
//               detail: 'yyyyyyyyyy',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207186r608988_rule',
//               result: 'notapplicable',
//               detail: 'xxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207187r608988_rule',
//               result: 'informational',
//               detail: 'xxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207188r608988_rule',
//               result: 'pass',
//               detail: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207189r608988_rule',
//               result: 'informational',
//               detail: 'xxxxxxxxxxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207190r803417_rule',
//               result: 'pass',
//               detail: 'xxxxxxxxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207191r803418_rule',
//               result: 'fail',
//               detail: 'yyyyyyyyyyyyyyyyyyyyyyyyy',
//               comment: 'zzzzzzzzzzzzzzzzzzzzzz',
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207192r916146_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207193r916149_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 3,
//             fail: 2,
//             notapplicable: 1,
//             notchecked: 2,
//             notselected: 0,
//             informational: 2,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         }
//       ]
//     }

//     expect(review).to.deep.equal(expectedObject)
//   })
//   it(" 'unreviewed = never' testing to never import an unreviewed item ", async () => {
//     const importOptions = {
//       autoStatus: 'saved',
//       unreviewed: 'never',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'replace',
//       emptyComment: 'ignore',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'always',
//         required: 'always'
//       },
//       comment: {
//         enabled: 'findings',
//         required: 'findings'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/ckl/Asset_a-VPN_TRUNCATED-V2R5.ckl'

//     const review = await generateReviewObject(
//       filePath,
//       importOptions,
//       fieldSettings,
//       allowAccept
//     )

//     const expectedObject = {
//       target: {
//         name: 'Asset_aaaaaaaaaa',
//         description: null,
//         ip: null,
//         fqdn: null,
//         mac: null,
//         noncomputing: true,
//         metadata: {
//           cklRole: 'None'
//         }
//       },
//       checklists: [
//         {
//           benchmarkId: 'VPN_TRUNCATED',
//           revisionStr: 'V2R5',
//           reviews: [
//             {
//               ruleId: 'SV-207184r695317_rule',
//               result: 'pass',
//               detail: 'xxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207185r608988_rule',
//               result: 'fail',
//               detail: 'yyyyyyyyyy',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207186r608988_rule',
//               result: 'notapplicable',
//               detail: 'xxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207188r608988_rule',
//               result: 'pass',
//               detail: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207190r803417_rule',
//               result: 'pass',
//               detail: 'xxxxxxxxxxxxxxxxx',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-207191r803418_rule',
//               result: 'fail',
//               detail: 'yyyyyyyyyyyyyyyyyyyyyyyyy',
//               comment: 'zzzzzzzzzzzzzzzzzzzzzz',
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 3,
//             fail: 2,
//             notapplicable: 1,
//             notchecked: 0,
//             notselected: 0,
//             informational: 0,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         }
//       ]
//     }

//     expect(review).to.deep.equal(expectedObject)
//   })

//   it("'unreviewedComment = informational' testing that an unreviewed item with a comment has a result of informational", async () => {
//     const importOptions = {
//       autoStatus: 'saved',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'replace',
//       emptyComment: 'ignore',
//       allowCustom: true
//     }
//     const fieldSettings = {
//       detail: {
//         enabled: 'always',
//         required: 'always'
//       },
//       comment: {
//         enabled: 'findings',
//         required: 'findings'
//       }
//     }

//     const allowAccept = true

//     // const multipleFilePaths =
//     //   "./WATCHER-test-files/WATCHER/ckl/Asset_a-multi-stig.ckl";

//     const filePath =
//       './WATCHER-test-files/WATCHER/ckl/Single-Vuln-notReviewed-Commented-Detailed.ckl'

//     const review = await generateReviewObject(
//       filePath,
//       importOptions,
//       fieldSettings,
//       allowAccept
//     )

//     const expectedObject = {
//       target: {
//         name: 'Asset_aaaaaaaaaa',
//         description: null,
//         ip: null,
//         fqdn: null,
//         mac: null,
//         noncomputing: true,
//         metadata: {
//           cklRole: 'None'
//         }
//       },
//       checklists: [
//         {
//           benchmarkId: 'RHEL_9_TRUNCATED',
//           revisionStr: 'V1R1',
//           reviews: [
//             {
//               ruleId: 'SV-257777r925318_rule',
//               result: 'informational',
//               detail: 'yyyyyyyyyyyyyyyyyyyyyyyyy',
//               comment: 'zzzzzzzzzzzzzzzzzzzzzz',
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 0,
//             notapplicable: 0,
//             notchecked: 0,
//             notselected: 0,
//             informational: 1,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         }
//       ]
//     }

//     expect(review).to.deep.equal(expectedObject)
//   })
//   it(" 'unreviewedComment = notchecked'. testing that an unreviewed with a comment has a result of notchecked", async () => {
//     const importOptions = {
//       autoStatus: 'saved',
//       unreviewed: 'commented',
//       unreviewedCommented: 'notchecked',
//       emptyDetail: 'replace',
//       emptyComment: 'ignore',
//       allowCustom: true
//     }
//     const fieldSettings = {
//       detail: {
//         enabled: 'always',
//         required: 'always'
//       },
//       comment: {
//         enabled: 'findings',
//         required: 'findings'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/ckl/Single-Vuln-notReviewed-Commented-Detailed.ckl'

//     const review = await generateReviewObject(
//       filePath,
//       importOptions,
//       fieldSettings,
//       allowAccept
//     )

//     const expectedObject = {
//       target: {
//         name: 'Asset_aaaaaaaaaa',
//         description: null,
//         ip: null,
//         fqdn: null,
//         mac: null,
//         noncomputing: true,
//         metadata: {
//           cklRole: 'None'
//         }
//       },
//       checklists: [
//         {
//           benchmarkId: 'RHEL_9_TRUNCATED',
//           revisionStr: 'V1R1',
//           reviews: [
//             {
//               ruleId: 'SV-257777r925318_rule',
//               result: 'notchecked',
//               detail: 'yyyyyyyyyyyyyyyyyyyyyyyyy',
//               comment: 'zzzzzzzzzzzzzzzzzzzzzz',
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 0,
//             notapplicable: 0,
//             notchecked: 1,
//             notselected: 0,
//             informational: 0,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         }
//       ]
//     }
//     expect(review).to.deep.equal(expectedObject)
//   })
// })
