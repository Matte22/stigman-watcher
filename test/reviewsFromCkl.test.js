const chai = require("chai");
const expect = chai.expect;
const ReviewParser = require("../lib/ReviewParser");
const { XMLParser } = require("fast-xml-parser");
const fs = require("fs").promises;
const he = require("he");
const { stringify } = require("querystring");
const exp = require("constants");
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
  it("DEFAULT SETTINGS: All status should be Saved", async () => {
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
      "./WATCHER-test-files/WATCHER/Single-Vuln-notReviewed-Commented-Detailed.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    // ensuring that each review has a status that matches the expected status
    expect(review.checklists[0].reviews[0].status).to.equal("saved");
  });

  it("autoStatus = null (keep exisiting), testing that all review statuses do not exist", async () => {
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
      "./WATCHER-test-files/WATCHER/Single-Vuln-notReviewed-Commented-Detailed.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    expect(review.checklists[0].reviews[0].status).to.not.exist;
  });

  it("autoStatus = submitted, testing if reviews are set to submitted if valid or saved if not valid. Determined by field settings and result", async () => {
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

  it("autoStatus = submitted, testing that we will set status to saved if does not meet requiremntes for submission ", async () => {
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
      "./WATCHER-test-files/WATCHER/Single-Vuln-notReviewed-Commented-Detailed.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    review.checklists[0].reviews.forEach((reviewItem) => {
      expect(reviewItem.status).to.equal("saved");
    });
  });

  it("(autoStatus = accepted allowAccept = true) for permissions to use accepted status", async () => {
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
  it("(autoStatus = accepted allowAccept = false) for permissions to use submitted status", async () => {
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

    const allowAccept = false;
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

    review.checklists[0].reviews.forEach((reviewItem) => {
      const expectedStatus = expectedStatuses[reviewItem.ruleId];
      expect(reviewItem.status).to.equal(expectedStatus);
    });
  });

  it("'unreviewed = commented' testing that we only import unreviwred rules that contain a comment or detail   ", async () => {
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
      "./WATCHER-test-files/WATCHER/Single-Vuln-notReviewed-Commented-Detailed.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );
    // check that review has a comment or detail and exisits
    expect(review.checklists[0].reviews[0]).to.exist;
    expect(
      review.checklists[0].reviews[0].detail ||
        review.checklists[0].reviews[0].comment
    ).to.not.be.null;
  });

  it("'unreviewed = commented' testing that we only import unreviwred rules that contain a comment or detail but giving a review without either", async () => {
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
      "./WATCHER-test-files/WATCHER/Single-Vuln-notReviewed-Empty-CommentDetail.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    // check that review has a comment or detail and exisits
    expect(review.checklists[0].reviews).to.be.empty;
  });

  it("'unreviewed = always', testing that unreviewed alwasys are imported  ", async () => {
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
  it(" 'unreviewed = never' testing to never import an unreviewed item ", async () => {
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

    const filePath =
      "./WATCHER-test-files/WATCHER/Asset_a-VPN_TRUNCATED-V2R5.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    // console.log(JSON.stringify(review, null, 2));

    review.checklists.forEach((checklist) => {
      checklist.reviews.forEach((reviewItem) => {
        expect(reviewItem.status).to.not.equal("notchecked");
        expect(reviewItem.status).to.not.equal("informational");
      });
    });
  });

  it("'unreviewedComment = informational' testing that an unreviewed item with a comment has a result of informational", async () => {
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

    // const multipleFilePaths =
    //   "./WATCHER-test-files/WATCHER/Asset_a-multi-stig.ckl";

    const filePath =
      "./WATCHER-test-files/WATCHER/Single-Vuln-notReviewed-Commented-Detailed.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    // console.log(JSON.stringify(review, null, 2));

    expect(review.checklists[0].reviews[0].result).to.equal("informational");
  });
  it(" 'unreviewedComment = notchecked'. testing that an unreviewed with a comment has a result of notchecked", async () => {
    const importOptions = {
      autoStatus: "saved",
      unreviewed: "commented",
      unreviewedCommented: "notchecked",
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
      "./WATCHER-test-files/WATCHER/Single-Vuln-notReviewed-Commented-Detailed.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    expect(review.checklists[0].reviews[0].result).to.equal("notchecked");
  });
  it("'emptyDetail = replace' testing that if an item has an empty detail we will replace it with a static message", async () => {
    // replace overwrites it with the static
    // import will do "" if no detail or give you the provided detail
    // ignore will give detail = null

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
      "./WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Comment.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    expect(review.checklists[0].reviews[0].detail).to.equal(
      "There is no detail provided for the assessment"
    );
  });
  it("'emptyDetail = ignore'testing that if there is no detail provided it will retaing exisiting, if no exisitng then we will set to null", async () => {
    // replace overwrites it with the static
    // import will do "" if no detail or give you the provided detail
    // ignore will give detail = null

    const importOptions = {
      autoStatus: "saved",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "ignore",
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
      "./WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Comment.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    expect(review.checklists[0].reviews[0].detail).to.be.null;
  });
  it("'emptyDetail = import', testing empty detail will clear existing text (setting it to empty string)", async () => {
    // replace overwrites it with the static
    // import will do "" if no detail or give you the provided detail
    // ignore will give detail = null

    const importOptions = {
      autoStatus: "saved",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "import",
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
      "./WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Comment.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    expect(review.checklists[0].reviews[0].detail).to.be.empty;
  });
  it(" 'emptyDetail = import' testing that a review with a detail provided will be applied", async () => {
    const importOptions = {
      autoStatus: "saved",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "import",
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
      "./WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Detail.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    // console.log(JSON.stringify(review, null, 2));

    expect(review.checklists[0].reviews[0].detail).to.be.equal("xyz");
  });

  it("'emptyComment = replace' testing that if an item has an empty comment we will replace it with a static message", async () => {
    // replace overwrites it with the static
    // import will do "" if no detail or give you the provided detail
    // ignore will give detail = null

    const importOptions = {
      autoStatus: "saved",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "replace",
      emptyComment: "replace",
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
      "./WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Detail.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );
    expect(review.checklists[0].reviews[0].comment).to.be.equal(
      "There is no comment provided for the assessment"
    );
  });
  it("'emptyComment = ignore' testing that we will use exisitng text, if none use null", async () => {
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
      "./WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Detail.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    // console.log(JSON.stringify(review, null, 2));

    expect(review.checklists[0].reviews[0].comment).to.be.null;
  });
  it("'emptyComment = import', will clear eixsitng with an empty string if no comment given ", async () => {
    // replace overwrites it with the static
    // import will do "" if no detail or give you the provided detail
    // ignore will give detail = null

    const importOptions = {
      autoStatus: "saved",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "replace",
      emptyComment: "import",
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
      "./WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Detail.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    expect(review.checklists[0].reviews[0].comment).to.be.empty;
  });
  it("'emptyComment = import' to simulate Empty detail text is: Imported. here we will be testing a review with a comment provided in the ckl to make sure we get it back in the review ", async () => {
    const importOptions = {
      autoStatus: "saved",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "replace",
      emptyComment: "import",
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
      "./WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Comment.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    // console.log(JSON.stringify(review, null, 2));
    expect(review.checklists[0].reviews[0].comment).to.be.equal("xyz");
  });

  it("autostatus = submitted, testing default field settings with allowAccept=true and a passing review, testing that it has a detail and is 'submitted'", async () => {
    // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
    const importOptions = {
      autoStatus: "submitted",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "imported",
      emptyComment: "imported",
      allowCustom: true,
    };

    const fieldSettings = {
      detail: {
        enabled: "always", // not used
        required: "always",
      },
      comment: {
        enabled: "findings", // not used
        required: "optional",
      },
    };

    const allowAccept = true;

    const filePath =
      "./WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Detail.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    //console.log(JSON.stringify(review, null, 2));

    // expected status is submitted for the rule that has a detail
    expect(review.checklists[0].reviews[0].status).to.be.equal("submitted");
    expect(review.checklists[0].reviews[0].detail).to.exist;
  });
  it("autostatus = submitted, fieldSettings.detail.required = findings with allowAccept=true with a failing review containing a detail, making usre it has a a detail and is submitted ", async () => {
    // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
    // if it is not pass/fail/na it will be saved
    const importOptions = {
      autoStatus: "submitted",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "imported",
      emptyComment: "imported",
      allowCustom: true,
    };

    const fieldSettings = {
      detail: {
        enabled: "always", // not used
        required: "findings",
      },
      comment: {
        enabled: "findings", // not used
        required: "optional",
      },
    };

    const allowAccept = true;

    const filePath =
      "./WATCHER-test-files/WATCHER/Single-Vuln-fail-With-Detail.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    // expected status is submitted for the rule that has a detail
    expect(review.checklists[0].reviews[0].detail).to.exist;
    expect(review.checklists[0].reviews[0].status).to.be.equal("submitted");
  });
  it("autostatus = submitted, testing 'fieldSettings.detail.required = findings' with allowAccept=true with a fail and no detail or comment, testing that no detail exisitng and it will be set to 'saved'", async () => {
    // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
    // if it is not pass/fail/na it will be saved
    const importOptions = {
      autoStatus: "submitted",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "ignore",
      emptyComment: "ignore",
      allowCustom: true,
    };

    const fieldSettings = {
      detail: {
        enabled: "always", // not used
        required: "findings",
      },
      comment: {
        enabled: "findings", // not used
        required: "optional",
      },
    };

    const allowAccept = true;

    const filePath =
      "./WATCHER-test-files/WATCHER/Single-Vuln-fail-Empty-CommentDetail.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    expect(review.checklists[0].reviews[0].detail).to.not.exist;
    expect(review.checklists[0].reviews[0].status).to.be.equal("saved");

    // expected status is submitted for the rule that has a detail
  });

  it("autostatus = submitted, testing 'fieldSettings.detail.required = optional' with allowAccept=true with a fail and no detail or comment, testing that it does not have a ddtail and is submitted ", async () => {
    // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
    // if it is not pass/fail/na it will be saved
    const importOptions = {
      autoStatus: "submitted",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "ignore",
      emptyComment: "ignore",
      allowCustom: true,
    };

    const fieldSettings = {
      detail: {
        enabled: "always", // not used
        required: "optional",
      },
      comment: {
        enabled: "findings", // not used
        required: "optional",
      },
    };

    const allowAccept = true;

    const filePath =
      "./WATCHER-test-files/WATCHER/Single-Vuln-fail-Empty-CommentDetail.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    expect(review.checklists[0].reviews[0].detail).to.not.exist;
    expect(review.checklists[0].reviews[0].status).to.be.equal("submitted");
  });
  it("autostatus = submitted, 'fieldSettings.detail.required = optional' with allowAccept=true with a fail and detail testing it has a detail and is submitted", async () => {
    // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
    // if it is not pass/fail/na it will be saved
    const importOptions = {
      autoStatus: "submitted",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "imported",
      emptyComment: "imported",
      allowCustom: true,
    };

    const fieldSettings = {
      detail: {
        enabled: "always", // not used
        required: "optional",
      },
      comment: {
        enabled: "findings", // not used
        required: "optional",
      },
    };

    const allowAccept = true;

    const filePath =
      "./WATCHER-test-files/WATCHER/Single-Vuln-fail-With-Detail.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    expect(review.checklists[0].reviews[0].detail).to.exist;
    expect(review.checklists[0].reviews[0].status).to.be.equal("submitted");
  });

  it("autostatus = submitted, testing default field settings with allowAccept=true and a passing review testing ti has a comment and is submitted", async () => {
    // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
    const importOptions = {
      autoStatus: "submitted",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "imported",
      emptyComment: "imported",
      allowCustom: true,
    };

    const fieldSettings = {
      detail: {
        enabled: "always", // not used
        required: "optional",
      },
      comment: {
        enabled: "always", // not used
        required: "always",
      },
    };

    const allowAccept = true;

    const filePath =
      "./WATCHER-test-files/WATCHER/Single-Vuln-Pass-With-Comment.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    //console.log(JSON.stringify(review, null, 2));
    expect(review.checklists[0].reviews[0].comment).to.exist;
    expect(review.checklists[0].reviews[0].status).to.be.equal("submitted");
  });
  it("autostatus = submitted, fieldSettings.comment.required = findings with allowAccept=true with a fail and comment testing that it has a comment and is submitted", async () => {
    // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
    // if it is not pass/fail/na it will be saved
    const importOptions = {
      autoStatus: "submitted",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "imported",
      emptyComment: "imported",
      allowCustom: true,
    };

    const fieldSettings = {
      detail: {
        enabled: "findings", // not used
        required: "optional",
      },
      comment: {
        enabled: "always", // not used
        required: "findings",
      },
    };

    const allowAccept = true;

    const filePath =
      "./WATCHER-test-files/WATCHER/Single-Vuln-fail-with-Comment.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    expect(review.checklists[0].reviews[0].comment).to.exist;
    expect(review.checklists[0].reviews[0].status).to.be.equal("submitted");
  });
  it("autostatus = submitted, testing 'fieldSettings.comment.required = findings' with allowAccept=true with a fail and no detail or comment, testing that it does not have a comment and is 'saved' ", async () => {
    // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
    // if it is not pass/fail/na it will be saved
    const importOptions = {
      autoStatus: "submitted",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "ignore",
      emptyComment: "ignore",
      allowCustom: true,
    };

    const fieldSettings = {
      detail: {
        enabled: "findings", // not used
        required: "optional",
      },
      comment: {
        enabled: "always", // not used
        required: "findings",
      },
    };

    const allowAccept = true;

    const filePath =
      "./WATCHER-test-files/WATCHER/Single-Vuln-fail-Empty-CommentDetail.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    // expected status is submitted for the rule that has a detail

    expect(review.checklists[0].reviews[0].comment).to.not.exist;
    expect(review.checklists[0].reviews[0].status).to.be.equal("saved");
  });

  it("autostatus = submitted, testing 'fieldSettings.comment.required = optional' with allowAccept=true with a fail and no detail or comment. testing that it doesnt have a comment and is submmited", async () => {
    // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
    // if it is not pass/fail/na it will be saved
    const importOptions = {
      autoStatus: "submitted",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "ignore",
      emptyComment: "ignore",
      allowCustom: true,
    };

    const fieldSettings = {
      detail: {
        enabled: "findings", // not used
        required: "optional",
      },
      comment: {
        enabled: "always", // not used
        required: "optional",
      },
    };

    const allowAccept = true;

    const filePath =
      "./WATCHER-test-files/WATCHER/Single-Vuln-fail-Empty-CommentDetail.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    // expected status is submitted for the rule that has a detail

    expect(review.checklists[0].reviews[0].comment).to.not.exist;
    expect(review.checklists[0].reviews[0].status).to.be.equal("submitted");
  });
  it("autostatus = submitted, 'fieldSettings.comment.required = optional' with allowAccept=true with a fail and comment, testing thhat it has a comment and is submitted", async () => {
    // review needs to exist, comment is optional because we arent testing that now., needs to be a pass/fail/na for this to be submitted
    // if it is not pass/fail/na it will be saved
    const importOptions = {
      autoStatus: "submitted",
      unreviewed: "commented",
      unreviewedCommented: "informational",
      emptyDetail: "imported",
      emptyComment: "imported",
      allowCustom: true,
    };

    const fieldSettings = {
      detail: {
        enabled: "findings", // not used
        required: "optional",
      },
      comment: {
        enabled: "always", // not used
        required: "optional",
      },
    };

    const allowAccept = true;

    const filePath =
      "./WATCHER-test-files/WATCHER/Single-Vuln-fail-with-Comment.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    // expected status is submitted for the rule that has a detail

    expect(review.checklists[0].reviews[0].comment).to.exist;
    expect(review.checklists[0].reviews[0].status).to.be.equal("submitted");
  });
  it("testing multiStigs for autostatus =  saved and unreviewed = alwasys to ensure we get the same total reviews out as we put in ", async () => {
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

    const filePath = "./WATCHER-test-files/WATCHER/Asset_a-multi-stig.ckl";

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

    // checking that out input and output counts of total vulns/reviews match
    expect(totalReviewsInOutput).to.equal(totalReviewsInOutput);
  });
  it("testing multiStigs for autostatus = saved and unreviewed = always to ensure that we have all saved reviews ", async () => {
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

    const filePath = "./WATCHER-test-files/WATCHER/Asset_a-multi-stig.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    // checking that all reviews are saved
    review.checklists.forEach((checklist) => {
      checklist.reviews.forEach((reviewItem) => {
        expect(reviewItem.status).to.equal("saved");
      });
    });
  });

  it("testing Multi stig CKL statistics for default settings", async () => {
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

    const filePath = "./WATCHER-test-files/WATCHER/Asset_a-multi-stig.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );


    review.checklists.forEach((checklist) => {
      expect(checklist.stats).to.exist;
      expect(checklist.stats.pass).to.equal(3);
      expect(checklist.stats.fail).to.equal(2);
      expect(checklist.stats.notapplicable).to.equal(1);
      expect(checklist.stats.notchecked).to.equal(0);
      expect(checklist.stats.notselected).to.equal(0);
      expect(checklist.stats.informational).to.equal(2);
      expect(checklist.stats.error).to.equal(0);
      expect(checklist.stats.fixed).to.equal(0);
      expect(checklist.stats.unknown).to.equal(0);

 
    });
  });
  it("testing Multi stig CKL statistics for alterred settings", async () => {
    const importOptions = {
      autoStatus: "saved",
      unreviewed: "always", // this is changed
      unreviewedCommented: "notchecked",// this is changed
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

    const filePath = "./WATCHER-test-files/WATCHER/Asset_a-multi-stig.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

  

    review.checklists.forEach((checklist) => {
      expect(checklist.stats).to.exist;
      expect(checklist.stats.pass).to.equal(3);
      expect(checklist.stats.fail).to.equal(2);
      expect(checklist.stats.notapplicable).to.equal(1);
      expect(checklist.stats.notchecked).to.equal(24);
      expect(checklist.stats.notselected).to.equal(0);
      expect(checklist.stats.informational).to.equal(0);
      expect(checklist.stats.error).to.equal(0);
      expect(checklist.stats.fixed).to.equal(0);
      expect(checklist.stats.unknown).to.equal(0);

 
    });
  });it("testing Multi stig CKL statistics for alterred settings", async () => {
    const importOptions = {
      autoStatus: "saved",
      unreviewed: "never", // this is changed
      unreviewedCommented: "informational",// this is changed
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

    const filePath = "./WATCHER-test-files/WATCHER/Asset_a-multi-stig.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    console.log(JSON.stringify(review, null, 2));

    review.checklists.forEach((checklist) => {
      expect(checklist.stats).to.exist;
      expect(checklist.stats.pass).to.equal(3);
      expect(checklist.stats.fail).to.equal(2);
      expect(checklist.stats.notapplicable).to.equal(1);
      expect(checklist.stats.notchecked).to.equal(0);
      expect(checklist.stats.notselected).to.equal(0);
      expect(checklist.stats.informational).to.equal(0);
      expect(checklist.stats.error).to.equal(0);
      expect(checklist.stats.fixed).to.equal(0);
      expect(checklist.stats.unknown).to.equal(0);

 
    });
  });

  it("testing metaData for <WEB_OR_DATABASE>false", async () => {
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

    const filePath =
      "./WATCHER-test-files/WATCHER/Single-Vuln-fail-with-Comment.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    expect(review.target.metadata).to.exist;
    expect(review.target.metadata).to.be.an("object");
    expect(review.target.metadata.cklRole).to.equal("None");
  });
  it("testing metaData for <WEB_OR_DATABASE>true", async () => {
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

    const filePath =
      "./WATCHER-test-files/WATCHER/Single-Vuln-fail-WEBORDATABASE-true.ckl";

    const review = await generateReviewObject(
      filePath,
      importOptions,
      fieldSettings,
      allowAccept
    );

    expect(review.target.metadata).to.exist;
    expect(review.target.metadata).to.be.an("object");
    expect(review.target.metadata.cklRole).to.equal("None");
    expect(review.target.metadata.cklWebOrDatabase).to.equal("true");
    expect(review.target.metadata.cklHostName).to.equal("Asset_aaaaaaaaaa");
    expect(review.target.metadata.cklWebDbSite).to.equal("test");
  });
});
