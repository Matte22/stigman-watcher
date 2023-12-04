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

// describe('Object Value Testing', () => {
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
//       './WATCHER-test-files/WATCHER/Single-Vuln-notReviewed-Commented-Detailed.ckl'

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
//       './WATCHER-test-files/WATCHER/Single-Vuln-notReviewed-Commented-Detailed.ckl'

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
//       './WATCHER-test-files/WATCHER/Asset_a-VPN_TRUNCATED-V2R5.ckl'

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
//       './WATCHER-test-files/WATCHER/Single-Vuln-notReviewed-Commented-Detailed.ckl'

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
//       './WATCHER-test-files/WATCHER/Asset_a-VPN_TRUNCATED-V2R5.ckl'

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
//       './WATCHER-test-files/WATCHER/Asset_a-VPN_TRUNCATED-V2R5.ckl'

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
//       './WATCHER-test-files/WATCHER/Single-Vuln-notReviewed-Commented-Detailed.ckl'

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
//       './WATCHER-test-files/WATCHER/Single-Vuln-notReviewed-Empty-CommentDetail.ckl'

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
//     //   "./WATCHER-test-files/WATCHER/Asset_a-multi-stig.ckl";

//     const filePath =
//       './WATCHER-test-files/WATCHER/Asset_a-VPN_TRUNCATED-V2R5.ckl'

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
//       './WATCHER-test-files/WATCHER/Asset_a-VPN_TRUNCATED-V2R5.ckl'

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
//     //   "./WATCHER-test-files/WATCHER/Asset_a-multi-stig.ckl";

//     const filePath =
//       './WATCHER-test-files/WATCHER/Single-Vuln-notReviewed-Commented-Detailed.ckl'

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
//       './WATCHER-test-files/WATCHER/Single-Vuln-notReviewed-Commented-Detailed.ckl'

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
//   it("'emptyDetail = replace' testing that if an item has an empty detail we will replace it with a static message", async () => {
//     // replace overwrites it with the static
//     // import will do "" if no detail or give you the provided detail
//     // ignore will give detail = null

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
//       './WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Comment.ckl'

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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'pass',
//               detail: 'There is no detail provided for the assessment',
//               comment: 'xyz',
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 1,
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
//   it("'emptyDetail = ignore'testing that if there is no detail provided it will retaing exisiting, if no exisitng then we will set to null", async () => {
//     // replace overwrites it with the static
//     // import will do "" if no detail or give you the provided detail
//     // ignore will give detail = null

//     const importOptions = {
//       autoStatus: 'saved',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'ignore',
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
//       './WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Comment.ckl'

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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'pass',
//               detail: null,
//               comment: 'xyz',
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 1,
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
//   it("'emptyDetail = import', testing empty detail will clear existing text (setting it to empty string)", async () => {
//     // replace overwrites it with the static
//     // import will do "" if no detail or give you the provided detail
//     // ignore will give detail = null

//     const importOptions = {
//       autoStatus: 'saved',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'import',
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
//       './WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Comment.ckl'

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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'pass',
//               detail: '',
//               comment: 'xyz',
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 1,
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
//   it(" 'emptyDetail = import' testing that a review with a detail provided will be applied", async () => {
//     const importOptions = {
//       autoStatus: 'saved',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'import',
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
//       './WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Detail.ckl'

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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'pass',
//               detail: 'xyz',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 1,
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

//   it("'emptyComment = replace' testing that if an item has an empty comment we will replace it with a static message", async () => {
//     // replace overwrites it with the static
//     // import will do "" if no detail or give you the provided detail
//     // ignore will give detail = null

//     const importOptions = {
//       autoStatus: 'saved',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'replace',
//       emptyComment: 'replace',
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
//       './WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Detail.ckl'

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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'pass',
//               detail: 'xyz',
//               comment: 'There is no comment provided for the assessment',
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 1,
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
//   it("'emptyComment = ignore' testing that we will use exisitng text, if none use null", async () => {
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
//       './WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Detail.ckl'

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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'pass',
//               detail: 'xyz',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 1,
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
//   it("'emptyComment = import', will clear eixsitng with an empty string if no comment given ", async () => {
//     // replace overwrites it with the static
//     // import will do "" if no detail or give you the provided detail
//     // ignore will give detail = null

//     const importOptions = {
//       autoStatus: 'saved',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'replace',
//       emptyComment: 'import',
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
//       './WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Detail.ckl'

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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'pass',
//               detail: 'xyz',
//               comment: '',
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 1,
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
//   it("'emptyComment = import' to simulate Empty detail text is: Imported. here we will be testing a review with a comment provided in the ckl to make sure we get it back in the review ", async () => {
//     const importOptions = {
//       autoStatus: 'saved',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'replace',
//       emptyComment: 'import',
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
//       './WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Comment.ckl'

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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'pass',
//               detail: 'There is no detail provided for the assessment',
//               comment: 'xyz',
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 1,
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

//   it("autostatus = submitted, testing default field settings with allowAccept=true and a passing review, testing that it has a detail and is 'submitted'", async () => {
//     // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
//     const importOptions = {
//       autoStatus: 'submitted',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'imported',
//       emptyComment: 'imported',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'always', // not used
//         required: 'always'
//       },
//       comment: {
//         enabled: 'findings', // not used
//         required: 'optional'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Detail.ckl'

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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'pass',
//               detail: 'xyz',
//               comment: '',
//               resultEngine: null,
//               status: 'submitted'
//             }
//           ],
//           stats: {
//             pass: 1,
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

//     // expected status is submitted for the rule that has a detail
//   })
//   it('autostatus = submitted, fieldSettings.detail.required = findings with allowAccept=true with a failing review containing a detail, making usre it has a a detail and is submitted ', async () => {
//     // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
//     // if it is not pass/fail/na it will be saved
//     const importOptions = {
//       autoStatus: 'submitted',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'imported',
//       emptyComment: 'imported',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'always', // not used
//         required: 'findings'
//       },
//       comment: {
//         enabled: 'findings', // not used
//         required: 'optional'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/Single-Vuln-fail-With-Detail.ckl'

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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'fail',
//               detail: 'xyz',
//               comment: '',
//               resultEngine: null,
//               status: 'submitted'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 1,
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
//   it("autostatus = submitted, testing 'fieldSettings.detail.required = findings' with allowAccept=true with a fail and no detail or comment, testing that no detail exisitng and it will be set to 'saved'", async () => {
//     // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
//     // if it is not pass/fail/na it will be saved
//     const importOptions = {
//       autoStatus: 'submitted',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'ignore',
//       emptyComment: 'ignore',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'always', // not used
//         required: 'findings'
//       },
//       comment: {
//         enabled: 'findings', // not used
//         required: 'optional'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/Single-Vuln-fail-Empty-CommentDetail.ckl'

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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'fail',
//               detail: null,
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 1,
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

//   it("autostatus = submitted, testing 'fieldSettings.detail.required = optional' with allowAccept=true with a fail and no detail or comment, testing that it does not have a ddtail and is submitted ", async () => {
//     // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
//     // if it is not pass/fail/na it will be saved
//     const importOptions = {
//       autoStatus: 'submitted',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'ignore',
//       emptyComment: 'ignore',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'always', // not used
//         required: 'optional'
//       },
//       comment: {
//         enabled: 'findings', // not used
//         required: 'optional'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/Single-Vuln-fail-Empty-CommentDetail.ckl'

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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'fail',
//               detail: null,
//               comment: null,
//               resultEngine: null,
//               status: 'submitted'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 1,
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
//   it("autostatus = submitted, 'fieldSettings.detail.required = optional' with allowAccept=true with a fail and detail testing it has a detail and is submitted", async () => {
//     // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
//     // if it is not pass/fail/na it will be saved
//     const importOptions = {
//       autoStatus: 'submitted',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'imported',
//       emptyComment: 'imported',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'always', // not used
//         required: 'optional'
//       },
//       comment: {
//         enabled: 'findings', // not used
//         required: 'optional'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/Single-Vuln-fail-With-Detail.ckl'

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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'fail',
//               detail: 'xyz',
//               comment: '',
//               resultEngine: null,
//               status: 'submitted'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 1,
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

//   it('autostatus = submitted, testing default field settings with allowAccept=true and a passing review testing ti has a comment and is submitted', async () => {
//     // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
//     const importOptions = {
//       autoStatus: 'submitted',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'imported',
//       emptyComment: 'imported',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'always', // not used
//         required: 'optional'
//       },
//       comment: {
//         enabled: 'always', // not used
//         required: 'always'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Comment.ckl'

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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'pass',
//               detail: '',
//               comment: 'xyz',
//               resultEngine: null,
//               status: 'submitted'
//             }
//           ],
//           stats: {
//             pass: 1,
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
//   it('autostatus = submitted, fieldSettings.comment.required = findings with allowAccept=true with a fail and comment testing that it has a comment and is submitted', async () => {
//     // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
//     // if it is not pass/fail/na it will be saved
//     const importOptions = {
//       autoStatus: 'submitted',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'imported',
//       emptyComment: 'imported',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'findings', // not used
//         required: 'optional'
//       },
//       comment: {
//         enabled: 'always', // not used
//         required: 'findings'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/Single-Vuln-fail-with-Comment.ckl'

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
//         ip: '10.2.2.2',
//         fqdn: 'hostname',
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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'fail',
//               detail: '',
//               comment: 'xyz',
//               resultEngine: null,
//               status: 'submitted'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 1,
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
//   it("autostatus = submitted, testing 'fieldSettings.comment.required = findings' with allowAccept=true with a fail and no detail or comment, testing that it does not have a comment and is 'saved' ", async () => {
//     // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
//     // if it is not pass/fail/na it will be saved
//     const importOptions = {
//       autoStatus: 'submitted',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'ignore',
//       emptyComment: 'ignore',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'findings', // not used
//         required: 'optional'
//       },
//       comment: {
//         enabled: 'always', // not used
//         required: 'findings'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/Single-Vuln-fail-Empty-CommentDetail.ckl'

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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'fail',
//               detail: null,
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 1,
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

//   it("autostatus = submitted, testing 'fieldSettings.comment.required = optional' with allowAccept=true with a fail and no detail or comment. testing that it doesnt have a comment and is submmited", async () => {
//     // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
//     // if it is not pass/fail/na it will be saved
//     const importOptions = {
//       autoStatus: 'submitted',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'ignore',
//       emptyComment: 'ignore',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'findings', // not used
//         required: 'optional'
//       },
//       comment: {
//         enabled: 'always', // not used
//         required: 'optional'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/Single-Vuln-fail-Empty-CommentDetail.ckl'

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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'fail',
//               detail: null,
//               comment: null,
//               resultEngine: null,
//               status: 'submitted'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 1,
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
//   it("autostatus = submitted, 'fieldSettings.comment.required = optional' with allowAccept=true with a fail and comment, testing thhat it has a comment and is submitted", async () => {
//     // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
//     // if it is not pass/fail/na it will be saved
//     const importOptions = {
//       autoStatus: 'submitted',
//       unreviewed: 'commented',
//       unreviewedCommented: 'informational',
//       emptyDetail: 'imported',
//       emptyComment: 'imported',
//       allowCustom: true
//     }

//     const fieldSettings = {
//       detail: {
//         enabled: 'findings', // not used
//         required: 'optional'
//       },
//       comment: {
//         enabled: 'always', // not used
//         required: 'optional'
//       }
//     }

//     const allowAccept = true

//     const filePath =
//       './WATCHER-test-files/WATCHER/Single-Vuln-fail-with-Comment.ckl'

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
//         ip: '10.2.2.2',
//         fqdn: 'hostname',
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
//               ruleId: 'SV-207191r803418_rule',
//               result: 'fail',
//               detail: '',
//               comment: 'xyz',
//               resultEngine: null,
//               status: 'submitted'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 1,
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
//   it('testing multiStigs for autostatus =  saved and unreviewed = alwasys to ensure we get the same total reviews out as we put in ', async () => {
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

//     const filePath = './WATCHER-test-files/WATCHER/Asset_a-multi-stig.ckl'

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
//           benchmarkId: 'RHEL_8_TRUNCATED',
//           revisionStr: 'V1R12',
//           reviews: [
//             {
//               ruleId: 'SV-230221r858734_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230222r627750_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230223r928585_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230224r917864_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230225r858694_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230226r743916_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230227r627750_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230228r627750_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230229r858739_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230230r627750_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 0,
//             notapplicable: 0,
//             notchecked: 10,
//             notselected: 0,
//             informational: 0,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         },
//         {
//           benchmarkId: 'RHEL_9_TRUNCATED',
//           revisionStr: 'V1R1',
//           reviews: [
//             {
//               ruleId: 'SV-257777r925318_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257778r925321_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257779r925324_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257780r925327_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257781r925330_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257782r925333_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257783r925336_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257784r925339_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257785r925342_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257786r925345_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 0,
//             notapplicable: 0,
//             notchecked: 10,
//             notselected: 0,
//             informational: 0,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         },
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
//   it('testing multiStigs for autostatus = saved and unreviewed = always to ensure that we have all saved reviews ', async () => {
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

//     const filePath = './WATCHER-test-files/WATCHER/Asset_a-multi-stig.ckl'

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
//           benchmarkId: 'RHEL_8_TRUNCATED',
//           revisionStr: 'V1R12',
//           reviews: [
//             {
//               ruleId: 'SV-230221r858734_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230222r627750_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230223r928585_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230224r917864_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230225r858694_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230226r743916_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230227r627750_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230228r627750_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230229r858739_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230230r627750_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 0,
//             notapplicable: 0,
//             notchecked: 10,
//             notselected: 0,
//             informational: 0,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         },
//         {
//           benchmarkId: 'RHEL_9_TRUNCATED',
//           revisionStr: 'V1R1',
//           reviews: [
//             {
//               ruleId: 'SV-257777r925318_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257778r925321_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257779r925324_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257780r925327_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257781r925330_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257782r925333_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257783r925336_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257784r925339_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257785r925342_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257786r925345_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 0,
//             notapplicable: 0,
//             notchecked: 10,
//             notselected: 0,
//             informational: 0,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         },
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

//   it('testing metaData for <WEB_OR_DATABASE>true', async () => {
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

//     const filePath =
//       './WATCHER-test-files/WATCHER/Single-Vuln-fail-WEBORDATABASE-true.ckl'

//     const review = await generateReviewObject(
//       filePath,
//       importOptions,
//       fieldSettings,
//       allowAccept
//     )
//     const expectedObject = {
//       cklRole: 'None',
//       cklWebOrDatabase: 'true',
//       cklHostName: 'Asset_aaaaaaaaaa',
//       cklWebDbSite: 'test'
//     }

//     expect(review.target.metadata).to.deep.equal(expectedObject)
//   })

//   it('testing metaData for <WEB_OR_DATABASE>false', async () => {
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

//     const filePath =
//       './WATCHER-test-files/WATCHER/Single-Vuln-fail-with-Comment.ckl'

//     const review = await generateReviewObject(
//       filePath,
//       importOptions,
//       fieldSettings,
//       allowAccept
//     )

//     expectedObject = {
//       cklRole: 'None'
//     }

//     expect(review.target.metadata).to.deep.equal(expectedObject)
//   })

//   it('testing Multi stig CKL object for default settings', async () => {
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

//     const filePath = './WATCHER-test-files/WATCHER/Asset_a-multi-stig.ckl'

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
//           benchmarkId: 'RHEL_8_TRUNCATED',
//           revisionStr: 'V1R12',
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
//         },
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
//         },
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
//   it('testing Multi stig CKL statistics for alterred settings', async () => {
//     const importOptions = {
//       autoStatus: 'saved',
//       unreviewed: 'always', // this is changed
//       unreviewedCommented: 'notchecked', // this is changed
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

//     const filePath = './WATCHER-test-files/WATCHER/Asset_a-multi-stig.ckl'

//     const review = await generateReviewObject(
//       filePath,
//       importOptions,
//       fieldSettings,
//       allowAccept
//     )

//     console.log(JSON.stringify(review, null, 2))

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
//           benchmarkId: 'RHEL_8_TRUNCATED',
//           revisionStr: 'V1R12',
//           reviews: [
//             {
//               ruleId: 'SV-230221r858734_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230222r627750_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230223r928585_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230224r917864_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230225r858694_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230226r743916_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230227r627750_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230228r627750_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230229r858739_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-230230r627750_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 0,
//             notapplicable: 0,
//             notchecked: 10,
//             notselected: 0,
//             informational: 0,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         },
//         {
//           benchmarkId: 'RHEL_9_TRUNCATED',
//           revisionStr: 'V1R1',
//           reviews: [
//             {
//               ruleId: 'SV-257777r925318_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257778r925321_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257779r925324_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257780r925327_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257781r925330_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257782r925333_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257783r925336_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257784r925339_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257785r925342_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             },
//             {
//               ruleId: 'SV-257786r925345_rule',
//               result: 'notchecked',
//               detail: 'There is no detail provided for the assessment',
//               comment: null,
//               resultEngine: null,
//               status: 'saved'
//             }
//           ],
//           stats: {
//             pass: 0,
//             fail: 0,
//             notapplicable: 0,
//             notchecked: 10,
//             notselected: 0,
//             informational: 0,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         },
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
//               result: 'notchecked',
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
//               result: 'notchecked',
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
//             notchecked: 4,
//             notselected: 0,
//             informational: 0,
//             error: 0,
//             fixed: 0,
//             unknown: 0
//           }
//         }
//       ]
//     }

//     for (const checklist of review.checklists) {
//       expect(checklist.stats).to.deep.equal(expectedObject)
//     }
//   })

//   it('testing Multi stig CKL statistics for alterred settings', async () => {
//     const importOptions = {
//       autoStatus: 'saved',
//       unreviewed: 'never', // this is changed
//       unreviewedCommented: 'informational', // this is changed
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

//     const filePath = './WATCHER-test-files/WATCHER/Asset_a-multi-stig.ckl'

//     const review = await generateReviewObject(
//       filePath,
//       importOptions,
//       fieldSettings,
//       allowAccept
//     )

//     // console.log(JSON.stringify(review, null, 2));

//     const expectedObject = {
//       pass: 3,
//       fail: 2,
//       notapplicable: 1,
//       notchecked: 0,
//       notselected: 0,
//       informational: 0,
//       error: 0,
//       fixed: 0,
//       unknown: 0
//     }

//     for (const checklist of review.checklists) {
//       expect(checklist.stats).to.deep.equal(expectedObject)
//     }
//   })
// })




// // I will break down all tests according to the part of the data (check)

// // I already have tests for almost everything effecting the reviews array object. I will just add additional checks for things within that object  (check)

// // I will also ensure that I have all permutations done already for that cuz that is what is going to be my building block for the rest of the tests. (check)

// // I will then add tests for the target object and determine if i need to use all permutations of the setings (check)

// // I will then add tests for the metadata object in target and determine if i need to use all permutations of the setings (check)

// // I will then add tests for the checklist benchmarkid and revisionStr and determine if i need to use all permutations of the setings (now)

// // I will then add tests for the checklist stats object NEEDS ALL PERMUTATIONS

// // I will then see what multistig tests I can add that are not already covered by the above tests, will need to look at the code to determine what is not covered.

// // 