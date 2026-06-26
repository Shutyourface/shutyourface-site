import { defineField, defineType } from "sanity";

export const historyStory = defineType({
  name: "historyStory",
  title: "History Story",
  type: "document",
  fields: [
    defineField({
      name: "historyDate",
      title: "History Date (MM-DD)",
      type: "string",
      description: "e.g. 06-24",
      validation: (Rule) => Rule.required().regex(/^\d{2}-\d{2}$/, { name: "MM-DD format" }),
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subheadline",
      title: "Subheadline",
      type: "string",
    }),
    defineField({
      name: "url",
      title: "Link URL",
      type: "url",
    }),
    defineField({
      name: "imageUrl",
      title: "Image URL",
      type: "url",
    }),
    defineField({
      name: "imageHidden",
      title: "Hide Image",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
    }),
    defineField({
      name: "originalEvent",
      title: "Original Event Text",
      type: "text",
    }),
    defineField({
      name: "placement",
      title: "Placement on History Page",
      type: "string",
      options: {
        list: [
          { title: "Hero", value: "hero" },
          { title: "Left Side", value: "left" },
          { title: "Right Side", value: "right" },
          { title: "Chaos Wall", value: "chaos" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "secondaryLinkEnabled",
      title: "Add Secondary Story Link",
      description: "Show a boxed secondary link below the subheadline (hero placement only).",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "secondaryLinkHeadline",
      title: "Secondary Link Headline",
      type: "string",
    }),
    defineField({
      name: "secondaryLinkUrl",
      title: "Secondary Link URL",
      type: "url",
    }),
    defineField({
      name: "featureOnHomepage",
      title: "Feature on Homepage",
      description: "Show this as a teaser on the main homepage.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "isActive",
      title: "Active (visible on site)",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "headline",
      subtitle: "historyDate",
      year: "year",
    },
    prepare({ title, subtitle, year }) {
      return {
        title,
        subtitle: `📅 ${subtitle}${year ? ` · ${year}` : ""}`,
      };
    },
  },
});
