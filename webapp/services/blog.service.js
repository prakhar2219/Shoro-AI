import ApiService from '../lib/guest-axios';

const blogService = new ApiService('/blogs');

export async function fetchBlogs() {
    const response = await blogService.get();
    return response.data;
}

export async function fetchBlogBySlug(slug) {
    const response = await blogService.get(`/${slug}`, {
        next: { revalidate: 600 }
    });
    return response.data;
}