import BackToTop from "../backToTop";
import BlogPage from "./index";

export const metadata = {
  title: "Blog - || AiWave - AI SaaS Website NEXTJS15 UI Kit",
  description: "AiWave - AI SaaS Website NEXTJS15 UI Kit",
};

const BlogLayout = () => {
  return (
    <>
      <BlogPage />
      <BackToTop />
    </>
  );
};

export default BlogLayout;
