"use client";

type LoadingStateProps = {
  label?: string;
};

const LoadingState = ({ label = "Loading data..." }: LoadingStateProps) => (
  <div className="d-flex align-items-center justify-content-center py-5 text-muted">
    <span className="spinner-border spinner-border-sm me-2" />
    {label}
  </div>
);

export default LoadingState;
