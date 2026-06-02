import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { schemaTypes } from "./sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "replace-me";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "shutyourface",
  title: "ShutYourFace CMS",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
});
