"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Form, FormGroup, Input, Label } from "reactstrap";
import Btn from "@/elements/buttons/Btn";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const router = useRouter();
  const params = useParams();
  const lng = (params?.lng as string) || "en";
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (!result.ok && "error" in result) {
      setError(result.error);
      return;
    }
    router.replace(`/${lng}/dashboard`);
  };

  return (
    <div className="log-in-box">
      <div className="log-in-title">
        <h3>Welcome back</h3>
        <h4>Sign in to continue</h4>
      </div>
      <div className="input-box">
        <Form className="row g-4" onSubmit={handleSubmit}>
          <FormGroup className="col-12">
            <Label for="login-username">Username</Label>
            <Input
              id="login-username"
              name="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </FormGroup>
          <FormGroup className="col-12">
            <Label for="login-password">Password</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </FormGroup>
          {error ? (
            <div className="col-12">
              <p className="text-danger mb-0">{error}</p>
            </div>
          ) : null}
          <div className="col-12">
            <Btn
              title={loading ? "Signing in..." : "Sign In"}
              type="submit"
              className="btn btn-theme w-100"
              disabled={loading}
            />
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
