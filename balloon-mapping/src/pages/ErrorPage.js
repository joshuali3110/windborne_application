import React from "react";

function ErrorPage() {
  return (
    <main className="page">
      <div className="status status--error" role="alert">
        <span className="status__badge" aria-hidden="true">!</span>
        <h1 className="status__title">Balloon data is missing or corrupted.</h1>
      </div>
    </main>
  );
}

export default ErrorPage;
