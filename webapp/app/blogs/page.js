import Breadcrumb from "@/components/Common/Breadcrumb";
import BackToTop from "../backToTop";
import BlogPage from "./index";

export const metadata = {
  title: "Blogs - || AiWave - AI SaaS Website NEXTJS15 UI Kit",
  description: "AiWave - AI SaaS Website NEXTJS15 UI Kit",
};

const BlogsPage = () => {
  return (
    <>
      <Breadcrumb title="Our Blogs" text="Blogs" />
      <BlogPage />
      <BackToTop />
    </>
  );
};

export default BlogsPage;
