"use client";
import React, { useContext, useEffect } from "react";
import { use } from "react";
import I18NextContext from "@/helper/i18NextContext";

const AuthLayout = ({ children, params }) => {
  const { i18Lang, setI18Lang } = useContext(I18NextContext);
  const { lng } = use(params);

  useEffect(() => {
    if (i18Lang === "") {
      setI18Lang(lng);
    }
  }, [lng]);

  return (
    <section className="app-theme-login-section">
      <div className="app-theme-login-bg" aria-hidden="true" />
      <div className="app-theme-login-split">
        <div className="app-theme-login-left d-none d-lg-block">
          <div className="app-theme-login-hero" />
        </div>
        <div className="app-theme-login-right">
          <div className="app-theme-login-card app-theme-card">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthLayout;
