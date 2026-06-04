function Spinner() {
  const spinnerStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const spinnerImgStyle = {
    maxWidth: "40px",
    maxHeight: "40px",
    minWidth: "20px",
    minHeight: "20px",
    border: "3px solid #ccc",
    borderTop: "3px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "50px auto",
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={spinnerStyle}>
        <div style={spinnerImgStyle}></div>
      </div>
    </>
  );
}

export { Spinner };
