"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Form, FormGroup, Input, Label } from "reactstrap";
import { RiUserLine, RiLockLine, RiMailLine } from "react-icons/ri";
import { AUTH_SUBSCRIPTION_REQUIRED_EVENT } from "@/lib/auth/constants";
import { setTokens } from "@/lib/auth/tokenStore";

const SignupPage = () => {
  const router = useRouter();
  const params = useParams();
  const lng = (params?.lng as string) || "en";
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [saveUser, setSaveUser] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim() || undefined,
          password,
          save_user: saveUser,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 402) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent(AUTH_SUBSCRIPTION_REQUIRED_EVENT, {
              detail: { message: data?.message, redirect_url: data?.redirect_url },
            })
          );
        }
        setError(data?.message || "Subscription required.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(
          data?.message || data?.error || `Registration failed (${res.status}).`
        );
        setLoading(false);
        return;
      }

      if (data?.access_token && data?.expires_in) {
        setTokens(data.access_token, data.expires_in);
        router.replace(`/${lng}/dashboard`);
        return;
      }
      setError("Invalid response from server.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-theme-login-box">
      <div className="app-theme-login-title">
        <h3>Create account</h3>
        <h4>Sign up to get started</h4>
      </div>
      <div className="app-theme-input-box">
        <Form className="row g-4" onSubmit={handleSubmit}>
          <FormGroup className="col-12">
            <Label for="signup-username">Username</Label>
            <div className="app-theme-input-wrap">
              <span className="app-theme-input-icon" aria-hidden="true">
                <RiUserLine />
              </span>
              <Input
                id="signup-username"
                name="username"
                type="text"
                className="app-theme-input"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                maxLength={255}
              />
            </div>
          </FormGroup>
          <FormGroup className="col-12">
            <Label for="signup-email">Email (optional)</Label>
            <div className="app-theme-input-wrap">
              <span className="app-theme-input-icon" aria-hidden="true">
                <RiMailLine />
              </span>
              <Input
                id="signup-email"
                name="email"
                type="email"
                className="app-theme-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
              />
            </div>
          </FormGroup>
          <FormGroup className="col-12">
            <Label for="signup-password">Password</Label>
            <div className="app-theme-input-wrap">
              <span className="app-theme-input-icon" aria-hidden="true">
                <RiLockLine />
              </span>
              <Input
                id="signup-password"
                name="password"
                type="password"
                className="app-theme-input"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
          </FormGroup>
          <FormGroup className="col-12">
            <Label for="signup-password-confirm">Confirm password</Label>
            <div className="app-theme-input-wrap">
              <span className="app-theme-input-icon" aria-hidden="true">
                <RiLockLine />
              </span>
              <Input
                id="signup-password-confirm"
                name="password_confirm"
                type="password"
                className="app-theme-input"
                placeholder="Repeat password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={8}
              />
            </div>
          </FormGroup>
          <div className="col-12">
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
          {error ? (
            <div className="col-12">
              <p className="mb-0" style={{ color: "var(--app-danger)" }}>
                {error}
              </p>
            </div>
          ) : null}
          <div className="col-12">
            <button
              type="submit"
              className="btn w-100 app-theme-btn-primary py-2"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </div>
          <div className="col-12 text-center">
            <Link
              href={`/${lng}/login`}
              className="app-theme-link"
              style={{ fontSize: "0.9rem" }}
            >
              Already have an account? Sign in
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default SignupPage;
