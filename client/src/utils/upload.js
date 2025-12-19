import axios from "axios";

const upload = async (file) => {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  data.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY);
  data.append("timestamp", Math.floor(Date.now() / 1000));
  data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

  try {
    console.log("Uploading to Cloudinary...");
    const res = await axios.post(import.meta.env.VITE_UPLOAD_LINK, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: false,
    });

    if (!res.data || !res.data.url) {
      throw new Error("Invalid response from Cloudinary");
    }

    console.log("Upload successful:", res.data.url);
    return res.data.url;
  } catch (err) {
    console.error("Upload error:", err.response?.data || err.message);
    throw new Error(`Upload failed: ${err.response?.data?.message || err.message}`);
  }
};

export default upload;
