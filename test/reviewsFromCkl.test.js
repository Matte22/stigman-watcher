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
    const data = await fs.readFile(filePath, "utf8");

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

    const review = ReviewParser.reviewsFromCkl({
      data,
      importOptions,
      fieldSettings,
      allowAccept,
      valueProcessor,
      XMLParser,
    });
    
      // ensuring that each review has a status that matches the expected status
      review.checklists[0].reviews.forEach((reviewItem) => {
        const expectedStatus = expectedStatuses[reviewItem.ruleId];
        expect(reviewItem.status).to.equal(expectedStatus);
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

    const data = await fs.readFile(filePath, "utf8");

    const review = ReviewParser.reviewsFromCkl({
      data,
      importOptions,
      fieldSettings,
      allowAccept,
      valueProcessor,
      XMLParser,
    });
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

    const data = await fs.readFile(filePath, "utf8");

    const review = ReviewParser.reviewsFromCkl({
      data,
      importOptions,
      fieldSettings,
      allowAccept,
      valueProcessor,
      XMLParser,
    });

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
    const data = await fs.readFile(filePath, "utf8");

    const review = ReviewParser.reviewsFromCkl({
      data,
      importOptions,
      fieldSettings,
      allowAccept,
      valueProcessor,
      XMLParser,
    });
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
    review.checklists.forEach((checklist) => {
      checklist.reviews.forEach((reviewItem) => {
        const expectedStatus = expectedStatuses[reviewItem.ruleId];
        expect(reviewItem.status).to.equal(expectedStatus);
      });
    });
  });

  it("generates review object with 'unreviewed = commented' to simulate include unrevieweed rules: Having Comments ", async () => {
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

    const data = await fs.readFile(filePath, "utf8");

    const review = ReviewParser.reviewsFromCkl({
      data,
      importOptions,
      fieldSettings,
      allowAccept,
      valueProcessor,
      XMLParser,
    });

    
    review.checklists[0].reviews.forEach((reviewItem) => {
      // expcet that each review has a commment value or detail value that != null
      expect(reviewItem.detail || reviewItem.comment).to.not.be.null;
    })
  });

  it("generates review object with 'unreviewed = always' to simulate include unrevieweed rules: Always ", async () => {
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
      "./WATCHER-test-files/WATCHER/Asset_a-VPN_TRUNCATED-V2R5.ckl";

    const data = await fs.readFile(filePath, "utf8");

    const review = ReviewParser.reviewsFromCkl({
      data,
      importOptions,
      fieldSettings,
      allowAccept,
      valueProcessor,
      XMLParser,
    });

//console.log(JSON.stringify(review, null, 2));

    // const expectedNumberOfReviews = 8;
    // const reviews = review.checklists[0].reviews;
    // const filteredReviews = reviews.filter((r) => r.detail || r.comment);

    // expect(filteredReviews).to.have.lengthOf(expectedNumberOfReviews);

    // filteredReviews.forEach((reviewItem) => {
    //   expect(reviewItem).to.have.all.keys(
    //     "ruleId",
    //     "result",
    //     "detail",
    //     "comment",
    //     "resultEngine",
    //     "status"
    //   );
    // });
  });
});
