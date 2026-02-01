"use client";

type ErrorStateProps = {
  title?: string;
  message?: string;
  action?: React.ReactNode;
};

const ErrorState = ({
  title = "Something went wrong",
  message = "We could not load this section. Please try again.",
  action,
}: ErrorStateProps) => (
  <div className="border rounded p-4 bg-light">
    <h5 className="mb-2">{title}</h5>
    <p className="text-muted mb-3">{message}</p>
    {action}
  </div>
);

export default ErrorState;
