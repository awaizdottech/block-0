import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const uploadOnCloud = async (localFilePath, blobName) => {
  try {
    if (!localFilePath) return null;
    // upload On cloud
    fs.unlinkSync(localFilePath);
    return "uploaded";
  } catch (error) {
    fs.unlinkSync(localFilePath);
    throw error;
  }
};

async function deleteFromCloud(blobName) {
  try {
    // delete from cloud
    return "deleted";
  } catch (error) {
    throw error;
  }
}

export { uploadOnCloud, deleteFromCloud };
