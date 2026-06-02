import { defineField, defineType } from "sanity";

export const story = defineType({
  name: "story",
  title: "Story",
  type: "document",
  fields: [
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
      title: "Hide Image On Homepage",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "placement",
      title: "Homepage Placement",
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
      name: "featured",
      title: "Make Larger In Chaos Wall",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      description: "When this story was added.",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "isActive",
      title: "Active (visible on site)",
      type: "boolean",
      description: "Uncheck to hide this story without deleting it.",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "headline",
      subtitle: "placement",
      active: "isActive",
    },
    prepare({ title, subtitle, active }) {
      return {
        title: `${active ? "✅" : "🚫"} ${title}`,
        subtitle: subtitle?.toUpperCase(),
      };
    },
  },
});
