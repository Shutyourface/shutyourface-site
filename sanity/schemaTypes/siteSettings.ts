import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "historyFeatureLive",
      title: "History Feature Live",
      description: "Enable the 'On This Day' tab and teaser on the public homepage. Build history pages privately first, then flip this on when ready to launch.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
