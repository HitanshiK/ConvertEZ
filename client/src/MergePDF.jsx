// MergePDF.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const MergePDF = () => {
  const [message, setMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileCount, setFileCount] = useState(0);

  const onFilesChange = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setFileCount(files.length);

    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      const localUrl = 'http://localhost:5000';
      const productionUrl = 'https://convertez.onrender.com';

      // Select URL based on environment
      const apiUrl = process.env.NODE_ENV === 'production' ? productionUrl : localUrl;

      const response = await axios.post(`${apiUrl}/api/pdf/merge`, formData, {
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      setDownloadUrl(response.data.downloadUrl);
      setMessage('Files merged successfully! Click the button to download.');
    } catch (error) {
      setMessage('Error merging files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center mt-10 ">
      <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg">
        <h2 className="mb-4 text-3xl font-semibold">Merge PDF Files</h2>
        <input
          type="file"
          onChange={onFilesChange}
          className="hidden"
          id="fileInput"
          multiple
        />
        <label htmlFor="fileInput" className="bg-rose-500 text-2xl text-white py-4 px-8 rounded mt-4 cursor-pointer">
          Upload and Merge
        </label>
        <p className="mt-2 text-lg">{fileCount} {fileCount === 1 ? 'file' : 'files'} selected</p>
        {uploading && (
          <div className="mt-4 w-24 h-24">
            <CircularProgressbar
              value={uploadProgress}
              text={`${uploadProgress}%`}
              styles={buildStyles({
                textSize: '16px',
                fontWeight: 'bold',
                pathColor: `rgba(62, 152, 199, ${uploadProgress / 100})`,
                textColor: '#f88',
                trailColor: '#d6d6d6',
                backgroundColor: '#3e98c7',
              })}
            />
          </div>
        )}
        <p className="mt-4 text-lg">{message}</p>
        {downloadUrl && (
          <button
            onClick={() => window.location.href = downloadUrl}
            className="bg-blue-500 text-white py-4 px-8 rounded mt-4 cursor-pointer"
          >
            Download Merged PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default MergePDF;
