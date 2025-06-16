import Image from "next/image";
import Link from "next/link";
import React from "react";

const BlogItem = ({ blog }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="row mt_dec--30">
      <div className="col-lg-12">
        {blog && blog.length > 0 ? (
          <div className="row row--15">
            {blog.slice(0, 8).map((data) => (
              <div className="col-lg-6 col-md-6 col-12 mt--30" key={data.slug}>
                <div className="rainbow-card undefined">
                  <div className="inner">
                    <div className="thumbnail">
                      <Link className="image" href={`/blogs/${data.slug}`}>
                        <Image
                          src={data.mainImage}
                          width={413}
                          height={281}
                          alt={data.title}
                        />
                      </Link>
                    </div>
                    <div className="content">
                      <ul className="rainbow-meta-list">
                        <li>
                          <i className="fa-sharp fa-regular fa-calendar-days icon-left"></i>{" "}
                          <span className="me-5">{formatDate(data.publishedAt)}</span>
                        </li>
                        <li className="separator"></li>
                        <li className="catagory-meta">
                          <span>{data?.categories[0] || "Uncategorized"}</span>
                        </li>
                      </ul>
                      <h4 className="title">
                        <Link href={`/blogs/${data.slug}`}>
                          {data.title}
                        </Link>
                      </h4>
                      <p className="description">{data.excerpt}</p>
                      <Link className="btn-read-more border-transparent" href={`/blogs/${data.slug}`}>
                        <span>
                          Read More{" "}
                          <i className="fa-sharp fa-regular fa-arrow-right"></i>
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p>No blogs available at the moment. Please check back later!</p>
          </div>
        )}
      </div>
      {blog && blog.length > 0 && (
        <div className="col-lg-12 text-center">
          <div className="rainbow-load-more text-center mt--60">
            <button className="btn btn-default btn-icon">
              <span>
                View More Post
                <span className="icon">
                  <i className="feather-loader"></i>
                </span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogItem;