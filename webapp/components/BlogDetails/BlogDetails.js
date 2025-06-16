// components/SingleBlog.js
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Categories from "../Blog/BlogItems/Categories";
import BlogPost from "../Blog/BlogItems/BlogPost";
import Archives from "../Blog/BlogItems/Archives";
import BlogTags from "../Blog/BlogItems/BlogTags";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const BlogDetails = ({ blog }) => {
  const router = useRouter();

  useEffect(() => {
    if (!blog || !blog.slug) {
      router.push("/blog"); 
    }
  }, [blog, router]);

  if (!blog || !blog.slug) {
    return null;
  }

  return (
    <div className="rainbow-blog-section rainbow-section-gap-big bg-color-1">
      <div className="container">
        <div className="row row--30">
          <div className="col-lg-8">
            <div className="rainbow-blog-details-area">
              <div className="post-page-banner">
                <div className="container">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="content text-center">
                        <div className="thumbnail">
                          <Image
                            className="w-100 radius"
                            src={blog.mainImage}
                            width={790}
                            height={445}
                            alt={blog.title}
                          />
                        </div>
                        <ul className="rainbow-meta-list">
                          <li>
                            <i className="feather-user me-2"></i>
                            <a href="#">{blog.author}</a>
                          </li>
                          <li>
                            <i className="feather-calendar me-2"></i>
                            {formatDate(blog.publishedAt)}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="blog-details-content pt--40">
                <div className="container">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="content">
                        <h2 className="title">{blog.title}</h2>
                        <div
                          dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {blog.mainImage && (
                <div className="post-page-banner">
                  <div className="container">
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="content text-center">
                          <div className="thumbnail">
                            <Image
                              className="w-100 radius"
                              src={blog.mainImage}
                              width={790}
                              height={445}
                              alt={blog.title}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="blog-details-content pt--40 rainbow-section-gapBottom">
                <div className="container">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="content">
                        <p>{blog.excerpt}</p>

                        <div className="category-meta">
                          <span className="text me-2">Tags:</span>
                          <BlogTags tags={blog.keywords} />
                        </div>

                        <div className="rainbow-comment-form pt--60">
                          <div className="inner">
                            <div className="section-title">
                              <span className="subtitle">Have a Comment?</span>
                              <h2 className="title">Leave a Reply</h2>
                            </div>
                            <form className="mt--40">
                              <div className="row">
                                <div className="col-lg-6 col-md-12 col-12">
                                  <div className="rnform-group">
                                    <input type="text" placeholder="Name" />
                                  </div>
                                  <div className="rnform-group">
                                    <input type="email" placeholder="Email" />
                                  </div>
                                  <div className="rnform-group">
                                    <input type="text" placeholder="Website" />
                                  </div>
                                </div>
                                <div className="col-lg-6 col-md-12 col-12">
                                  <div className="rnform-group">
                                    <textarea placeholder="Comment"></textarea>
                                  </div>
                                </div>
                                <div className="col-lg-12">
                                  <div className="blog-btn">
                                    <a className="btn-default" href="#">
                                      <span>SEND MESSAGE</span>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4 mt_md--40 mt_sm--40">
            <aside className="rainbow-sidebar">
              <div className="rbt-single-widget widget_search mt--40">
                <div className="inner">
                  <form className="blog-search" action="#">
                    <input type="text" placeholder="Search ..." />
                    <button className="search-button">
                      <i className="feather-search"></i>
                    </button>
                  </form>
                </div>
              </div>
              <div className="rbt-single-widget widget_categories mt--40">
                <h3 className="title">Categories</h3>
                <Categories category={blog.categories} />
              </div>
              <div className="rbt-single-widget widget_recent_entries mt--40">
                <h3 className="title">Post</h3>
                <BlogPost blogpost={[]} /> {/* Placeholder: Update with blog posts */}
              </div>
              <div className="rbt-single-widget widget_archive mt--40">
                <h3 className="title">Archives</h3>
                <Archives blogarc={[]} /> {/* Placeholder: Update with archives */}
              </div>
              <div className="rbt-single-widget widget_tag_cloud mt--40">
                <h3 className="title me-2">Tags</h3>
                <BlogTags tags={blog.keywords} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;