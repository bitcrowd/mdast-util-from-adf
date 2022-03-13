export default {
  version: 1,
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Hello ",
        },
        {
          type: "text",
          text: "ADF",
          marks: [
            {
              type: "link",
              attrs: {
                href: "https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/",
              },
            },
            {
              type: "strong",
            },
          ],
        },
        {
          type: "text",
          text: "!",
        },
      ],
    },
  ],
};
