export default {
  eleventyComputed: {
    header_image: (data) => {
      // If header_image is an object with filename, extract it
      if (data.header_image && typeof data.header_image === 'object' && data.header_image.filename) {
        return data.header_image.filename;
      }
      // If header_image is an array, get first item's filename
      if (Array.isArray(data.header_image) && data.header_image.length > 0) {
        return data.header_image[0].filename || data.header_image[0];
      }
      // Otherwise return as-is (should be a string)
      return data.header_image;
    }
  }
};
