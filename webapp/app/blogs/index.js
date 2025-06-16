import Blog from "@/components/Blog/Blog";
import { fetchBlogs } from "@/services/blog.service";

const Blogs = async () => {
  let blogs = [];
  let categories = [];
  let tags = [];
  try {
    const data = await fetchBlogs();
    // console.log("Fetched blogs dataponse:", data);
    if (data) {
      blogs = data;
    } else if (Array.isArray(data)) {
      blogs = data;
    } else {
      console.log("No blogs found in response.");
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
  }
  return <Blog blogs={blogs} categories={categories} tags={tags} />;
};

export default Blogs;
