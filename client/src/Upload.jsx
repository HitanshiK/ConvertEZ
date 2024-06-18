import React, { useState } from 'react';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Upload = () => {
  const [message, setMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setUploadProgress(0);
      const response = await axios.post('http://localhost:5000/upload', formData, {
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      setDownloadUrl(response.data.downloadUrl);
      setMessage('File converted successfully! Click the button to download.');
    } catch (error) {
      setMessage('Error converting file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex  justify-center min-h-screen">
      <div className="flex flex-col  items-center">
        <h2 className="mb-4 mt-8 text-3xl">Upload Word Document</h2>
        <input
          type="file"
          onChange={onFileChange}
          className="hidden"
          id="fileInput"
        />
        <label htmlFor="fileInput" className="bg-rose-500 text-2xl text-white py-4 px-8 rounded mt-4 cursor-pointer">
          Upload and Convert
        </label>
        {uploading && (
          <div className="mt-4 w-24 h-24">
            <CircularProgressbar
              value={uploadProgress}
              text={`${uploadProgress}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: `rgba(62, 152, 199, ${uploadProgress / 100})`,
                textColor: '#f88',
                trailColor: '#d6d6d6',
                backgroundColor: '#3e98c7',
              })}
            />
          </div>
        )}
        <p className="mt-4">{message}</p>
        {downloadUrl && (
          <button
            onClick={() => window.location.href = downloadUrl}
            className="bg-blue-500 text-white py-4 px-8 rounded mt-4 cursor-pointer"
          >
            Download PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default Upload;
