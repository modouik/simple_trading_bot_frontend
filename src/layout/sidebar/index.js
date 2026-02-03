import React, { useContext, useEffect, useState } from "react";
import dynamic from 'next/dynamic'
import LogoWrapper from "../../components/commonComponent/LogoWrapper";
import MENUITEMS from "./MenuData";
import AccountContext from "../../helper/accountContext";
const MenuList = dynamic(() => import("./MenuList"), {
  ssr: false,
})
const Sidebar = ({ sidebarOpen, setSidebarOpen, drawerOpen, setDrawerOpen }) => {
  const [activeMenu, setActiveMenu] = useState([]);
  const { role, setRole } = useContext(AccountContext)
  let storePermission = {};
  const ISSERVER = typeof window === "undefined";
  if (!ISSERVER) {
    try {
      const accountData = localStorage.getItem("account");
      if (accountData && accountData !== "undefined" && accountData !== "null") {
        storePermission = JSON.parse(accountData);
      }
    } catch (error) {
      console.error("Failed to parse account from localStorage:", error);
      storePermission = {};
    }
  }
  const [mounted, setMounted] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    try {
      const storedRole = localStorage.getItem("role");
      if (storedRole && storedRole !== "undefined" && storedRole !== "null") {
        const parsedRole = JSON.parse(storedRole);
        if (parsedRole && parsedRole.name) {
          setRole(parsedRole.name);
        }
      }
    } catch (error) {
      console.error("Failed to parse role from localStorage:", error);
      // Clear invalid role from localStorage
      localStorage.removeItem("role");
    }
  }, []);

  const closeDrawer = () => {
    if (setDrawerOpen) setDrawerOpen(false);
  };

  const sidebarContent = (
    <>
      <div id="sidebarEffect" />
      <div className={`${mounted ? 'skeleton-loader' : ""}`}>
        <LogoWrapper setSidebarOpen={setSidebarOpen} />
        <nav className="sidebar-main">
          <div id="sidebar-menu">
            <ul className="sidebar-links" id="simple-bar">
              <MenuList menu={MENUITEMS} level={0} activeMenu={activeMenu} setActiveMenu={setActiveMenu} key={role} />
            </ul>
          </div>
        </nav>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: fixed sidebar 260px */}
      <div className={`sidebar-wrapper app-theme-sidebar app-theme-sidebar-desktop ${sidebarOpen ? "close_icon" : ""}`}>
        {sidebarContent}
      </div>
      {/* Mobile: drawer overlay */}
      {typeof setDrawerOpen === "function" && (
        <>
          <div
            className={`app-theme-drawer-backdrop d-lg-none ${drawerOpen ? "open" : ""}`}
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <div className={`app-theme-drawer d-lg-none app-theme-sidebar ${drawerOpen ? "open" : ""}`}>
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom" style={{ borderColor: "var(--app-card-border)" }}>
              <span style={{ color: "var(--app-text)", fontWeight: 600 }}>Menu</span>
              <button type="button" className="btn btn-sm btn-link text-decoration-none" onClick={closeDrawer} aria-label="Close menu">✕</button>
            </div>
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;
