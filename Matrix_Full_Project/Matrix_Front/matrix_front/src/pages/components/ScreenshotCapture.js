import React, { useState } from 'react';
import html2canvas from 'html2canvas';

const ScreenshotCapture = ({ children }) => {
  const [screenshot, setScreenshot] = useState(null);

  const handleCapture = async () => {
    const element = document.getElementById('capture-container');
    const canvas = await html2canvas(element, { useCORS: true, allowTaint: true });
    setScreenshot(canvas.toDataURL('image/png'));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = 'screenshot.png';
    link.href = screenshot;
    link.click();
  };

  return (
    <div>
      <button onClick={handleCapture}>Capture Screenshot</button>
      {screenshot && (
        <div>
          <img src={screenshot} alt="Captured Screenshot" />
          <button onClick={handleDownload}>Download Screenshot</button>
        </div>
      )}
      <div id="capture-container">{children}</div>
    </div>
  );
};

export default ScreenshotCapture;
