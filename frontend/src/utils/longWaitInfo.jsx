function LongWaitInfo({ serverIsDown }) {
  if (serverIsDown) {
    return (
      <main className="overlay-screen fixed w-full h-full flex items-center justify-center p-2 md:p-4 lg:p-6 xl:p-8 2xl:p-10">
        <div className="status-banner status-banner--error p-2 rounded">
          <p className="font-bold text-center">
            Server can't be reached after multiple attempts. Please try again
            later.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="overlay-screen fixed w-full h-full flex items-center justify-center p-2 md:p-4 lg:p-6 xl:p-8 2xl:p-10">
      <div className="status-banner status-banner--info p-2 rounded">
        <p className="font-bold text-center">
          Getting response from the server is taking longer than expected
          (server might be waking up). Please wait...
        </p>
      </div>
    </main>
  );
}

export { LongWaitInfo };
