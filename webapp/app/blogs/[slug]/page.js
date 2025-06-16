import BlogDetails from "@/components/BlogDetails/BlogDetails";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { fetchBlogBySlug } from "@/services/blog.service";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const blog = await fetchBlogBySlug(slug);
    if (blog) {
      return {
        title: blog.title || "Blog Details - AiWave",
        description: blog.excerpt || "Read the full blog on AiWave.",
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: "Blog Not Found - AiWave",
    description: "No blog found for this URL.",
  };
}

const BlogDetailsPage = async ({ params }) => {
  const { slug } = await params;

  let blog = {};
  try {
    const data = await fetchBlogBySlug(slug);
    // console.log("Fetched blog:", data);
    if (data?.slug) {
      blog = data;
    } else {
      console.log("No data found for slug:", slug);
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
  }

  return (
    <>
      <Breadcrumb title={blog?.title} text={blog?.slug} />
      <BlogDetails blog={blog} />
    </>
  );
};

export default BlogDetailsPage;
