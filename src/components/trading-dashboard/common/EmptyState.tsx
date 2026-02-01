"use client";

type EmptyStateProps = {
  title?: string;
  message?: string;
};

const EmptyState = ({
  title = "No data yet",
  message = "Once data is available, it will appear here.",
}: EmptyStateProps) => (
  <div className="border rounded p-4 bg-white">
    <h6 className="mb-2">{title}</h6>
    <p className="text-muted mb-0">{message}</p>
  </div>
);

export default EmptyState;
