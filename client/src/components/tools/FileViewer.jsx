// client/src/components/tools/FileViewer.jsx

// Import the local image asset
import suspiciousImage from '/suspicious_image.jpg';
import './FileViewer.css';

// This component now only needs the fileData for its metadata (exif)
const FileViewer = ({ fileData }) => {
  return (
    <div className="file-viewer-container">
      <div className="file-content-panel">
        <div className="image-view">
          {/* Always render the imported suspiciousImage */}
          <img src={suspiciousImage} alt="Forensic evidence" />
        </div>
      </div>
      
      {/* Conditionally render the EXIF panel if exif data exists in the props */}
      {fileData?.exif && (
        <div className="file-metadata-panel">
          <h3>EXIF Metadata</h3>
          <div className="exif-grid">
            {Object.entries(fileData.exif).map(([key, value]) => (
              <div key={key} className="exif-item">
                <span className="exif-key">{key}</span>
                <span className="exif-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileViewer;