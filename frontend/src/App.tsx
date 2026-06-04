import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div
      onClick={() => setCount(count + 1)}
      style={{
        cursor: "pointer",
        width: "100px",
        height: "100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid black",
      }}
    >
      {count}
    </div>
  );
}

export { App };
