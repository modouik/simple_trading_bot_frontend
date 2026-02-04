"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Form, FormGroup, Input, Label } from "reactstrap";
import { RiUserLine, RiLockLine } from "react-icons/ri";
import { useAuth } from "@/context/AuthContext";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

const LoginPage = () => {
  const router = useRouter();
  const params = useParams();
  const lng = (params?.lng as string) || "en";
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [saveUser, setSaveUser] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Please complete the verification below.");
      return;
    }
    setLoading(true);
    const result = await login(username, password, turnstileToken ?? undefined);
    setLoading(false);
    if (!result.ok && "error" in result) {
      setError(result.error);
      return;
    }
    router.replace(`/${lng}/dashboard`);
  };

  return (
    <div className="app-theme-login-box">
      <div className="app-theme-login-title">
        <h3>Welcome back</h3>
        <h4>Sign in to continue</h4>
      </div>
      <div className="app-theme-input-box">
        <Form className="row g-4" onSubmit={handleSubmit}>
          <FormGroup className="col-12">
            <Label for="login-username">Username</Label>
            <div className="app-theme-input-wrap">
              <span className="app-theme-input-icon" aria-hidden="true">
                <RiUserLine />
              </span>
              <Input
                id="login-username"
                name="username"
                type="text"
                className="app-theme-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </FormGroup>
          <FormGroup className="col-12">
            <Label for="login-password">Password</Label>
            <div className="app-theme-input-wrap">
              <span className="app-theme-input-icon" aria-hidden="true">
                <RiLockLine />
              </span>
              <Input
                id="login-password"
                name="password"
                type="password"
                className="app-theme-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </FormGroup>
          <div className="col-12 d-flex flex-wrap gap-3 align-items-center">
            <label className="app-theme-toggle d-flex align-items-center gap-2 mb-0">
              <input
                type="checkbox"
                checked={offline}
                onChange={(e) => setOffline(e.target.checked)}
                className="app-theme-toggle-input"
              />
              <span className="app-theme-toggle-slider" />
              <span className="app-theme-toggle-label">Offline</span>
            </label>
            <label className="app-theme-toggle d-flex align-items-center gap-2 mb-0">
              <input
                type="checkbox"
                checked={saveUser}
                onChange={(e) => setSaveUser(e.target.checked)}
                className="app-theme-toggle-input"
              />
              <span className="app-theme-toggle-slider" />
              <span className="app-theme-toggle-label">Save User</span>
            </label>
          </div>
          {TURNSTILE_SITE_KEY ? (
            <div className="col-12">
              <TurnstileWidget
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
                theme="auto"
                size="normal"
                className="d-flex justify-content-center"
              />
            </div>
          ) : null}
          {error ? (
            <div className="col-12">
              <p className="mb-0" style={{ color: "var(--app-danger)" }}>{error}</p>
            </div>
          ) : null}
          <div className="col-12">
            <button
              type="submit"
              className="btn w-100 app-theme-btn-primary py-2"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </div>
          <div className="col-12 text-center">
            <Link
              href={`/${lng}/signup`}
              className="app-theme-link"
              style={{ fontSize: "0.9rem" }}
            >
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
