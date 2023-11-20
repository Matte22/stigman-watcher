const chai = require("chai");
const expect = chai.expect;
const ReviewParser = require("../lib/ReviewParser");
const { XMLParser } = require("fast-xml-parser");
const fs = require("fs").promises;
const he = require("he");
const { stringify } = require("querystring");
const valueProcessor = function (
  tagName,
  tagValue,
  jPath,
  hasAttributes,
  isLeafNode
) {
  he.decode(tagValue);
};

// Create a helper function to read the file and generate the review object
async function generateReviewObject(
  filePath,
  importOptions,
  fieldSettings,
  allowAccept
) {
  const data = await fs.readFile(filePath, "utf8");
  return ReviewParser.reviewsFromCkl({
    data,
    importOptions,
    fieldSettings,
    allowAccept,
    valueProcessor,
    XMLParser,
  });
}
const parseOptions = {
  allowBooleanAttributes: false,
  attributeNamePrefix: "",
  cdataPropName: "__cdata", //default is 'false'
  ignoreAttributes: false,
  parseTagValue: false,
  parseAttributeValue: false,
  removeNSPrefix: true,
  trimValues: true,
  tagValueProcessor: valueProcessor,
  commentPropName: "__comment",
  isArray: (name, jpath, isLeafNode, isAttribute) => {
    return name === "__comment" || !isLeafNode;
  },
};

async function getTotalVulnCount(filePath) {
  const data = await fs.readFile(filePath, "utf8");
  const parser = new XMLParser(parseOptions);
  const parsed = parser.parse(data);

  let totalVulnCount = 0;
  parsed.CHECKLIST.forEach((checklist) => {
    checklist.STIGS.forEach((stigs) => {
      stigs.iSTIG.forEach((stig) => {
        totalVulnCount += stig.VULN.length;
      });
    });
  });

  return totalVulnCount;
}

describe("generateReview from CKL", () => {
  it("generates review object with default settings", async () => {
    const importOptions = {
      autoStatus: "saved",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "replace",
      emptyComment: "ignore",
      allowCustom: true,
    };

    const fieldSettings = {
      detail: {
        enabled: "always",
        required: "always",
      },
      comment: {
        enabled: "findings",
        required: "findings",
      },
    };

    const allowAccept = true;

    const filePath =
      "./WATCHER-test-files/WATCHER/Asset_a-VPN_TRUNCATED-V2R5.ckl";

    // expected statuses for each rule
    const expectedStatuses = {
      "SV-207184r695317_rule": "saved",
      "SV-207185r608988_rule": "saved",
      "SV-207186r608988_rule": "saved",
      "SV-207187r608988_rule": "saved",
      "SV-207188r608988_rule": "saved",
      "SV-207189r608988_rule": "saved",
      "SV-207190r803417_rule": "saved",
      "SV-207191r803418_rule": "saved",
    };

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    // ensuring that each review has a status that matches the expected status
    review.checklists.forEach((checklist) => {
      checklist.reviews.forEach((reviewItem) => {
        const expectedStatus = expectedStatuses[reviewItem.ruleId];
        expect(reviewItem.status).to.equal(expectedStatus);
      });
    });
  });

  it("generates review object with autoStatus = null to simulate set Review Status to: Keep Exisiting ", async () => {
    const importOptions = {
      autoStatus: "null",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "replace",
      emptyComment: "ignore",
      allowCustom: true,
    };

    const fieldSettings = {
      detail: {
        enabled: "always",
        required: "always",
      },
      comment: {
        enabled: "findings",
        required: "findings",
      },
    };

    const allowAccept = true;

    const filePath =
      "./WATCHER-test-files/WATCHER/Asset_a-VPN_TRUNCATED-V2R5.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    // ensuring that each review does not have a status

    review.checklists.forEach((checklist) => {
      checklist.reviews.forEach((reviewItem) => {
        expect(reviewItem.status).to.not.exist;
      });
    });
  });

  it("generates review object with autoStatus = submitted to simulate set Review Status to: Submitted ", async () => {
    const importOptions = {
      autoStatus: "submitted",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "replace",
      emptyComment: "ignore",
      allowCustom: true,
    };

    const fieldSettings = {
      detail: {
        enabled: "always",
        required: "always",
      },
      comment: {
        enabled: "findings",
        required: "findings",
      },
    };

    const allowAccept = true;

    const filePath =
      "./WATCHER-test-files/WATCHER/Asset_a-VPN_TRUNCATED-V2R5.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    // expected statuses for each rule
    const expectedStatuses = {
      "SV-207184r695317_rule": "submitted",
      "SV-207185r608988_rule": "saved",
      "SV-207186r608988_rule": "submitted",
      "SV-207187r608988_rule": "saved",
      "SV-207188r608988_rule": "submitted",
      "SV-207189r608988_rule": "saved",
      "SV-207190r803417_rule": "submitted",
      "SV-207191r803418_rule": "submitted",
    };

    // ensuring that each review has a status that matches the expected status
    review.checklists.forEach((checklist) => {
      checklist.reviews.forEach((reviewItem) => {
        const expectedStatus = expectedStatuses[reviewItem.ruleId];
        expect(reviewItem.status).to.equal(expectedStatus);
      });
    });
  });

  it("generates review object with autoStatus = accepted to simulate set Review Status to: Accepted ", async () => {
    const importOptions = {
      autoStatus: "accepted",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "replace",
      emptyComment: "ignore",
      allowCustom: true,
    };

    const fieldSettings = {
      detail: {
        enabled: "always",
        required: "always",
      },
      comment: {
        enabled: "findings",
        required: "findings",
      },
    };

    const allowAccept = true;
    const filePath =
      "./WATCHER-test-files/WATCHER/Asset_a-VPN_TRUNCATED-V2R5.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );
    // expected statuses for each rule
    const expectedStatuses = {
      "SV-207184r695317_rule": "accepted",
      "SV-207185r608988_rule": "saved",
      "SV-207186r608988_rule": "accepted",
      "SV-207187r608988_rule": "saved",
      "SV-207188r608988_rule": "accepted",
      "SV-207189r608988_rule": "saved",
      "SV-207190r803417_rule": "accepted",
      "SV-207191r803418_rule": "accepted",
    };
    // ensuring that each review has a status that matches the expected status

    review.checklists[0].reviews.forEach((reviewItem) => {
      const expectedStatus = expectedStatuses[reviewItem.ruleId];
      expect(reviewItem.status).to.equal(expectedStatus);
    });
  });

  it("generates review object with 'unreviewed = commented' to simulate include unreviewed rules: Having Comments ", async () => {
    const importOptions = {
      autoStatus: "saved",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "replace",
      emptyComment: "ignore",
      allowCustom: true,
    };

    const fieldSettings = {
      detail: {
        enabled: "always",
        required: "always",
      },
      comment: {
        enabled: "findings",
        required: "findings",
      },
    };

    const allowAccept = true;

    const filePath =
      "./WATCHER-test-files/WATCHER/Asset_a-VPN_TRUNCATED-V2R5.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    review.checklists.forEach((checklist) => {
      checklist.reviews.forEach((reviewItem) => {
        // expcet that each review has a commment value or detail value that != null
        expect(reviewItem.detail || reviewItem.comment).to.not.be.null;
      });
    });
  });

  it("generates review object with 'unreviewed = always' to simulate include unreviewed rules: Always ", async () => {
    const importOptions = {
      autoStatus: "saved",
      unreviewed: "always",
      unreviewedCommented: "informational",
      emptyDetail: "replace",
      emptyComment: "ignore",
      allowCustom: true,
    };

    const fieldSettings = {
      detail: {
        enabled: "always",
        required: "always",
      },
      comment: {
        enabled: "findings",
        required: "findings",
      },
    };

    const allowAccept = true;

    // const multipleFilePaths =
    //   "./WATCHER-test-files/WATCHER/Asset_a-multi-stig.ckl";

    const filePath =
      "./WATCHER-test-files/WATCHER/Asset_a-VPN_TRUNCATED-V2R5.ckl";

    const totalReviewsPreProcessed = await getTotalVulnCount(filePath);

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    const totalReviewsInOutput = review.checklists.reduce(
      (acc, checklist) => acc + checklist.reviews.length,
      0
    );

    console.log(JSON.stringify(review, null, 2));

    // Assert that the total counts match
    expect(totalReviewsInOutput).to.equal(
      totalReviewsPreProcessed,
      "The total number of reviews should match the total VULN items in source data"
    );

    review.checklists.forEach((checklist) => {
      checklist.reviews.forEach((reviewItem) => {
        const hasComments = !!reviewItem.comment || !!reviewItem.detail;
        if (reviewItem.status === "notchecked") {
          if (hasComments) {
            expect(reviewItem.status).to.equal(
              importOptions.unreviewedCommented
            );
          } else {
            expect(reviewItem.status).to.equal("notchecked");
          }
        }
      });
    });
  });
  it("generates review object with 'unreviewed = never' to simulate include unreviewed rules: Never ", async () => {
    const importOptions = {
      autoStatus: "saved",
      unreviewed: "never",
      unreviewedCommented: "informational",
      emptyDetail: "replace",
      emptyComment: "ignore",
      allowCustom: true,
    };

    const fieldSettings = {
      detail: {
        enabled: "always",
        required: "always",
      },
      comment: {
        enabled: "findings",
        required: "findings",
      },
    };

    const allowAccept = true;

    // const multipleFilePaths =
    //   "./WATCHER-test-files/WATCHER/Asset_a-multi-stig.ckl";

    const filePath =
      "./WATCHER-test-files/WATCHER/Asset_a-VPN_TRUNCATED-V2R5.ckl";

    const totalReviewsPreProcessed = await getTotalVulnCount(filePath);

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    const totalReviewsInOutput = review.checklists.reduce(
      (acc, checklist) => acc + checklist.reviews.length,
      0
    );

    console.log(JSON.stringify(review, null, 2));

    // Assert that the total counts match
    expect(totalReviewsInOutput).to.equal(
      totalReviewsPreProcessed,
      "The total number of reviews should match the total VULN items in source data"
    );

    review.checklists.forEach((checklist) => {
      checklist.reviews.forEach((reviewItem) => {
        const hasComments = !!reviewItem.comment || !!reviewItem.detail;
        if (reviewItem.status === "notchecked") {
          if (hasComments) {
            expect(reviewItem.status).to.equal(
              importOptions.unreviewedCommented
            );
          } else {
            expect(reviewItem.status).to.equal("notchecked");
          }
        }
      });
    });
  });
});
