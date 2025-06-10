import BackToTop from "@/app/backToTop";
import BlogDetailsPage from "../index";

export const metadata = {
  title: "Blog Details - || AiWave - AI SaaS Website NEXTJS15 UI Kit",
  description: "AiWave - AI SaaS Website NEXTJS15 UI Kit",
};

const BlogDetailsLayout = () => {
  return (
    <>
      <BlogDetailsPage />
      <BackToTop />
    </>
  );
};

export default BlogDetailsLayout;
