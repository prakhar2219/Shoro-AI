// lib/api/bulk.ts

import axios from "axios";

const API_BASE_URL = "/api/bulk"; // Adjust this to your actual API base URL

export async function bulkUploadEntities(entityType: string, data: any[]) {
  try {
    const response = await axios.post(`${API_BASE_URL}/${entityType}/bulk`, {
      data,
    });
    return response.data;
  } catch (error) {
    console.error("Bulk upload failed:", error);
    throw error;
  }
}
