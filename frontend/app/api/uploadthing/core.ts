import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();
 
export const uploadRouter = {
  sickLeave: f(["image", "pdf"])
    .middleware(async () => {
      return { userId: "anonymous" };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete:", file);
      return { url: file.url };
    }),
} satisfies FileRouter;
 
export type UploadRouter = typeof uploadRouter;
