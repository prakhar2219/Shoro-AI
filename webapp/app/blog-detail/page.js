"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const BlogLayout = () => {
  const path = useParams();
  const router = useRouter();
  const postId = path.blogId;

  useEffect(() => {
    if (postId === undefined) {
      router.push("/blog");
    }
  }, []);
};

export default BlogLayout;
